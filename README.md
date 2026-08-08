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
- **CloudFront Access Logs**: Every request is logged to a separate private S3 bucket (`katr-org-cloudfront-logs-production`), expiring after 90 days. See [Checking Site Traffic](#checking-site-traffic-access-logs).
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
  - [`platform/logging.tf`](file:///Users/eric/dev/katr/platform/logging.tf): Access-log bucket, retention lifecycle, and log-delivery permissions
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

### Checking Site Traffic (Access Logs)

CloudFront writes an access log line for every request into a dedicated private bucket. This is the only server-side record of traffic — there is no analytics script on the site — so it also captures bots and crawlers that a JavaScript beacon would miss.

Logs are gzipped, tab-delimited [W3C extended format](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/AccessLogs.html), delivered in batches every few minutes, and expire after **90 days** (`var.log_retention_days` in `platform/variables.tf`).

#### 1. Find the log files

```bash
LOGS=$(cd platform && tofu output -raw cloudfront_logs_bucket_name)

# Most recent files (named E<DIST_ID>.YYYY-MM-DD-HH.<hash>.gz, in UTC)
aws s3 ls "s3://$LOGS/cloudfront/" | sort | tail -20
```

> Delivery lags real time by several minutes to an hour, and the timestamp in the filename is the **UTC hour** the requests occurred — not local time. Expect a given day's logs to straddle two UTC dates.

#### 2. Pull a day's logs and combine them

```bash
mkdir -p /tmp/katrlogs && cd /tmp/katrlogs

aws s3 cp "s3://$LOGS/cloudfront/" . --recursive \
  --exclude "*" --include "*.2026-08-06-*.gz" --quiet

# Strip the two '#Version'/'#Fields' header lines from each file
gunzip -c *.gz | grep -v '^#' > all.tsv
wc -l all.tsv
```

Adjust the `--include` glob to widen the window — `"*.2026-08-*.gz"` for a whole month.

#### 3. Useful queries

Fields are tab-separated in a fixed order. The ones you'll want:

| Field | Contents |
|---|---|
| `$1` / `$2` | date / time (UTC) |
| `$3` | edge location (first 3 chars ≈ nearest airport, a rough geography proxy) |
| `$5` | client IP |
| `$8` | URL path (`cs-uri-stem`) |
| `$9` | HTTP status |
| `$10` | referrer |
| `$11` | user agent |

```bash
# Total requests
wc -l < all.tsv

# Most-requested paths
cut -f8 all.tsv | sort | uniq -c | sort -rn | head -20

# Status code breakdown
cut -f9 all.tsv | sort | uniq -c | sort -rn

# Where visitors came from (referrers; '-' means direct/none)
cut -f10 all.tsv | sort | uniq -c | sort -rn | head -20

# Rough geography, via edge location
cut -f3 all.tsv | cut -c1-3 | sort | uniq -c | sort -rn | head -10

# Requests per day
cut -f1 all.tsv | sort | uniq -c

# Distinct client IPs — a loose upper bound on visitors, not a real unique count
cut -f5 all.tsv | sort -u | wc -l

# Which QR-code / print traffic landed on the /qr/ page
grep -c $'\t/qr' all.tsv
```

#### Counting real page views

**Do not filter on user agent to separate humans from bots** — it does not work here. In a measured two-day sample it flagged only 124 of 6,381 requests, because vulnerability scanners send ordinary Chrome and Safari user-agent strings. Filtering on `sc-status == 200` is equally useless: every unknown path returns the landing page.

The reliable signal is **whether the client fetched the JS bundle**. A scanner requests one path and leaves; a real browser parses the HTML and pulls the hashed assets:

```bash
# Real browser page loads
awk -F'\t' '$8 ~ /^\/assets\/index-.*\.js$/' all.tsv | wc -l

# Distinct visitors (approximate — shared NAT and mobile networks collapse IPs)
awk -F'\t' '$8 ~ /^\/assets\/index-.*\.js$/ {print $5}' all.tsv | sort -u | wc -l

# Real page loads per day
awk -F'\t' '$8 ~ /^\/assets\/index-.*\.js$/ {print $1}' all.tsv | sort | uniq -c

# Where those actual visitors were, by nearest edge location
awk -F'\t' '$8 ~ /^\/assets\/index-.*\.js$/ {print substr($3,1,3)}' all.tsv | sort | uniq -c | sort -rn

# Decoded user agents of real visitors (device/browser mix)
awk -F'\t' '$8 ~ /^\/assets\/index-.*\.js$/ {print $11}' all.tsv | sed 's/%20/ /g' | sort | uniq -c | sort -rn
```

Cross-check the JS count against the CSS bundle (`index-*.css`); the two should be in the same ballpark, and a large gap means browser caching is skewing one of them.

Sanity-check geography before trusting any of it. This is a Lexington, Massachusetts parish event, so genuine traffic should concentrate in `BOS`/`IAD`. A sample dominated by `FRA` and `HKG`, or by `X11; Linux x86_64` desktop user agents, is datacenter automation rather than parishioners — even though it fetched the assets.

#### 4. Quick volume check without downloading anything

CloudFront publishes free request metrics to CloudWatch (retained ~15 days):

```bash
DISTRIBUTION_ID=$(cd platform && tofu output -raw cloudfront_distribution_id)
aws cloudwatch get-metric-statistics \
  --namespace AWS/CloudFront --metric-name Requests \
  --dimensions Name=DistributionId,Value="$DISTRIBUTION_ID" Name=Region,Value=Global \
  --start-time "$(date -u -v-14d +%Y-%m-%dT%H:%M:%SZ)" \
  --end-time "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
  --period 86400 --statistics Sum --region us-east-1 \
  --query 'sort_by(Datapoints,&Timestamp)[].[Timestamp,Sum]' --output text
```

> `--region us-east-1` is required — CloudFront metrics are only published there. On Linux, use `date -u -d '14 days ago'` instead of the BSD `-v-14d` syntax.

#### Interpreting the numbers

A few caveats worth remembering before quoting any of this to the committee:

- **Requests are not visitors.** One fresh page load is ~6–7 requests (HTML, CSS, JS, and the graphic/horse/QR images). Repeat visits hit the browser cache and log far fewer. Divide accordingly.
- **The overwhelming majority of traffic is hostile automation, not visitors.** A measured two-day sample held 6,381 requests, of which roughly **28** were real browser page loads. The rest was almost entirely vulnerability scanning — probes for `/wp-content/plugins/.../wp_filemanager.php`, `/1.php`, `/.env`, `/graphql`, `/admin.php` and hundreds of similar paths. None of it is a threat to a static S3 site with no PHP, no database, and no server-side code, but it dwarfs the real numbers. Always separate the two before quoting a figure.
- **User agents are URL-encoded** in the logs (spaces appear as `%20`), and scanners routinely spoof real browser strings. Decode with `sed 's/%20/ /g'` for readability, but do not rely on user agent to identify bots.
- **`301` responses are normal.** They are `http` → `https` upgrades from the distribution's `redirect-to-https` policy, mostly scanners hitting port 80. They are not errors.
- **Ticket sales are not measurable here.** The Zeffy checkout is a cross-origin iframe, so no log line or analytics script can see form views or submissions. Use Zeffy's own dashboard for that.

For proper visitor-level analytics (unique users, sessions, conversion funnels) we'd add a client-side tool or an Athena table over this bucket — not set up yet.

### Invalidating CloudFront Cache Manually

If you update static files without re-applying infrastructure, you can purge the CDN cache manually:

```bash
DISTRIBUTION_ID=$(cd platform && tofu output -raw cloudfront_distribution_id)
aws cloudfront create-invalidation --distribution-id "$DISTRIBUTION_ID" --paths "/*"
```
