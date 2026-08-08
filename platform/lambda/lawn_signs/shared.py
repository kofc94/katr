"""Shared helpers for the lawn-signs API Lambdas.

Only depends on boto3, which is present in the Python 3.11 Lambda runtime, so
these functions need no dependency layer.
"""

import json
import logging
import os
import traceback
from dataclasses import dataclass, field
from datetime import datetime, timezone
from decimal import Decimal
from typing import Any, Dict, List, Optional

import boto3
from botocore.config import Config

logger = logging.getLogger()
logger.setLevel(logging.INFO)

SIGNS_TABLE = os.environ["SIGNS_TABLE"]
PHOTO_BUCKET = os.environ["PHOTO_BUCKET"]
EVENT_ID = os.environ.get("EVENT_ID", "katr-2026")

# Presigned URLs must be SigV4 for the browser PUT to validate.
_s3 = boto3.client("s3", config=Config(signature_version="s3v4"))
_dynamodb = boto3.resource("dynamodb")

UPLOAD_URL_TTL_SECONDS = 300  # 5 min — long enough to upload, short enough to leak safely
VIEW_URL_TTL_SECONDS = 3600  # 1 hour — photos are re-signed on every list call


def table():
    return _dynamodb.Table(SIGNS_TABLE)


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


class DecimalEncoder(json.JSONEncoder):
    """DynamoDB returns numbers as Decimal, which json can't serialise."""

    def default(self, obj: Any) -> Any:
        if isinstance(obj, Decimal):
            return float(obj) if obj % 1 else int(obj)
        return super().default(obj)


def get_response(status_code: int, body: Dict[str, Any]) -> Dict[str, Any]:
    if status_code >= 400:
        logger.error("Error response %s: %s", status_code, body)

    return {
        "statusCode": status_code,
        "headers": {"Content-Type": "application/json"},
        "body": json.dumps(body, cls=DecimalEncoder),
    }


def handle_exception(e: Exception) -> Dict[str, Any]:
    logger.error("Unhandled exception: %s", traceback.format_exc())
    body: Dict[str, Any] = {"error": "Internal server error"}
    if os.environ.get("DEBUG") == "true":
        body["details"] = f"{type(e).__name__}: {e}"
    return get_response(500, body)


@dataclass
class UserContext:
    sub: str
    email: Optional[str] = None
    name: Optional[str] = None
    groups: List[str] = field(default_factory=list)


def get_user_from_context(event: Dict[str, Any]) -> UserContext:
    """Read the caller's identity from the API Gateway JWT authorizer claims.

    The authorizer has already verified the signature, issuer and audience, so
    these claims are trustworthy — but only because every route requires it.
    """
    claims = (
        event.get("requestContext", {})
        .get("authorizer", {})
        .get("jwt", {})
        .get("claims", {})
    )
    if not claims:
        raise PermissionError("No JWT claims on request")

    raw_groups = claims.get("cognito:groups", [])
    if isinstance(raw_groups, str):
        # API Gateway flattens the list claim into "[a b]" or "a,b".
        raw_groups = raw_groups.strip("[]").replace(",", " ").split()

    return UserContext(
        sub=claims["sub"],
        email=claims.get("email"),
        name=claims.get("name") or claims.get("cognito:username"),
        groups=list(raw_groups),
    )


def photo_key(sign_id: str, extension: str = "jpg") -> str:
    return f"lawn-signs/{EVENT_ID}/{sign_id}.{extension}"


def presign_put(key: str, content_type: str) -> str:
    return _s3.generate_presigned_url(
        "put_object",
        Params={"Bucket": PHOTO_BUCKET, "Key": key, "ContentType": content_type},
        ExpiresIn=UPLOAD_URL_TTL_SECONDS,
    )


def presign_get(key: str) -> str:
    return _s3.generate_presigned_url(
        "get_object",
        Params={"Bucket": PHOTO_BUCKET, "Key": key},
        ExpiresIn=VIEW_URL_TTL_SECONDS,
    )


def with_photo_url(item: Dict[str, Any]) -> Dict[str, Any]:
    """Swap the stored S3 key for a short-lived signed URL.

    The bucket is private, so the frontend never receives a durable photo URL —
    it gets a fresh signed one each time it lists signs.
    """
    key = item.get("s3Key")
    if key:
        item = {**item, "photoUrl": presign_get(key)}
    return item
