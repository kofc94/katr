terraform {
  required_version = ">= 1.6.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "Knight at the Races"
      ManagedBy   = "OpenTofu"
      Environment = var.environment
      Domain      = var.domain_name
    }
  }
}

# ACM for CloudFront MUST be in us-east-1
provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"

  default_tags {
    tags = {
      Project     = "Knight at the Races"
      ManagedBy   = "OpenTofu"
      Environment = var.environment
      Domain      = var.domain_name
    }
  }
}
