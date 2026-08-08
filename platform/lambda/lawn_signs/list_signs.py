"""GET /signs — return every sign for the event, with signed photo URLs."""

from typing import Any, Dict

from shared import (
    EVENT_ID,
    get_response,
    get_user_from_context,
    handle_exception,
    table,
    with_photo_url,
)


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    try:
        get_user_from_context(event)  # Any signed-in volunteer may read the list.

        # A Scan is correct here: the UI shows all statuses at once, and the
        # table holds a few hundred signs per event at most. Paginate anyway so
        # a large event can't silently truncate at the 1 MB page limit.
        items = []
        kwargs: Dict[str, Any] = {
            "FilterExpression": "eventId = :e",
            "ExpressionAttributeValues": {":e": EVENT_ID},
        }
        while True:
            page = table().scan(**kwargs)
            items.extend(page.get("Items", []))
            last_key = page.get("LastEvaluatedKey")
            if not last_key:
                break
            kwargs["ExclusiveStartKey"] = last_key

        items.sort(key=lambda s: s.get("placedAt", ""), reverse=True)
        return get_response(200, {"signs": [with_photo_url(i) for i in items]})

    except PermissionError as e:
        return get_response(401, {"error": str(e)})
    except Exception as e:  # noqa: BLE001 - surfaced as a 500 with a request id
        return handle_exception(e)
