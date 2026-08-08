"""POST /signs — record a placed lawn sign after its photo is uploaded."""

import json
from decimal import Decimal
from typing import Any, Dict, Optional

from shared import (
    EVENT_ID,
    PHOTO_BUCKET,
    get_response,
    get_user_from_context,
    handle_exception,
    now_iso,
    table,
    with_photo_url,
)

MAX_ADDRESS_LEN = 300
MAX_NOTES_LEN = 1000


def coord(value: Any, lo: float, hi: float) -> Optional[Decimal]:
    """DynamoDB stores floats as Decimal; reject out-of-range junk."""
    if value is None or value == "":
        return None
    number = float(value)
    if not lo <= number <= hi:
        raise ValueError(f"Coordinate {number} outside [{lo}, {hi}]")
    return Decimal(str(round(number, 6)))


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    try:
        user = get_user_from_context(event)
        body = json.loads(event.get("body") or "{}")

        sign_id = (body.get("id") or "").strip()
        address = (body.get("address") or "").strip()
        s3_key = (body.get("s3Key") or "").strip()

        if not sign_id:
            return get_response(400, {"error": "id is required"})
        if not address:
            return get_response(400, {"error": "address is required"})
        if not s3_key.startswith(f"lawn-signs/{EVENT_ID}/"):
            # Stops a caller from pointing a record at somebody else's object.
            return get_response(400, {"error": "s3Key is outside this event's prefix"})

        item = {
            "id": sign_id,
            "eventId": EVENT_ID,
            "address": address[:MAX_ADDRESS_LEN],
            "latitude": coord(body.get("latitude"), -90, 90),
            "longitude": coord(body.get("longitude"), -180, 180),
            "s3Bucket": PHOTO_BUCKET,
            "s3Key": s3_key,
            "status": "placed",
            "placedAt": now_iso(),
            "placedBy": user.name or user.email or user.sub,
            "placedBySub": user.sub,
            "collectedAt": None,
            "notes": (body.get("notes") or "")[:MAX_NOTES_LEN],
        }

        # Reject a replay that would overwrite an existing sign record.
        table().put_item(
            Item=item, ConditionExpression="attribute_not_exists(id)"
        )

        return get_response(201, {"sign": with_photo_url(item)})

    except PermissionError as e:
        return get_response(401, {"error": str(e)})
    except (ValueError, TypeError) as e:
        return get_response(400, {"error": str(e)})
    except json.JSONDecodeError:
        return get_response(400, {"error": "Malformed JSON body"})
    except Exception as e:  # noqa: BLE001
        if type(e).__name__ == "ConditionalCheckFailedException":
            return get_response(409, {"error": "A sign with that id already exists"})
        return handle_exception(e)
