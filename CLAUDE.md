# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Static multi-year website for the **K'night at the Races** charity event (katr.org). Each event year is a self-contained React/Vite app under a year folder (e.g. `2026/`). Root traffic to katr.org is rewritten to the active year's folder at the CloudFront edge; past years stay archived at `katr.org/<year>/`.

## Commands

Frontend (run from a year directory, e.g. `cd 2026`):
- `npm run dev` — Vite dev server
- `npm run build` — production build to `2026/dist/`
- `npm run preview` — serve the built output

Deploy (from `platform/`):
- `./deploy.sh [YEAR]` — builds the year's React app, syncs `dist/` to `s3://<bucket>/<YEAR>/`, copies the year's `index.html` to the bucket root as the fallback, and invalidates CloudFront. Defaults to `2026`. Runs `tofu init`/`tofu apply` automatically if the stack isn't provisioned.
- `tofu plan` / `tofu apply` / `tofu output` — manage AWS infra directly (OpenTofu, or Terraform >= 1.6.0)

There are no tests or linters configured.

## Architecture

### Shared-component / per-year-config split

The key structural idea: **layout and behavior live in `common/`; only data and sponsor cards live per-year.** This lets a new year reuse the entire site by copying a small amount.

- `common/src/` holds the app shell (`App.jsx`, `main.jsx`, `index.css`) and every layout component (`Navbar`, `Hero`, `About`, `Tickets`, `HowItWorks`, `Schedule`, `FAQ`, `Footer`, `Countdown`, `SponsorsSection`). Components are presentational and take props — they contain no hardcoded year data.
- `2026/src/config/eventConfig.js` is the single source of per-year data (dates, venue, race count, `targetDate` for the countdown, Zeffy checkout URL). `common/App.jsx` imports it and threads its fields into the shared components as props.
- `2026/src/components/Sponsors.jsx` composes the shared `SponsorsSection` container with year-specific sponsor cards from `2026/src/components/sponsors/`.

Vite path aliases (in each year's `vite.config.js`) wire the two halves together:
- `@common` → `../common/src`
- `@year` → `./src`

`common/App.jsx` pulls year data via `@year/config/eventConfig` and `@year/components/Sponsors`, while year-specific code pulls shared pieces via `@common/components`. Each year's `index.html` sets `<script src="../common/src/main.jsx">` as the entry point.

Note: a `BaseSponsorCard.jsx` exists in both `common/` and `2026/src/components/sponsors/`. Year sponsor cards import the shared one via `@common/components`; treat the common copy as canonical.

### Infrastructure (`platform/`, OpenTofu)

S3 (private) + CloudFront (OAC, HTTPS) + Route 53 + ACM. The `katr-year-router` CloudFront Function (`cloudfront.tf`) rewrites `/` → `/<current_year>/index.html` at the edge. `current_year` is set in `variables.tf` (or a `tofu.tfvars`) and determines which year root traffic serves. `terraform.tfstate` is committed locally (no remote backend).

## Adding a new year

1. `cp -r 2026 2027` (copy the whole year app as a baseline).
2. Edit `2027/src/config/eventConfig.js` (dates, venue, race count, `targetDate`, Zeffy URL) and customize `2027/src/components/sponsors/`. Shared layout usually needs no changes.
3. Set `current_year = "2027"` (in `platform/variables.tf` or `tofu.tfvars`) and `tofu apply` so root traffic points at the new year.
4. `./deploy.sh 2027`.

## Tools

`tools/` contains standalone Python scripts (`generate_qr.py`, `generate_artistic_scannable_qr.py`) that generate the QR-code assets used on the site. Not part of the build.
