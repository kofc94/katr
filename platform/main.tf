terraform {
  # use_lockfile (S3-native state locking) needs OpenTofu >= 1.10 or
  # Terraform >= 1.11. It replaces the old DynamoDB lock table.
  required_version = ">= 1.10.0"

  # Remote state, in the shared state bucket used across projects.
  # Namespaced under katr/ so it sits alongside the other stacks there.
  backend "s3" {
    bucket       = "lanternlounge-tfstate"
    key          = "katr/platform/terraform.tfstate"
    region       = "us-east-1"
    encrypt      = true
    use_lockfile = true
  }

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    # Packages the lawn sign Lambda source into a deployable zip.
    archive = {
      source  = "hashicorp/archive"
      version = "~> 2.4"
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
