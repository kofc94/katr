"""POST /signs/upload-url — mint a short-lived presigned S3 PUT for one photo.

The browser uploads the image bytes straight to S3 with this URL. No AWS
credential ever reaches the client, and the URL is scoped to a single key,
a single content type, and five minutes.
"""

import json
import uuid
from datetime import datetime, timezone
from typing import Any, Dict

from shared import (
    get_response,
    get_user_from_context,
    handle_exception,
    photo_key,
    presign_put,
)

ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp"}
EXTENSIONS = {"image/jpeg": "jpg", "image/png": "png", "image/webp": "webp"}


def new_sign_id() -> str:
    # Time-prefixed so ids sort chronologically in the console and in S3.
    stamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%S")
    return f"sign_{stamp}_{uuid.uuid4().hex[:8]}"


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    try:
        get_user_from_context(event)

        body = json.loads(event.get("body") or "{}")
        content_type = (body.get("contentType") or "image/jpeg").lower()

        if content_type not in ALLOWED_CONTENT_TYPES:
            return get_response(
                400,
                {
                    "error": "Unsupported image type",
                    "allowed": sorted(ALLOWED_CONTENT_TYPES),
                },
            )

        sign_id = new_sign_id()
        key = photo_key(sign_id, EXTENSIONS[content_type])

        return get_response(
            200,
            {
                "signId": sign_id,
                "s3Key": key,
                "uploadUrl": presign_put(key, content_type),
                "contentType": content_type,
            },
        )

    except PermissionError as e:
        return get_response(401, {"error": str(e)})
    except json.JSONDecodeError:
        return get_response(400, {"error": "Malformed JSON body"})
    except Exception as e:  # noqa: BLE001
        return handle_exception(e)
