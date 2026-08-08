# Event Lawn Sign Tracker Mobile App (S3 & DynamoDB)

A mobile-first web application designed to record and manage lawn sign placements and post-event collection for event promotion (iPhone & Android compatible).

---

## 📱 Features

1. **Capture Page (Placement recording)**
   - **Camera / Photo Capture**: Take photo of the installed lawn sign.
   - **GPS Geolocation & Reverse Geocoding**: Automatically gets the phone's GPS coordinates (`latitude`, `longitude`, accuracy) and resolves a human-readable street address using OpenStreetMap Nominatim API.
   - **Editable Address**: Pre-filled address can be manually adjusted or refined.
   - **Timestamp**: Automatically records ISO timestamp and volunteer placement notes.
   - **S3 Upload**: The API issues a single-use presigned PUT and the browser sends the photo straight to `lawn-signs/{event}/{sign_id}.jpg`.
   - **DynamoDB Record Storage**: Stores a structured record with `id`, `address`, `latitude`, `longitude`, `s3Bucket`, `s3Key`, `status`, `placedAt`, `placedBy`, and `notes`.

2. **List & Collection Portion**
   - **Signs Feed**: View all placed lawn signs with photo thumbnails, address, status, and relative time.
   - **Status Management**: Mark signs as **`Collected`** (triggers confetti 🎉) or **`Missing`** with a single tap. 
   - **GPS Proximity Sorting**: Automatically calculates distance from current phone location to each sign (e.g. "0.3 miles away").
   - **Interactive Map View**: Fullscreen OpenStreetMap (Leaflet) with color-coded pin markers (Green = Placed, Blue = Collected, Red = Missing). Tap pins to get details and directions.
   - **One-Tap GPS Navigation**: Launches Google Maps / Apple Maps directions directly to sign coordinates.
   - **CSV Export**: Download complete sign inventory with S3 URLs and DynamoDB timestamps.

3. **Dual Mode (Live Event & Demo Storage)**
   - **Demo Mode**: Works 100% out-of-the-box in local storage — no AWS account, no sign-in.
   - **Live Mode**: Signs in with Cognito (Google or email/password) and syncs to the shared event database. No AWS credential is entered anywhere, or held by the app.

---

## 🚀 Quick Start (Local Development)

```bash
cd lawn-signs
npm install
npm run dev
```

Open `http://localhost:5173` on desktop or mobile device.

---

## ☁️ Architecture

**No AWS credential ever reaches the browser.** The app authenticates against
Cognito and calls an authenticated HTTP API; the Lambdas behind it hold the only
IAM identity that can touch the bucket or the table.

```
 Browser ──sign in──▶ Cognito  (email+password, or Google IdP)
    │                    │
    │  ID token (JWT)  ◀─┘
    ▼
 API Gateway (HTTP API) ── JWT authorizer verifies the token
    │
    ▼
 Lambda (python3.11, boto3 only)
    ├── DynamoDB  LawnSigns
    └── S3        presigned PUT / GET, 5 min / 1 hr
                     │
 Browser ────PUT photo bytes direct to S3 with the presigned URL
```

Uploading a sign is three calls: `POST /signs/upload-url` returns a single-use
presigned PUT; the browser sends the image straight to S3 (so photos never pass
through Lambda); `POST /signs` writes the record. The bucket is private, so
`GET /signs` returns freshly signed, hour-long view URLs each time.

| Route | Purpose |
|---|---|
| `GET /signs` | All signs for the event, with signed photo URLs |
| `POST /signs/upload-url` | Mint a presigned S3 PUT for one photo |
| `POST /signs` | Record a placed sign |
| `PATCH /signs/{id}` | Collected / missing / reopened |

Terraform lives in [`platform/`](../platform): `lawn_signs.tf` (S3 + DynamoDB),
`lawn_signs_cognito.tf`, `lawn_signs_lambda.tf`, `lawn_signs_api.tf`. Handler
source is in `platform/lambda/lawn_signs/`.

### Who can sign in

