# Cognito for the lawn sign tracker.
#
# Volunteers are pre-created from var.lawn_signs_authorized_users, so Cognito
# emails each one an invitation with a temporary password. Signing in with
# Google works for the same people because the PreSignUp trigger links the
# Google identity onto the existing account (see lambda/lawn_signs/pre_signup.py).
#
# Self-service sign-up is off. The only way to get an account is to be on that
# Terraform list.

locals {
  # Callback/logout targets. The app is served under /lawn-signs/ on the site.
  lawn_signs_callback_urls = concat(
    ["https://${var.domain_name}/lawn-signs/"],
    [for s in var.subdomains : "https://${s}/lawn-signs/"],
    [for o in var.lawn_signs_dev_origins : "${o}/lawn-signs/"],
  )

  lawn_signs_authorized_emails = [
    for u in var.lawn_signs_authorized_users : lower(trimspace(u.email))
  ]
}

# ── Google OAuth credentials ──────────────────────────────────────────────────
# Created out of band (see the README). Terraform only reads them so the secret
# never lands in this repo or in state as plaintext input.

data "aws_ssm_parameter" "google_client_id" {
  name = var.lawn_signs_google_client_id_param
}

data "aws_ssm_parameter" "google_client_secret" {
  name            = var.lawn_signs_google_client_secret_param
  with_decryption = true
}

# ── User pool ─────────────────────────────────────────────────────────────────

