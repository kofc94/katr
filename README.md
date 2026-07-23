# K'night at the Races (katr.org)

This repository contains the static web source code and Infrastructure-as-Code (IaC) configuration for the **K'night at the Races** annual charity event website ([katr.org](https://katr.org)).

---

## Overview & Architecture

The site is built as a static multi-year website hosted on AWS, designed to maintain historical archives of past events while dynamically routing root traffic (`https://katr.org`) to the current year's event landing page.

```
                  ┌──────────────────────┐
                  │    User Request      │
                  │ (https://katr.org)   │
                  └──────────┬───────────┘
                             │
                             ▼
                  ┌──────────────────────┐
                  │   Route 53 DNS       │
                  └──────────┬───────────┘
                             │
                             ▼
                  ┌──────────────────────┐
                  │CloudFront CDN (HTTPS)│
                  └──────────┬───────────┘
                             │
           ┌─────────────────┴─────────────────┐
           │ CloudFront Request Router Function│
           │ (Rewrites / to /<current_year>/)  │
           └─────────────────┬─────────────────┘
                             │
                             ▼
                  ┌──────────────────────┐
                  │   Private S3 Bucket  │
                  │ ├── 2025/  (archive) │
                  │ ├── 2026/  (current) │
                  │ └── 2027/  (…)       │
                  └──────────────────────┘
        (no root object — the edge function rewrites / to /<year>/)
```

### Key Components

- **Amazon S3**: Private bucket storing site assets organized into annual subfolders (e.g., `s3://katr-org-static-website-production/2026/`). Public access is blocked.
- **AWS CloudFront**: Global CDN serving the site over HTTPS via Origin Access Control (OAC) for secure, low-latency delivery.
- **CloudFront Function (`katr-year-router`)**: Intercepts viewer requests at the edge.
  - Root traffic (`/`) is automatically mapped to the active year folder (e.g., `/2026/index.html`).
  - Year-specific URLs (e.g., `/2025/`, `/2026/`) route directly to that year's folder, preserving archives of previous events.
- **AWS ACM & Route 53**: Handles SSL/TLS certificate creation, auto-validation via DNS, and apex (`katr.org`) / subdomain (`www.katr.org`) alias routing.
- **OpenTofu / Terraform**: Manages all AWS infrastructure declaratively.

---

## Repository Structure

