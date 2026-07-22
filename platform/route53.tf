# Fetch existing Hosted Zone in Route 53 for katr.org
data "aws_route53_zone" "primary" {
  count        = var.enable_route53_records ? 1 : 0
  name         = var.domain_name
  private_zone = false
}

# CNAME records for ACM Certificate DNS validation
resource "aws_route53_record" "cert_validation" {
  for_each = var.enable_route53_records ? {
    for dvo in aws_acm_certificate.cert.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  } : {}

  allow_overwrite = true
  name            = each.value.name
  records         = [each.value.record]
  ttl             = 60
  type            = each.value.type
  zone_id         = data.aws_route53_zone.primary[0].zone_id
}

# Alias A Record for Apex domain (katr.org -> CloudFront)
resource "aws_route53_record" "apex" {
  count   = var.enable_route53_records ? 1 : 0
  zone_id = data.aws_route53_zone.primary[0].zone_id
  name    = var.domain_name
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.s3_distribution.domain_name
    zone_id                = aws_cloudfront_distribution.s3_distribution.hosted_zone_id
    evaluate_target_health = false
  }
}

# Alias AAAA Record for IPv6 Apex domain (katr.org -> CloudFront)
resource "aws_route53_record" "apex_aaaa" {
  count   = var.enable_route53_records ? 1 : 0
  zone_id = data.aws_route53_zone.primary[0].zone_id
  name    = var.domain_name
  type    = "AAAA"

  alias {
    name                   = aws_cloudfront_distribution.s3_distribution.domain_name
    zone_id                = aws_cloudfront_distribution.s3_distribution.hosted_zone_id
    evaluate_target_health = false
  }
}

# Alias A Record for Subdomains (e.g. www.katr.org -> CloudFront)
resource "aws_route53_record" "subdomains" {
  for_each = var.enable_route53_records ? toset(var.subdomains) : []
  zone_id  = data.aws_route53_zone.primary[0].zone_id
  name     = each.key
  type     = "A"

  alias {
    name                   = aws_cloudfront_distribution.s3_distribution.domain_name
    zone_id                = aws_cloudfront_distribution.s3_distribution.hosted_zone_id
    evaluate_target_health = false
  }
}

# Alias AAAA Record for Subdomains IPv6
resource "aws_route53_record" "subdomains_aaaa" {
  for_each = var.enable_route53_records ? toset(var.subdomains) : []
  zone_id  = data.aws_route53_zone.primary[0].zone_id
  name     = each.key
  type     = "AAAA"

  alias {
    name                   = aws_cloudfront_distribution.s3_distribution.domain_name
    zone_id                = aws_cloudfront_distribution.s3_distribution.hosted_zone_id
    evaluate_target_health = false
  }
}