resource "aws_cognito_user_pool" "lawn_signs" {
  name = "katr-lawn-signs-${var.environment}"

  username_attributes      = ["email"]
  auto_verified_attributes = ["email"]

  # No self-service sign-up: accounts come from Terraform only.
  admin_create_user_config {
    allow_admin_create_user_only = true

    invite_message_template {
      email_subject = "Your KATR lawn sign tracker login"
      email_message = <<-EOT
        You've been added to the K'night at the Races lawn sign tracker.

        Sign in at https://${var.domain_name}/lawn-signs/

        Username: {username}
        Temporary password: {####}

        You can either set a password on first sign-in, or just use
        "Continue with Google" if that email is a Google account.
      EOT
      sms_message   = "KATR lawn signs — username {username}, temporary password {####}"
    }
  }

  password_policy {
    minimum_length                   = 8
    require_lowercase                = true
    require_numbers                  = true
    require_symbols                  = true
    require_uppercase                = true
    temporary_password_validity_days = 14
  }

  schema {
    name                = "email"
    attribute_data_type = "String"
    required            = true
    mutable             = true

    string_attribute_constraints {
      min_length = 1
      max_length = 256
    }
  }

  schema {
    name                = "name"
    attribute_data_type = "String"
    required            = true
    mutable             = true

    string_attribute_constraints {
      min_length = 1
      max_length = 256
    }
  }

  # Lets a volunteer who can't use Google reset their own password by email.
  account_recovery_setting {
    recovery_mechanism {
      name     = "verified_email"
      priority = 1
    }
  }

  email_configuration {
    email_sending_account = "COGNITO_DEFAULT"
  }

  user_pool_add_ons {
    advanced_security_mode = "AUDIT"
  }

  lambda_config {
    pre_sign_up = aws_lambda_function.lawn_signs_pre_signup.arn
  }

  tags = {
    Name        = "KATR Lawn Signs Users"
    Application = "KATR Lawn Signs Tracker"
  }
}

resource "aws_cognito_user_pool_domain" "lawn_signs" {
  domain       = "katr-lawn-signs-${var.environment}"
  user_pool_id = aws_cognito_user_pool.lawn_signs.id
}

# Public SPA client — no client secret, authorization-code + PKCE.
resource "aws_cognito_user_pool_client" "lawn_signs_app" {
  name         = "katr-lawn-signs-app"
  user_pool_id = aws_cognito_user_pool.lawn_signs.id

  generate_secret = false

  id_token_validity      = 60
  access_token_validity  = 60
  refresh_token_validity = 30

  token_validity_units {
    id_token      = "minutes"
    access_token  = "minutes"
    refresh_token = "days"
  }

  allowed_oauth_flows_user_pool_client = true
  allowed_oauth_flows                  = ["code"]
  allowed_oauth_scopes                 = ["email", "openid", "profile"]

  callback_urls = local.lawn_signs_callback_urls
  logout_urls   = local.lawn_signs_callback_urls

  supported_identity_providers = ["COGNITO", "Google"]

  enable_token_revocation       = true
  prevent_user_existence_errors = "ENABLED"

  read_attributes  = ["email", "email_verified", "name"]
  write_attributes = ["email", "name"]

  explicit_auth_flows = [
    "ALLOW_USER_SRP_AUTH",
    "ALLOW_REFRESH_TOKEN_AUTH",
  ]

  # The IdP must exist before the client can list it as supported.
  depends_on = [aws_cognito_identity_provider.google]
}

# ── Google identity provider ──────────────────────────────────────────────────

resource "aws_cognito_identity_provider" "google" {
  user_pool_id  = aws_cognito_user_pool.lawn_signs.id
  provider_name = "Google"
  provider_type = "Google"

  provider_details = {
    authorize_scopes              = "openid email profile"
    client_id                     = data.aws_ssm_parameter.google_client_id.value
    client_secret                 = data.aws_ssm_parameter.google_client_secret.value
    attributes_url                = "https://people.googleapis.com/v1/people/me?personFields="
    attributes_url_add_attributes = true
    authorize_url                 = "https://accounts.google.com/o/oauth2/v2/auth"
    oidc_issuer                   = "https://accounts.google.com"
    token_request_method          = "POST"
    token_url                     = "https://www.googleapis.com/oauth2/v4/token"
  }

  attribute_mapping = {
    email    = "email"
    name     = "name"
    username = "sub"
  }
}

# ── Groups ────────────────────────────────────────────────────────────────────

resource "aws_cognito_user_group" "lawn_signs_volunteer" {
  name         = "volunteer"
  user_pool_id = aws_cognito_user_pool.lawn_signs.id
  description  = "Can place, collect and view lawn signs"
  precedence   = 10
}

resource "aws_cognito_user_group" "lawn_signs_admin" {
  name         = "admin"
  user_pool_id = aws_cognito_user_pool.lawn_signs.id
  description  = "Event organizers — full access including exports"
  precedence   = 1
}

# ── Authorized volunteers ─────────────────────────────────────────────────────
# Edit var.lawn_signs_authorized_users to add or remove people, then apply.
# Removing someone here deletes their account and revokes access.

resource "aws_cognito_user" "lawn_signs" {
  for_each = {
    for u in var.lawn_signs_authorized_users : lower(trimspace(u.email)) => u
  }

  user_pool_id = aws_cognito_user_pool.lawn_signs.id
  username     = each.key

  attributes = {
    email          = each.key
    name           = each.value.name
    email_verified = true
  }

  desired_delivery_mediums = ["EMAIL"]

  lifecycle {
    ignore_changes = [
      # Terraform would otherwise re-send an invite whenever the temp password
      # expires; re-invite deliberately with `tofu taint` instead.
      temporary_password,

      # Cognito writes `identities` itself when the PreSignUp trigger links a
      # Google login onto this account. It isn't ours to manage — left
      # unignored, every plan tries to delete it and unlink the user's Google
      # sign-in.
      attributes["identities"],
    ]
  }
}

resource "aws_cognito_user_in_group" "lawn_signs" {
  for_each = {
    for u in var.lawn_signs_authorized_users : lower(trimspace(u.email)) => u
  }

  user_pool_id = aws_cognito_user_pool.lawn_signs.id
  username     = aws_cognito_user.lawn_signs[each.key].username
  group_name = (
    each.value.admin
    ? aws_cognito_user_group.lawn_signs_admin.name
    : aws_cognito_user_group.lawn_signs_volunteer.name
  )
}