- `2026/`: React (Vite) app for the 2026 event — `index.html`, `src/` (year config + sponsor cards), `package.json`, `vite.config.js`. Builds to `2026/dist/`.
- `common/`: Shared React source used by every year — the app shell (`src/main.jsx`, `src/App.jsx`, `src/index.css`), layout components (`src/components/`), the "Ride for the Cause" mini-game (`src/game/`), and shared assets (`src/assets/`). Resolved via the `@common` alias.
- `tools/`: Standalone Python scripts for generating image assets (QR codes, game sprites). Not part of the build.
- `platform/`: Infrastructure as Code (OpenTofu / Terraform) configuration
  - [`platform/main.tf`](file:///Users/eric/dev/katr/platform/main.tf): Terraform & AWS provider setup
  - [`platform/variables.tf`](file:///Users/eric/dev/katr/platform/variables.tf): Input variables (`current_year`, `domain_name`, `aws_region`, etc.)
  - [`platform/s3.tf`](file:///Users/eric/dev/katr/platform/s3.tf): S3 bucket configuration & OAC policy
  - [`platform/cloudfront.tf`](file:///Users/eric/dev/katr/platform/cloudfront.tf): CloudFront distribution & edge router function
  - [`platform/route53.tf`](file:///Users/eric/dev/katr/platform/route53.tf): DNS records and alias configurations
  - [`platform/acm.tf`](file:///Users/eric/dev/katr/platform/acm.tf): SSL/TLS certificate management
  - [`platform/outputs.tf`](file:///Users/eric/dev/katr/platform/outputs.tf): Stack outputs (S3 bucket, CloudFront ID, URLs)
  - [`platform/tofu.tfvars.example`](file:///Users/eric/dev/katr/platform/tofu.tfvars.example): Sample variable overrides file
  - [`platform/deploy.sh`](file:///Users/eric/dev/katr/platform/deploy.sh): Deployment automation script

---

## Prerequisites

Before deploying or updating the website, ensure you have the following installed and configured:

1. **Node.js** (v18+) **and npm**: Required to run and build the site (locally and inside `deploy.sh`).
   ```bash
   node --version && npm --version
   ```
2. **AWS CLI** (v2+): Installed and authenticated with permissions to modify S3, CloudFront, Route 53, and ACM.
   ```bash
   aws sts get-caller-identity
   ```
3. **OpenTofu** (or **Terraform** >= 1.6.0):
   ```bash
   tofu version  # or terraform version
   ```
4. **Bash Shell**: For executing `platform/deploy.sh`.

> Node.js/npm are needed only for local development and deployment (build tooling). Nothing server-side ships to visitors — the deployed site is fully static.

---

## Deploying the Website

### Quick Start (Deployment Script)

The repository includes an automated deployment script in [`platform/deploy.sh`](file:///Users/eric/dev/katr/platform/deploy.sh). It handles OpenTofu provisioning, S3 content sync, and CloudFront cache invalidation in a single step.

To deploy the current default year (e.g., `2026`):

```bash
cd platform
./deploy.sh
```

To deploy a specific year folder:

```bash
cd platform
./deploy.sh 2026
```

### What `deploy.sh` Does:

1. **Build the React App**: Runs `npm install && npm run build` in `./<YEAR>`, producing static files in `./<YEAR>/dist`.
2. **Provision Infrastructure**: Checks if OpenTofu state exists; runs `tofu init` and `tofu apply` if needed.
3. **Sync Built Content**: Uploads `./<YEAR>/dist` to `s3://<BUCKET_NAME>/<YEAR>/` using `aws s3 sync --delete`.
4. **Invalidate Cache**: Executes `aws cloudfront create-invalidation` to purge cached files across global edge locations.

> Root traffic (`https://katr.org/`) is routed to the active year entirely by the CloudFront `katr-year-router` function (driven by `current_year`), so the deploy does **not** write a root `index.html`. Deploying an archive year (e.g. `./deploy.sh 2025`) therefore updates only that year's folder and never repoints the root.

---

## Updating for Subsequent Years

When preparing the website for a new event year (e.g., **2027**), follow these steps:

### Step 1: Create the New Year Folder

Copy the previous year's directory as a lightweight baseline:

```bash
cp -r 2026 2027
```

### Step 2: Edit Year Configuration & Sponsors

Because common layout components (`Navbar`, `Hero`, `About`, `Tickets`, `HowItWorks`, `Schedule`, `FAQ`, `Footer`) are shared in `common/`, you only need to edit:
1. **`2027/src/config/eventConfig.js`**: Update event date, target countdown date, venue details, race count, and Zeffy ticket checkout URL.
2. **`2027/src/components/sponsors/`**: Customize the individual sponsor cards for 2027.

### Step 3: Update Infrastructure Active Year

Update `current_year` in [`platform/variables.tf`](file:///Users/eric/dev/katr/platform/variables.tf) (or in a `platform/tofu.tfvars` file):

```hcl
# platform/variables.tf
variable "current_year" {
  type        = string
  description = "The default event year to serve when visiting root katr.org"
  default     = "2027"
}
```

Or pass it in `platform/tofu.tfvars`:
```hcl
current_year = "2027"
```

### Step 4: Apply OpenTofu Configuration

Apply the updated CloudFront router configuration to point root traffic (`/`) to `/2027/`:

```bash
cd platform
tofu apply
```

### Step 5: Deploy the New Year Site

Run the deploy script targeting the new year:

```bash
./deploy.sh 2027
```

> **Note**: Past years (e.g., `2026`) will remain available at `https://katr.org/2026/` while the root site `https://katr.org/` will now serve the `2027` event.

---

## Local Development

Each year is a React app built with [Vite](https://vitejs.dev/). To run it locally:

1. Navigate to the year directory and install dependencies (first time only):
   ```bash
   cd 2026
   npm install
   ```
2. Start the dev server (hot-reloading):
   ```bash
   npm run dev
   ```
3. Open the printed URL (e.g. `http://localhost:5173`) in your web browser.

To preview the exact production build locally instead:

```bash
npm run build && npm run preview
```

---

## Infrastructure Operations

### OpenTofu Commands

If you need to manage infrastructure manually:

```bash
cd platform

# Initialize provider plugins
tofu init

# Preview changes
tofu plan

# Apply infrastructure changes
tofu apply

# View output variables (S3 bucket name, CloudFront ID, etc.)
tofu output
```

### Invalidating CloudFront Cache Manually

If you update static files without re-applying infrastructure, you can purge the CDN cache manually:

```bash
DISTRIBUTION_ID=$(cd platform && tofu output -raw cloudfront_distribution_id)
aws cloudfront create-invalidation --distribution-id "$DISTRIBUTION_ID" --paths "/*"
```
