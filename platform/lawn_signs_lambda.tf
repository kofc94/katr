# Lambda functions backing the lawn sign API.
#
# All five handlers ship in one zip and share one role. They depend only on
# boto3, which the python3.11 runtime already provides, so there's no layer.

data "aws_caller_identity" "current" {}

data "archive_file" "lawn_signs_api" {
  type        = "zip"
  source_dir  = "${path.module}/lambda/lawn_signs"
  output_path = "${path.module}/build/lawn-signs-api.zip"
}

# ── Execution role ────────────────────────────────────────────────────────────

resource "aws_iam_role" "lawn_signs_lambda" {
  name = "katr-lawn-signs-lambda-${var.environment}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Action    = "sts:AssumeRole"
      Principal = { Service = "lambda.amazonaws.com" }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "lawn_signs_lambda_basic" {
  role       = aws_iam_role.lawn_signs_lambda.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# This role is the only identity that can reach the table or the bucket, and it
# is scoped to exactly the actions the five handlers perform.
resource "aws_iam_role_policy" "lawn_signs_lambda" {
  name = "katr-lawn-signs-lambda-permissions"
  role = aws_iam_role.lawn_signs_lambda.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "SignRecords"
        Effect = "Allow"
        Action = [
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:UpdateItem",
          "dynamodb:Query",
          "dynamodb:Scan",
        ]
        Resource = [
          aws_dynamodb_table.lawn_signs.arn,
          "${aws_dynamodb_table.lawn_signs.arn}/index/*",
        ]
      },
      {
        Sid    = "SignPhotos"
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:PutObject",
        ]
        # Confined to this event's prefix — a presigned URL can never be minted
        # for anything outside it.
        Resource = "${aws_s3_bucket.lawn_signs_photos.arn}/lawn-signs/*"
      },
    ]
  })
}

# The PreSignUp trigger needs to look up and link users, which the API handlers
# must not be able to do — so it gets its own role.
resource "aws_iam_role" "lawn_signs_pre_signup" {
  name = "katr-lawn-signs-presignup-${var.environment}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Action    = "sts:AssumeRole"
      Principal = { Service = "lambda.amazonaws.com" }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "lawn_signs_pre_signup_basic" {
  role       = aws_iam_role.lawn_signs_pre_signup.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_role_policy" "lawn_signs_pre_signup" {
  name = "katr-lawn-signs-presignup-permissions"
  role = aws_iam_role.lawn_signs_pre_signup.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Action = [
        "cognito-idp:ListUsers",
        "cognito-idp:AdminLinkProviderForUser",
      ]
      Resource = aws_cognito_user_pool.lawn_signs.arn
    }]
  })
}

# ── API handlers ──────────────────────────────────────────────────────────────

locals {
  lawn_signs_lambda_env = {
    SIGNS_TABLE  = aws_dynamodb_table.lawn_signs.name
    PHOTO_BUCKET = aws_s3_bucket.lawn_signs_photos.id
    EVENT_ID     = "katr-${var.current_year}"
  }

  lawn_signs_handlers = {
    list_signs        = { handler = "list_signs.handler", timeout = 15 }
    create_sign       = { handler = "create_sign.handler", timeout = 10 }
    update_sign       = { handler = "update_sign.handler", timeout = 10 }
    create_upload_url = { handler = "create_upload_url.handler", timeout = 10 }
  }
}

resource "aws_lambda_function" "lawn_signs_api" {
  for_each = local.lawn_signs_handlers

  function_name    = "katr-lawn-signs-${replace(each.key, "_", "-")}"
  role             = aws_iam_role.lawn_signs_lambda.arn
  filename         = data.archive_file.lawn_signs_api.output_path
  source_code_hash = data.archive_file.lawn_signs_api.output_base64sha256
  handler          = each.value.handler
  runtime          = "python3.11"
  timeout          = each.value.timeout
  memory_size      = 256

  environment {
    variables = local.lawn_signs_lambda_env
  }
}

resource "aws_cloudwatch_log_group" "lawn_signs_lambda" {
  for_each = local.lawn_signs_handlers

  name              = "/aws/lambda/${aws_lambda_function.lawn_signs_api[each.key].function_name}"
  retention_in_days = var.log_retention_days
}

# ── Cognito PreSignUp trigger ─────────────────────────────────────────────────

resource "aws_lambda_function" "lawn_signs_pre_signup" {
  function_name    = "katr-lawn-signs-pre-signup"
  role             = aws_iam_role.lawn_signs_pre_signup.arn
  filename         = data.archive_file.lawn_signs_api.output_path
  source_code_hash = data.archive_file.lawn_signs_api.output_base64sha256
  handler          = "pre_signup.handler"
  runtime          = "python3.11"
  timeout          = 10
  memory_size      = 256

  environment {
    variables = {
      AUTHORIZED_EMAILS = join(",", local.lawn_signs_authorized_emails)
    }
  }
}

resource "aws_cloudwatch_log_group" "lawn_signs_pre_signup" {
  name              = "/aws/lambda/${aws_lambda_function.lawn_signs_pre_signup.function_name}"
  retention_in_days = var.log_retention_days
}

resource "aws_lambda_permission" "lawn_signs_pre_signup" {
  statement_id  = "AllowCognitoInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.lawn_signs_pre_signup.function_name
  principal     = "cognito-idp.amazonaws.com"
  source_arn    = aws_cognito_user_pool.lawn_signs.arn
}
