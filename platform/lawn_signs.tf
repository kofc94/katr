# Storage for the Event Lawn Signs Tracker app.
#
# The photo bucket is private. Browsers never touch it with credentials — the
# API hands out short-lived presigned URLs (PUT to upload, GET to view), which
# is why CORS has to allow PUT from the app's origins.

locals {
  lawn_signs_name = "katr-lawn-signs-${var.environment}"
  lawn_signs_origins = concat(
    ["https://${var.domain_name}"],
    [for s in var.subdomains : "https://${s}"],
    var.lawn_signs_dev_origins,
  )
}

# ── DynamoDB ──────────────────────────────────────────────────────────────────

resource "aws_dynamodb_table" "lawn_signs" {
  name         = "LawnSigns"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "id"

  attribute {
    name = "id"
    type = "S"
  }

  attribute {
    name = "status"
    type = "S"
  }

  # Query active vs collected signs without scanning the whole table.
  global_secondary_index {
    name            = "StatusIndex"
    hash_key        = "status"
    projection_type = "ALL"
  }

  point_in_time_recovery {
    enabled = true
  }

  tags = {
    Name        = "KATR Lawn Signs"
    Application = "KATR Lawn Signs Tracker"
  }
}

# ── Photo bucket ──────────────────────────────────────────────────────────────

resource "aws_s3_bucket" "lawn_signs_photos" {
  bucket        = local.lawn_signs_name
  force_destroy = false

  tags = {
    Name        = "KATR Lawn Sign Photos"
    Application = "KATR Lawn Signs Tracker"
  }
}

resource "aws_s3_bucket_public_access_block" "lawn_signs_photos" {
  bucket = aws_s3_bucket.lawn_signs_photos.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_server_side_encryption_configuration" "lawn_signs_photos" {
  bucket = aws_s3_bucket.lawn_signs_photos.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# Only the presigned-URL flow needs cross-origin access, and only for the
# upload. GET is presigned too but browsers fetch those as plain <img> loads.
resource "aws_s3_bucket_cors_configuration" "lawn_signs_photos" {
  bucket = aws_s3_bucket.lawn_signs_photos.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["PUT", "GET", "HEAD"]
    allowed_origins = local.lawn_signs_origins
    expose_headers  = ["ETag"]
    max_age_seconds = 3000
  }
}

# Reject any object that somehow arrives unencrypted or over plain HTTP.
resource "aws_s3_bucket_policy" "lawn_signs_photos" {
  bucket = aws_s3_bucket.lawn_signs_photos.id
  policy = data.aws_iam_policy_document.lawn_signs_photos.json

  depends_on = [aws_s3_bucket_public_access_block.lawn_signs_photos]
}

data "aws_iam_policy_document" "lawn_signs_photos" {
  statement {
    sid     = "DenyInsecureTransport"
    effect  = "Deny"
    actions = ["s3:*"]

    resources = [
      aws_s3_bucket.lawn_signs_photos.arn,
      "${aws_s3_bucket.lawn_signs_photos.arn}/*",
    ]

    principals {
      type        = "*"
      identifiers = ["*"]
    }

    condition {
      test     = "Bool"
      variable = "aws:SecureTransport"
      values   = ["false"]
    }
  }
}

# Event photos are only useful until the signs are collected and reconciled.
resource "aws_s3_bucket_lifecycle_configuration" "lawn_signs_photos" {
  bucket = aws_s3_bucket.lawn_signs_photos.id

  rule {
    id     = "expire-old-sign-photos"
    status = "Enabled"

    filter {
      prefix = "lawn-signs/"
    }

    expiration {
      days = var.lawn_signs_photo_retention_days
    }
  }
}
