# ACM Certificate for custom domain SSL (CloudFront requires us-east-1)
resource "aws_acm_certificate" "cert" {
  provider                  = aws.us_east_1
  domain_name               = var.domain_name
  subject_alternative_names = var.subdomains
  validation_method         = "DNS"

  lifecycle {
    create_before_destroy = true
  }
}

# Certificate DNS validation resource (enabled when Route 53 is used)
resource "aws_acm_certificate_validation" "cert_validation" {
  count                   = var.enable_route53_records ? 1 : 0
  provider                = aws.us_east_1
  certificate_arn         = aws_acm_certificate.cert.arn
  validation_record_fqdns = [for record in aws_route53_record.cert_validation : record.fqdn]
}
