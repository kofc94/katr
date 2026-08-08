output "s3_bucket_name" {
  description = "Name of the S3 bucket storing static website content"
  value       = aws_s3_bucket.website.id
}

output "cloudfront_logs_bucket_name" {
  description = "Name of the S3 bucket receiving CloudFront access logs"
  value       = aws_s3_bucket.logs.id
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

# ── Lawn sign tracker ─────────────────────────────────────────────────────────

output "lawn_signs_api_endpoint" {
  description = "Base URL of the lawn sign API (VITE_API_ENDPOINT)"
  value       = aws_apigatewayv2_api.lawn_signs.api_endpoint
}

output "lawn_signs_user_pool_id" {
  description = "Cognito User Pool ID for the lawn sign tracker (VITE_COGNITO_USER_POOL_ID)"
  value       = aws_cognito_user_pool.lawn_signs.id
}

output "lawn_signs_user_pool_client_id" {
  description = "Cognito app client ID for the lawn sign SPA (VITE_COGNITO_CLIENT_ID)"
  value       = aws_cognito_user_pool_client.lawn_signs_app.id
}

output "lawn_signs_cognito_domain" {
  description = "Cognito hosted-UI domain used for Google sign-in (VITE_COGNITO_DOMAIN)"
  value       = "${aws_cognito_user_pool_domain.lawn_signs.domain}.auth.${var.aws_region}.amazoncognito.com"
}

output "lawn_signs_photo_bucket" {
  description = "Private S3 bucket holding lawn sign photos"
  value       = aws_s3_bucket.lawn_signs_photos.id
}

output "lawn_signs_google_redirect_uri" {
  description = "Authorized redirect URI to register on the Google OAuth client"
  value       = "https://${aws_cognito_user_pool_domain.lawn_signs.domain}.auth.${var.aws_region}.amazoncognito.com/oauth2/idpresponse"
}

output "lawn_signs_authorized_user_count" {
  description = "Number of volunteers currently provisioned in Cognito"
  value       = length(var.lawn_signs_authorized_users)
}
