"""Cognito PreSignUp trigger — enforce the allowlist and link Google logins.

Two jobs:

1. **Gate.** Only emails on the Terraform-managed allowlist may end up with an
   account. Self-service sign-up is already disabled on the pool, but Google
   federation would otherwise create an account for anyone with a Google
   address, so the check has to live here.

2. **Link.** Volunteers are pre-created as native Cognito users so they receive
   an invitation email. When one of them later signs in with Google, Cognito
   would create a *second*, separate account for the same person. Linking the
   Google identity onto the existing native user keeps it as one account with
   one sub, so their signs stay attributed correctly either way.
"""

import logging
import os
from typing import Any, Dict, Optional

import boto3

logger = logging.getLogger()
logger.setLevel(logging.INFO)

_idp = boto3.client("cognito-idp")

# Comma-separated, lowercased at deploy time by Terraform.
AUTHORIZED_EMAILS = {
    e.strip().lower()
    for e in os.environ.get("AUTHORIZED_EMAILS", "").split(",")
    if e.strip()
}


def find_native_user(user_pool_id: str, email: str) -> Optional[str]:
    """Return the username of a non-federated user with this email, if any."""
    response = _idp.list_users(
        UserPoolId=user_pool_id,
        Filter=f'email = "{email}"',
        Limit=10,
    )
    for user in response.get("Users", []):
        username = user["Username"]
        # Federated usernames are prefixed by the provider, e.g. "Google_1234".
        if not username.lower().startswith("google_"):
            return username
    return None


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    trigger = event.get("triggerSource", "")
    user_pool_id = event["userPoolId"]
    attributes = event["request"]["userAttributes"]
    email = (attributes.get("email") or "").strip().lower()

    logger.info("PreSignUp trigger=%s email=%s", trigger, email)

    # Terraform-created users are trusted by definition.
    if trigger == "PreSignUp_AdminCreateUser":
        return event

    if not email:
        raise Exception("An email address is required to sign in.")

    if email not in AUTHORIZED_EMAILS:
        # Cognito surfaces this message to the user, so keep it actionable
        # without confirming whether the address exists anywhere.
        raise Exception(
            "This account is not authorized for the KATR lawn sign tracker. "
            "Ask an event organizer to add you."
        )

    if trigger == "PreSignUp_ExternalProvider":
        native_username = find_native_user(user_pool_id, email)
        if native_username:
            # userName looks like "Google_115582...", split into provider + id.
            provider_name, _, provider_user_id = event["userName"].partition("_")
            _idp.admin_link_provider_for_user(
                UserPoolId=user_pool_id,
                DestinationUser={
                    "ProviderName": "Cognito",
                    "ProviderAttributeValue": native_username,
                },
                SourceUser={
                    "ProviderName": provider_name,
                    "ProviderAttributeName": "Cognito_Subject",
                    "ProviderAttributeValue": provider_user_id,
                },
            )
            logger.info("Linked %s to native user %s", event["userName"], native_username)

        event["response"]["autoConfirmUser"] = True
        event["response"]["autoVerifyEmail"] = True

    return event