Access is a Terraform allowlist — there is no self-service sign-up. Add people
to `lawn_signs_authorized_users` in `platform/variables.tf` (or a `tofu.tfvars`):

```hcl
lawn_signs_authorized_users = [
  { email = "organizer@example.com", name = "Pat Organizer", admin = true },
  { email = "volunteer@example.com", name = "Sam Volunteer" },
]
```

Each entry is pre-created in Cognito and emailed a temporary password. The same
person can instead click **Continue with Google** — the PreSignUp trigger
(`pre_signup.py`) links the Google identity onto their existing account so they
stay one user either way, and rejects anyone not on the list. Volunteers whose
address isn't a Google account can reset their own password by email. Removing
an entry and applying deletes the account.

### First-time setup

The redirect URI Google needs is fixed and known in advance — it's derived from
the Cognito domain prefix and region, both hardcoded in `lawn_signs_cognito.tf`:

```
https://katr-lawn-signs-production.auth.us-east-1.amazoncognito.com/oauth2/idpresponse
```

So you can configure Google fully *before* the first `tofu apply`. You must, in
fact: Terraform reads the Google credentials from SSM with a `data` source, and
plan fails if those parameters don't exist yet.

**1. Google Cloud console — enable the People API.** Cognito reads profile
attributes from `people.googleapis.com`, so enable it under *APIs & Services →
Library → People API*.

**2. Configure the OAuth consent screen** (*APIs & Services → OAuth consent screen*):
- User type: **External**
- Fill in app name, support email, developer contact
- Scopes: `openid`, `email`, `profile` — all non-sensitive
- Publishing status: **Publish to production**. In *Testing* mode Google caps
  you at 100 users and every volunteer must be added individually as a Test
  user. Because the app only requests non-sensitive scopes, publishing does
  **not** trigger a Google verification review.

**3. Create the OAuth client** (*APIs & Services → Credentials → Create
credentials → OAuth client ID*):
- Application type: **Web application**
- Authorized redirect URIs: the `.../oauth2/idpresponse` URL above
- Authorized JavaScript origins: **leave empty**. The code exchange happens
  server-side between Cognito and Google; the browser never calls Google with
  this client id.

**4. Store the credentials in SSM** (never committed, never in state as plaintext input):
```bash
aws ssm put-parameter --name /katr/google/client-id     --type String       --value "<client-id>"
aws ssm put-parameter --name /katr/google/client-secret --type SecureString --value "<client-secret>"
```

**5. Apply**: `cd platform && tofu apply`

Afterwards `tofu output lawn_signs_google_redirect_uri` echoes the URI back so
you can confirm it matches what you registered.

**6. Deploy**: `./deploy.sh lawn-signs` — the script pulls the API and Cognito
identifiers from `tofu output` and injects them into the build. For local work,
copy `.env.example` to `.env.local` and fill it from the same outputs.

> The one thing that would change the redirect URI is a collision on the Cognito
> domain prefix, which is globally unique across AWS. If `katr-lawn-signs-production`
> is already taken the apply fails; pick a new prefix in `lawn_signs_cognito.tf`
> and update the URI in Google to match.

Leave `.env.local` out entirely to run the app on local demo data with no AWS
account at all.

---

## 🎨 UI

Styling is **Tailwind CSS v4**, wired in through the `@tailwindcss/vite` plugin — there
is no `tailwind.config.js`. The whole design system lives in
[`src/index.css`](src/index.css): the colour tokens (`ink-*` ground, `neon-*` primary,
`aqua`/`azure` for collected, `flare` for missing) are declared in an `@theme` block,
and the reusable surface treatments are `@utility` rules — `glass`, `glass-deep`,
`glow-neon`, `eyebrow`. That file also holds the dark Leaflet overrides and the
teardrop map-pin styles. Change a token there and every screen follows.

### Screens

| Component | Screen |
|---|---|
| `HomeView` | Progress ring + nearest-first sign feed |
| `MapView` | Full-bleed Leaflet map, pickup route, "next target" sheet |
| `CaptureView` | Camera viewfinder, GPS address, submit |
| `SignsListView` | Search + status-filtered inventory |
| `StatsView` | Recovery stats and CSV export |

