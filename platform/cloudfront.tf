# CloudFront Origin Access Control (OAC)
resource "aws_cloudfront_origin_access_control" "oac" {
  name                              = "katr-oac-${var.environment}"
  description                       = "OAC for KatR static S3 bucket"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

# CloudFront Function for automatic year directory routing
# Maps root requests and non-year asset paths to the active year folder (e.g. /2026/)
resource "aws_cloudfront_function" "year_router" {
  name    = "katr-year-router-${var.environment}"
  runtime = "cloudfront-js-2.0"
  comment = "Routes requests to active year folder (${var.current_year}) or direct year folders"
  publish = true
  code    = <<EOF
function handler(event) {
    var request = event.request;
    var uri = request.uri;

    // Check if the URI explicitly starts with a 4-digit year folder (e.g., /2026 or /2025)
    var yearMatch = uri.match(/^\/(\d{4})(\/.*)?$/);

    if (yearMatch) {
        if (uri === '/' + yearMatch[1]) {
            request.uri = '/' + yearMatch[1] + '/index.html';
        } else if (uri.endsWith('/')) {
            request.uri = uri + 'index.html';
        }
        return request;
    }

    // Default to active year
    var activeYear = "${var.current_year}";

    if (uri === '/' || uri === '') {
        request.uri = '/' + activeYear + '/index.html';
    } else {
        request.uri = '/' + activeYear + uri;
        if (request.uri.endsWith('/')) {
            request.uri += 'index.html';
        }
    }

    return request;
}
EOF
}

# CloudFront Distribution
resource "aws_cloudfront_distribution" "s3_distribution" {
  enabled             = true
  is_ipv6_enabled     = true
  comment             = "K'night at the Races static web distribution"
  default_root_object = "index.html"

  aliases = concat([var.domain_name], var.subdomains)

  origin {
    domain_name              = aws_s3_bucket.website.bucket_regional_domain_name
    origin_id                = "S3-${aws_s3_bucket.website.id}"
    origin_access_control_id = aws_cloudfront_origin_access_control.oac.id
  }

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3-${aws_s3_bucket.website.id}"

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 86400
    max_ttl                = 31536000
    compress               = true

    function_association {
      event_type   = "viewer-request"
      function_arn = aws_cloudfront_function.year_router.arn
    }
  }

  custom_error_response {
    error_code            = 403
    response_code         = 200
    response_page_path    = "/${var.current_year}/index.html"
    error_caching_min_ttl = 10
  }

  custom_error_response {
    error_code            = 404
    response_code         = 404
    response_page_path    = "/${var.current_year}/index.html"
    error_caching_min_ttl = 10
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn      = aws_acm_certificate.cert.arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }
}
