variable "domain_name" {
  type        = string
  description = "Primary domain name for the website"
  default     = "katr.org"
}

variable "subdomains" {
  type        = list(string)
  description = "List of subdomain aliases"
  default     = ["www.katr.org"]
}

variable "current_year" {
  type        = string
  description = "The default event year to serve when visiting root katr.org (e.g. 2026)"
  default     = "2026"
}

variable "aws_region" {
  type        = string
  description = "Primary AWS region for deployment"
  default     = "us-east-1"
}

variable "environment" {
  type        = string
  description = "Environment name (e.g. production, staging)"
  default     = "production"
}

variable "enable_route53_records" {
  type        = bool
  description = "Whether to manage Route 53 DNS records for custom domain validation and alias"
  default     = true
}