Layout is mobile-first and sized against a ~400 × 875 pt phone viewport. Bottom insets
are applied per element with `pb-[calc(...+env(safe-area-inset-bottom))]` rather than a
shared `pb-safe` helper, so nothing else can collide with that `padding-bottom`.

---

## 📋 Outstanding items

Status as of the first production deploy. The stack is applied, the app is live
at `katr.org/lawn-signs/`, and Google sign-in with account linking is confirmed
working against real infrastructure.

### Blockers before handing this to volunteers

- [ ] **Capture one real sign, end to end.** The `POST /signs/upload-url` →
  presigned S3 PUT → `POST /signs` chain has never run with a real photo and a
  real token. Every piece around it is verified, but this specific path is
  unexercised. Do this from a phone, outdoors, so it also covers camera
  permission, GPS accuracy, and the signed-URL photo rendering back in the feed.
- [ ] **Confirm the Google consent screen is published.** If it is still in
  *Testing*, only accounts explicitly added as test users can sign in, capped at
  100. Nothing in AWS reveals this — check *APIs & Services → OAuth consent
  screen* in the Google Cloud console.
- [ ] **Add the rest of the volunteer roster** to `lawn_signs_authorized_users`
  in `platform/variables.tf` and apply. Only `eledonne@gmail.com` exists today.
  Applying emails each new person an invitation.

### Known gaps

- [ ] **The `admin` group is decorative.** `get_user_from_context` parses
  `cognito:groups`, but no handler checks it — every authenticated volunteer can
  read, create, update and reopen any sign, and export the CSV. Fine for a
  trusted roster; wrong if this ever widens. Enforce in
  `platform/lambda/lawn_signs/*.py` if that changes.
- [ ] **Localhost is a permitted production origin.** `lawn_signs_dev_origins`
  defaults to `http://localhost:5173/5174` and is folded into both the live API
  CORS config and the photo bucket's CORS rules. Convenient for development;
  it should be empty for production. Set `lawn_signs_dev_origins = []` in a
  `tofu.tfvars` for the real deploy.
- [ ] **No offline capture.** Volunteers place signs while driving around, which
  is exactly where signal drops. A failed upload currently just errors and the
  sign is lost. An earlier `offlineQueue.js` scaffold was removed as dead code —
  if this matters, it needs building properly (queue in IndexedDB, retry on
  reconnect), not restoring.
- [ ] **Photo URLs expire after one hour.** `GET /signs` returns freshly signed
  view URLs, so leaving the app open past an hour leaves broken images until the
  list is refetched. Add a re-fetch on image error, or shorten the client's
  refresh interval.
- [ ] **`list_signs` scans the whole table.** The `StatusIndex` GSI is
  provisioned but never queried; the handler does a paginated `Scan` with an
  `eventId` filter. Correct and cheap at a few hundred signs, wasteful beyond
  that.
- [ ] **No tests anywhere.** No framework is configured for either the React app
  or the Python handlers.
- [ ] **No alarms.** Lambda and API Gateway both log to CloudWatch with the
  stack's retention, but nothing alerts on 5xx or throttling.

### Nice to have

- [ ] **Bundle is 560 kB (167 kB gzipped)**, dominated by `aws-amplify`. Worth
  code-splitting the auth path, or dropping Amplify for a small hand-rolled
  PKCE + token-refresh client, if load time on cellular becomes a complaint.
- [ ] **`FORCE_CHANGE_PASSWORD` on the admin account.** Harmless — it clears
  only if the temporary password is redeemed, and Google sign-in bypasses it
  entirely.
- [ ] **Rolling to a new event year** changes `EVENT_ID` (from
  `current_year`), which switches both the S3 prefix and the `list_signs`
  filter. Previous years' signs stay in the table but stop appearing. That is
  probably the desired behaviour, but it has never been exercised.
- [ ] **Accessibility has not been audited.** The swipe-to-collect control has a
  keyboard fallback, but there has been no screen-reader or contrast pass.
