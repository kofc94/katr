# HTTP API for the lawn sign tracker.
#
# Every route requires a valid Cognito ID token. API Gateway verifies the JWT
# signature, issuer and audience before the Lambda ever runs, so handlers can
# trust the claims they read.

resource "aws_apigatewayv2_api" "lawn_signs" {
  name          = "katr-lawn-signs-api"
  protocol_type = "HTTP"
  description   = "Lawn sign placement and collection API"

  cors_configuration {
    allow_origins     = local.lawn_signs_origins
    allow_methods     = ["GET", "POST", "PATCH", "OPTIONS"]
    allow_headers     = ["Content-Type", "Authorization"]
    max_age           = 300
    allow_credentials = false
  }

  tags = {
    Name        = "KATR Lawn Signs API"
    Application = "KATR Lawn Signs Tracker"
  }
}

resource "aws_apigatewayv2_authorizer" "lawn_signs_cognito" {
  api_id           = aws_apigatewayv2_api.lawn_signs.id
  authorizer_type  = "JWT"
  identity_sources = ["$request.header.Authorization"]
  name             = "lawn-signs-cognito"

  jwt_configuration {
    audience = [aws_cognito_user_pool_client.lawn_signs_app.id]
    issuer   = "https://cognito-idp.${var.aws_region}.amazonaws.com/${aws_cognito_user_pool.lawn_signs.id}"
  }
}

resource "aws_cloudwatch_log_group" "lawn_signs_api" {
  name              = "/aws/apigateway/katr-lawn-signs"
  retention_in_days = var.log_retention_days
}

resource "aws_apigatewayv2_stage" "lawn_signs" {
  api_id      = aws_apigatewayv2_api.lawn_signs.id
  name        = "$default"
  auto_deploy = true

  access_log_settings {
    destination_arn = aws_cloudwatch_log_group.lawn_signs_api.arn
    format = jsonencode({
      requestId      = "$context.requestId"
      ip             = "$context.identity.sourceIp"
      requestTime    = "$context.requestTime"
      routeKey       = "$context.routeKey"
      status         = "$context.status"
      responseLength = "$context.responseLength"
      userSub        = "$context.authorizer.claims.sub"
      errorMessage   = "$context.error.message"
    })
  }

  default_route_settings {
    # A handful of volunteers; this is abuse protection, not capacity planning.
    throttling_burst_limit = 20
    throttling_rate_limit  = 40
  }
}

# ── Routes ────────────────────────────────────────────────────────────────────

locals {
  lawn_signs_routes = {
    "GET /signs"             = "list_signs"
    "POST /signs"            = "create_sign"
    "PATCH /signs/{id}"      = "update_sign"
    "POST /signs/upload-url" = "create_upload_url"
  }
}

resource "aws_apigatewayv2_integration" "lawn_signs" {
  for_each = local.lawn_signs_routes

  api_id                 = aws_apigatewayv2_api.lawn_signs.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.lawn_signs_api[each.value].invoke_arn
  integration_method     = "POST"
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "lawn_signs" {
  for_each = local.lawn_signs_routes

  api_id    = aws_apigatewayv2_api.lawn_signs.id
  route_key = each.key
  target    = "integrations/${aws_apigatewayv2_integration.lawn_signs[each.key].id}"

  authorization_type = "JWT"
  authorizer_id      = aws_apigatewayv2_authorizer.lawn_signs_cognito.id
}

resource "aws_lambda_permission" "lawn_signs_api" {
  for_each = local.lawn_signs_handlers

  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.lawn_signs_api[each.key].function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.lawn_signs.execution_arn}/*/*"
}
