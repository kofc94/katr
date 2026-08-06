# CloudFront access logging
#
# Uses CloudFront standard logging (legacy), which delivers gzipped W3C
# tab-delimited log files to S3. Logs are the only server-side record of site
# traffic (there is no client-side analytics on the site), and they capture
# bots and crawlers that a JS beacon would miss.
#
# Note: standard logging (legacy) delivers via S3 ACLs, so this bucket -- and
# only this bucket -- must keep object ACLs enabled. Public access stays fully
# blocked; the grant below is to the AWS log-delivery account, not to anyone
# else. The website bucket in s3.tf is unaffected.

data "aws_canonical_user_id" "current" {}

# Canonical user ID of the AWS "awslogsdelivery" account that writes CloudFront
# standard logs. This value is a documented AWS constant, identical in all
# commercial regions.
locals {
  cloudfront_log_delivery_canonical_id = "c4c1ede66af53448b93c283ce9448c4ba468c9432aa01d700d3878632f77d2d0"
}

resource "aws_s3_bucket" "logs" {
  bucket        = "katr-org-cloudfront-logs-${var.environment}"
  force_destroy = false
}

# Logs are private; nothing here should ever be web-readable
resource "aws_s3_bucket_public_access_block" "logs" {
  bucket = aws_s3_bucket.logs.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# ACLs must be enabled for CloudFront standard logging (legacy) to deliver
resource "aws_s3_bucket_ownership_controls" "logs" {
  bucket = aws_s3_bucket.logs.id

  rule {
    object_ownership = "BucketOwnerPreferred"
  }
}

# Grant the AWS log-delivery account write access to the bucket
resource "aws_s3_bucket_acl" "logs" {
  bucket = aws_s3_bucket.logs.id

  access_control_policy {
    owner {
      id = data.aws_canonical_user_id.current.id
    }

    grant {
      grantee {
        id   = data.aws_canonical_user_id.current.id
        type = "CanonicalUser"
      }
      permission = "FULL_CONTROL"
    }

    grant {
      grantee {
        id   = local.cloudfront_log_delivery_canonical_id
        type = "CanonicalUser"
      }
      permission = "FULL_CONTROL"
    }
  }

  depends_on = [aws_s3_bucket_ownership_controls.logs]
}

# SSE-KMS is not supported for CloudFront standard logs; AES256 is
resource "aws_s3_bucket_server_side_encryption_configuration" "logs" {
  bucket = aws_s3_bucket.logs.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# Expire logs so storage cost stays flat instead of growing forever
resource "aws_s3_bucket_lifecycle_configuration" "logs" {
  bucket = aws_s3_bucket.logs.id

  rule {
    id     = "expire-old-access-logs"
    status = "Enabled"

    filter {}

    expiration {
      days = var.log_retention_days
    }
  }

  rule {
    id     = "abort-incomplete-uploads"
    status = "Enabled"

    filter {}

    abort_incomplete_multipart_upload {
      days_after_initiation = 7
    }
  }

  depends_on = [aws_s3_bucket_ownership_controls.logs]
}
