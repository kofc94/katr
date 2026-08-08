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

variable "log_retention_days" {
  type        = number
  description = "Days to retain CloudFront access logs in S3 before they expire"
  default     = 90
}

variable "enable_route53_records" {
  type        = bool
  description = "Whether to manage Route 53 DNS records for custom domain validation and alias"
  default     = true
}

# ── Lawn sign tracker ─────────────────────────────────────────────────────────

variable "lawn_signs_authorized_users" {
  type = list(object({
    email = string
    name  = string
    admin = optional(bool, false)
  }))
  description = <<-EOT
    Volunteers allowed to use the lawn sign tracker. Each entry is pre-created
    in Cognito and emailed an invitation with a temporary password; the same
    address may instead sign in with Google. Removing an entry deletes the
    account and revokes access.
  EOT

  default = [
    { email = "eledonne@gmail.com", name = "Eric L", admin = true },
  ]

  validation {
    condition = alltrue([
      for u in var.lawn_signs_authorized_users :
      can(regex("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$", u.email))
    ])
    error_message = "Every authorized user needs a valid email address."
  }
}

variable "lawn_signs_dev_origins" {
  type        = list(string)
  description = "Extra origins allowed to call the API and upload photos (local Vite dev servers)"
  default     = ["http://localhost:5173", "http://localhost:5174"]
}

variable "lawn_signs_photo_retention_days" {
  type        = number
  description = "Days to keep lawn sign photos in S3 before they expire"
  default     = 365
}

variable "lawn_signs_google_client_id_param" {
  type        = string
  description = "SSM parameter holding the Google OAuth client ID for Cognito federation"
  default     = "/katr/google/client-id"
}

variable "lawn_signs_google_client_secret_param" {
  type        = string
  description = "SSM SecureString parameter holding the Google OAuth client secret"
  default     = "/katr/google/client-secret"
}
