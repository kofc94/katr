output "s3_bucket_name" {
  description = "Name of the S3 bucket storing static website content"
  value       = aws_s3_bucket.website.id
}

output "cloudfront_distribution_id" {
  description = "CloudFront Distribution ID (used for cache invalidations)"
  value       = aws_cloudfront_distribution.s3_distribution.id
}

output "cloudfront_domain_name" {
  description = "Domain name of the CloudFront distribution"
  value       = aws_cloudfront_distribution.s3_distribution.domain_name
}

output "website_url" {
  description = "URL of the live site"
  value       = "https://${var.domain_name}"
}

output "current_active_year" {
  description = "Active year configured for default root routing"
  value       = var.current_year
}

output "acm_certificate_arn" {
  description = "ARN of the ACM SSL Certificate"
  value       = aws_acm_certificate.cert.arn
}

output "route53_zone_id" {
  description = "Route 53 Hosted Zone ID"
  value       = var.enable_route53_records ? data.aws_route53_zone.primary[0].zone_id : "N/A"
}
