"""PATCH /signs/{id} — move a sign between placed / collected / missing."""

import json
from typing import Any, Dict

from shared import (
    get_response,
    get_user_from_context,
    handle_exception,
    now_iso,
    table,
    with_photo_url,
)

VALID_STATUSES = {"placed", "collected", "missing"}
MAX_NOTES_LEN = 1000


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    try:
        user = get_user_from_context(event)

        sign_id = event.get("pathParameters", {}).get("id")
        if not sign_id:
            return get_response(400, {"error": "Sign id is required in the path"})

        body = json.loads(event.get("body") or "{}")
        status = (body.get("status") or "").strip().lower()
        if status not in VALID_STATUSES:
            return get_response(
                400, {"error": f"status must be one of {sorted(VALID_STATUSES)}"}
            )

        # Reopening a sign clears the resolution timestamp.
        resolved_at = now_iso() if status in ("collected", "missing") else None

        names = {"#st": "status"}
        values = {
            ":st": status,
            ":at": resolved_at,
            ":by": user.name or user.email or user.sub,
        }
        expression = "SET #st = :st, collectedAt = :at, resolvedBy = :by"

        if "notes" in body:
            expression += ", notes = :notes"
            values[":notes"] = (body.get("notes") or "")[:MAX_NOTES_LEN]

        result = table().update_item(
            Key={"id": sign_id},
            UpdateExpression=expression,
            ExpressionAttributeNames=names,
            ExpressionAttributeValues=values,
            ConditionExpression="attribute_exists(id)",
            ReturnValues="ALL_NEW",
        )

        return get_response(200, {"sign": with_photo_url(result["Attributes"])})

    except PermissionError as e:
        return get_response(401, {"error": str(e)})
    except json.JSONDecodeError:
        return get_response(400, {"error": "Malformed JSON body"})
    except Exception as e:  # noqa: BLE001
        if type(e).__name__ == "ConditionalCheckFailedException":
            return get_response(404, {"error": "No sign with that id"})
        return handle_exception(e)
