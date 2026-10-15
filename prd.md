# DriveFair: Product Requirements Document

**Consent-Based Behavioural Insurance Pricing Platform** | Version 1.0 (Draft) | 15 October 2026 | Prepared for Karthik and team

---

## 1. Problem Statement Analysis

### 1.1 Original statement

> Develop an insurance pricing platform that calculates premiums using consented real-world behaviour data, such as vehicle telematics, approved wearable signals or IoT measurements, rather than relying only on broad demographic categories. The system should help insurers offer prices that better reflect measured usage or risk while providing customers with understandable explanations.

### 1.2 Decomposition into requirements

| Phrase in statement | What it really demands | Product implication |
|---|---|---|
| "insurance pricing platform" | A complete system, not only a model | Customer app, insurer console, pricing engine, data layer |
| "calculates premiums" | Deterministic, auditable price output | Versioned pricing formula, caps, floors, reproducible quotes |
| "consented" | Consent is a gate, not a checkbox | Consent ledger, per-stream and per-purpose toggles, revocation that takes effect in the pricing path |
| "real-world behaviour data" | Ingest noisy, heterogeneous signals | Ingestion layer, feature extraction, data quality checks |
| "telematics, wearable, IoT" | Multiple data sources | Connector abstraction: one implemented (telematics), others pluggable |
| "rather than only demographics" | Demographics may remain but must not dominate | Hybrid tariff: baseline plus behavioural adjustment, with fairness checks |
| "better reflect measured usage or risk" | Two pricing signals: exposure and risk | Usage component (distance, time) plus risk component (driving quality) |
| "help insurers" | Insurer is a primary user | Underwriting console, portfolio analytics, rule configuration |
| "understandable explanations" | Plain-language, per-customer reasons | Explanation service that converts model contributions to sentences and charts |

### 1.3 Stakeholders

| Stakeholder | Goal | Fear |
|---|---|---|
| Policyholder | Fair price, control of data | Being tracked, unexplained price rises |
| Insurer pricing/underwriting team | Better loss ratio, lower churn | Model that regulators or customers reject |
| Compliance/DPO | Lawful processing, audit trail | Consent gaps, over-collection |
| Regulator (IRDAI / DPDP Act context) | Fairness, transparency, data protection | Proxy discrimination, opaque algorithms |
| Hackathon judges | Working demo, innovation, feasibility | Slides without a product |

### 1.4 Implicit requirements (not stated, but expected)

1. **Opt-out must work.** A customer who declines data sharing falls back to a standard tariff with no hidden penalty.
2. **Data minimisation.** Store derived features, not raw GPS traces, beyond a short retention window.
3. **Fairness.** Behavioural scores must not become proxies for protected attributes such as gender, religion or caste, or for location in a way that causes redlining.
4. **Stability.** Premiums should not swing wildly month to month; caps are required.
5. **Auditability.** Every premium must be reproducible from stored inputs, model version and rules version.
6. **Security.** Behavioural data is sensitive personal data. RLS, encryption and least privilege are mandatory.

### 1.5 Key risks and ambiguities

| # | Risk | Mitigation |
|---|---|---|
| R1 | No real claims data available | Synthetic data generator with documented assumptions; actuarial-style GLM baseline; state limits openly |
| R2 | Hardware (OBD, wearables) unavailable | Phone-sensor web simulator plus a trip file replay tool |
| R3 | Scope too wide (telematics + wearable + IoT) | Telematics fully built; wearable and IoT as connectors with one mocked adapter |
| R4 | ML model unexplainable | Use a transparent GLM-style scorecard as primary; gradient boosting only as an optional challenger |
| R5 | Stack complexity (Spring Boot plus Next.js) | Clear service boundary: Next.js owns UI and auth session; Spring Boot owns pricing logic |

### 1.6 Success criteria

- Two customers with identical demographics but different driving behaviour receive different premiums, and each sees why.
- Revoking consent changes the next quote to the standard tariff within one pricing run.
- Every premium has an explanation with at least the top 3 factors in plain language.
- The insurer console shows portfolio risk distribution and a fairness report.

---

## 2. Product Overview

### 2.1 Vision

Price insurance by how people actually behave, with their permission, and tell them clearly why their price is what it is.

### 2.2 Product goals

| ID | Goal | Metric |
|---|---|---|
| G1 | Behaviour-based premiums that separate low and high risk | Premium spread between safest and riskiest decile of at least 25% on the synthetic cohort |
| G2 | Consent-first data handling | 100% of ingested events linked to an active consent record |
| G3 | Understandable explanations | At least 80% of test users correctly state the main price driver after viewing the explanation |
| G4 | Insurer decision support | Insurer can view, simulate and audit pricing in under 3 clicks |
| G5 | Fairness transparency | Fairness report generated for each model version |

### 2.3 Non-goals (MVP)

- Claims processing, policy administration, payments and KYC.
- Real hardware integrations (OBD dongles, wearable vendor SDKs).
- Regulatory filing of the tariff.
- Health or life underwriting from wearables (connector stub only).

### 2.4 Personas

**Asha, policyholder (28, city commuter).** Wants a lower price for careful driving; worried about being tracked. Needs plain language and a visible consent switch.

**Ravi, pricing analyst at the insurer (35).** Needs to inspect how the score is built, adjust weights and caps, and see portfolio impact before publishing a new version.

**Meera, compliance officer (40).** Needs the consent ledger, audit log and fairness report on demand.

**Admin.** Manages users, roles and system configuration.

---

## 3. Scope and Phasing

| Phase | Content | Target |
|---|---|---|
| **MVP (hackathon)** | Auth with OAuth, consent centre, telematics simulator and ingestion, feature extraction, risk score, pricing with caps, customer dashboard with explanation and what-if, insurer dashboard with 3 charts, fairness check, audit log | Demo-ready |
| **V1** | Real mobile SDK ingestion, model versioning UI, A/B tariff testing, notifications, export of customer data | Post-hackathon |
| **V2** | Wearable and IoT connectors, claims feedback loop for recalibration, regulator reports, multi-insurer tenancy | Roadmap |

---

## 4. Functional Requirements

Priority: **P0** must have for MVP, **P1** should have, **P2** later.

### 4.1 Authentication and access (module AUTH)

| ID | Requirement | Priority |
|---|---|---|
| AUTH-1 | Sign up and sign in with email plus password via Supabase Auth | P0 |
| AUTH-2 | OAuth sign-in with Google (additional providers configurable) | P0 |
| AUTH-3 | Roles: `customer`, `underwriter`, `compliance`, `admin`, stored in `profiles` and embedded as a JWT claim | P0 |
| AUTH-4 | Role-based route protection in Next.js middleware and in Spring Boot | P0 |
| AUTH-5 | Session expiry and refresh handled by Supabase client | P0 |
| AUTH-6 | MFA for insurer roles | P2 |

### 4.2 Consent centre (module CON)

| ID | Requirement | Priority |
|---|---|---|
| CON-1 | Customer sees every data stream (telematics, wearable, IoT) with purpose, data collected, retention and pricing effect | P0 |
| CON-2 | Granular toggle per stream and per purpose (pricing, product improvement) | P0 |
| CON-3 | Every grant or revocation writes an immutable ledger row with timestamp, version of consent text and actor | P0 |
| CON-4 | Revocation stops ingestion and excludes the stream from the next pricing run | P0 |
| CON-5 | Customer can export or delete their behavioural data | P1 |
| CON-6 | Consent text is versioned; material changes require re-consent | P1 |
| CON-7 | Clear display of "price if you opt out" next to "price with sharing" | P0 |

### 4.3 Data ingestion (module ING)

| ID | Requirement | Priority |
|---|---|---|
| ING-1 | Trip simulator in the browser (HTML/JS) generating GPS, speed and accelerometer events for safe, average and risky profiles | P0 |
| ING-2 | Trip file replay (JSON/CSV upload to Supabase Storage) | P0 |
| ING-3 | Ingestion endpoint rejects events when no active consent exists | P0 |
| ING-4 | Schema validation, deduplication and quality scoring (gaps, impossible speeds) | P0 |
| ING-5 | Raw events kept for 30 days maximum, then purged; derived features kept per policy period | P1 |
| ING-6 | Connector interface for wearable and IoT sources, with one mocked IoT adapter (for example a home-sensor discount) | P2 |

### 4.4 Feature extraction and risk scoring (module RISK)

| ID | Requirement | Priority |
|---|---|---|
| RISK-1 | Per-trip features: distance, duration, harsh braking per 100 km, harsh acceleration per 100 km, speeding ratio, night-driving share, rush-hour share, cornering intensity | P0 |
| RISK-2 | Monthly aggregation per customer | P0 |
| RISK-3 | Risk score 0 to 100 from a transparent scorecard with documented weights | P0 |
| RISK-4 | Model version stored with every score | P0 |
| RISK-5 | Optional challenger model (gradient boosting, exported to ONNX) compared offline | P2 |

### 4.5 Pricing engine (module PRC)

| ID | Requirement | Priority |
|---|---|---|
| PRC-1 | Premium computed by the formula in section 5 | P0 |
| PRC-2 | Caps: total behavioural adjustment within -30% to +30% of the baseline, month-to-month change within 10% | P0 |
| PRC-3 | Fallback to standard tariff when consent is absent or data quality is insufficient (fewer than a minimum number of trips) | P0 |
| PRC-4 | Quote record stores inputs, model version, rule version and result for reproducibility | P0 |
| PRC-5 | What-if simulation: adjust a behaviour and see the projected premium | P0 |
| PRC-6 | Insurer can edit weights and caps in a draft ruleset, simulate on the portfolio, then publish | P1 |

### 4.6 Explainability (module EXP)

| ID | Requirement | Priority |
|---|---|---|
| EXP-1 | Per-quote breakdown: baseline, usage amount, each behaviour factor's rupee effect | P0 |
| EXP-2 | Plain-language sentences, for example "Night driving was 34% of your distance, which added ₹90" | P0 |
| EXP-3 | Per-trip feedback highlighting the events that affected price | P1 |
| EXP-4 | Concrete improvement tips with estimated saving | P0 |
| EXP-5 | Explanations available in English, with a structure ready for Tamil and Hindi | P2 |

### 4.7 Customer dashboard (module CUS)

| ID | Requirement | Priority |
|---|---|---|
| CUS-1 | Current premium, risk score, comparison with standard tariff | P0 |
| CUS-2 | Trip history with per-trip impact | P1 |
| CUS-3 | Explanation panel and what-if slider | P0 |
| CUS-4 | Consent status banner and link to the consent centre | P0 |
| CUS-5 | Monthly premium history chart | P1 |

### 4.8 Insurer console (module INS)

| ID | Requirement | Priority |
|---|---|---|
| INS-1 | Portfolio overview: number of customers, average score, premium distribution, share on behavioural pricing | P0 |
| INS-2 | Customer drill-down with quote history and explanation | P0 |
| INS-3 | Loss-ratio simulation: expected premium versus expected claims on the synthetic book | P1 |
| INS-4 | Fairness monitor: average premium and score by age band, gender and region, with disparity flags | P0 |
| INS-5 | Ruleset management (see PRC-6) | P1 |

### 4.9 Compliance and audit (module AUD)

| ID | Requirement | Priority |
|---|---|---|
| AUD-1 | Append-only audit log of data access, consent changes, ruleset changes and quote generation | P0 |
| AUD-2 | Consent ledger viewer with filters | P0 |
| AUD-3 | Exportable fairness and model-documentation report | P1 |

---

## 5. Pricing and Risk Specification

### 5.1 Premium formula

Monthly premium for a customer with active consent:

```
fixed_component   = base_fixed × demographic_factor        (coverage, vehicle value, age band; kept deliberately narrow)
usage_component   = distance_km × rate_per_km
behaviour_factor  = clamp(1 + Σ(weight_i × normalised_feature_i), 0.70, 1.30)

raw_premium       = fixed_component + usage_component × behaviour_factor
premium           = clamp(raw_premium, prev_premium × 0.90, prev_premium × 1.10)   (not applied in first period)
```

Without consent or with insufficient data:

```
premium = standard_tariff = fixed_component + (expected_distance_km × rate_per_km)
```

### 5.2 Behavioural features and default weights (editable by the insurer)

| Feature | Normalisation | Default weight |
|---|---|---|
| Harsh braking per 100 km | Percentile versus portfolio | 0.10 |
| Harsh acceleration per 100 km | Percentile versus portfolio | 0.06 |
| Speeding ratio (time above limit) | 0 to 1 | 0.12 |
| Night-driving share (11 pm to 5 am) | 0 to 1 | 0.06 |
| Cornering intensity | Percentile | 0.03 |
| Rush-hour exposure | 0 to 1 | -0.02 |

Weights are calibrated so a median driver has a behaviour factor close to 1.00. Values are placeholders for the synthetic cohort and are documented as such.

### 5.3 Fairness guardrails

- The demographic factor is limited to a small set (age band, vehicle class) and is capped.
- Gender, religion, caste and exact location are never model inputs.
- Fairness monitor computes mean premium and score by group; a flag triggers if the gap between groups exceeds a configured threshold (default 10%) after controlling for distance.
- Each ruleset version stores its fairness report.

### 5.4 Synthetic data approach

- Generate 2,000 drivers across safe (50%), average (35%) and risky (15%) profiles.
- Simulate claims with a Poisson process whose rate rises with the true underlying risk, plus noise, so that the scorecard's discrimination can be shown (for example a lift chart).
- All assumptions are published in the repository.

---

## 6. Explainability Design

Explanation payload returned with every quote:

```json
{
  "quote_id": "q_2026_10_001",
  "premium": 1840,
  "standard_tariff": 2100,
  "difference": -260,
  "factors": [
    {"name": "Speeding", "value": "6% of driving time", "impact_inr": -70, "direction": "saves"},
    {"name": "Night driving", "value": "34% of distance", "impact_inr": 90, "direction": "adds"}
  ],
  "summary": "You pay ₹260 less than the standard rate, mainly because you rarely exceed speed limits.",
  "tips": ["Shifting 20% of night trips to daytime could save about ₹35 per month."]
}
```

Rules: no jargon, always show rupee impact, always show the opt-out comparison, and never reveal other customers' data.

---

## 7. Consent and Privacy Requirements

- Lawful basis: explicit, informed, purpose-specific consent, aligned with the principles of India's DPDP Act (notice, purpose limitation, withdrawal, erasure).
- Consent record fields: `user_id`, `stream`, `purpose`, `status`, `consent_text_version`, `granted_at`, `revoked_at`, `source` (web, app), `ip_hash`.
- Consent ledger is **append-only**; current status is derived from the latest row per user, stream and purpose.
- Ingestion service checks the consent view on every batch; no consent means a rejected batch and an audit log entry.
- Data minimisation: raw GPS truncated to coarse precision after trip processing; raw events deleted after 30 days.
- User rights: view, export (JSON), delete, withdraw consent from the consent centre.
- No pricing penalty for opting out beyond the standard tariff shown in advance.

---

## 8. System Architecture

### 8.1 Technology stack

| Layer | Technology | Responsibility |
|---|---|---|
| Presentation | HTML, CSS, JavaScript, rendered through Next.js pages | Semantic HTML, hand-written CSS (CSS Modules plus design tokens), vanilla JS for the simulator and charts |
| Core application | Next.js (App Router) | Pages, server components, route handlers acting as a backend-for-frontend, middleware for role guards |
| Backend services | Spring Boot 3 (Java 21) | Pricing engine, feature extraction, scoring, explanation service, fairness analytics |
| Database and auth | Supabase (PostgreSQL) | Tables, RLS policies, Auth with OAuth, Storage buckets, scheduled jobs (pg_cron) |
| Charts | Chart.js or lightweight SVG via JS | Dashboards |
| Containers and hosting | Docker; Vercel or AWS for Next.js; container host for Spring Boot | Deployment |
| CI/CD | GitHub Actions | Build, test, deploy |
| Offline modelling (optional) | Notebook for synthetic data and calibration | Produces weights and the optional ONNX challenger |

Note on the stack: Next.js is a framework rather than a language, so "core language" is interpreted as JavaScript/TypeScript on Next.js for the application core, with Java only inside the Spring Boot service.

### 8.2 Service boundaries

```
[Browser: HTML/CSS/JS in Next.js]
        │  Supabase session (JWT)
        ▼
[Next.js route handlers (BFF)] ── validates session, role, shapes responses
        │                           │
        │ SQL via supabase-js (RLS)  │ REST + Bearer JWT
        ▼                           ▼
[Supabase Postgres + Storage]   [Spring Boot Pricing Service]
        ▲                           │ verifies JWT (JWKS), service-role key
        └───────────────────────────┘ writes features, scores, quotes, audit
```

- **Next.js** never computes prices. It displays results and relays requests.
- **Spring Boot** is the only writer to `risk_scores`, `quotes` and `quote_explanations`, using a restricted database role.
- **Supabase RLS** protects every table so even a compromised client cannot read another customer's data.

### 8.3 Key flows

**Trip ingestion:** Simulator posts events to `/api/ingest` (Next.js) → forwards to Spring Boot `/v1/ingest` → consent check against `consent_current` view → validate and store trip features → append audit log.

**Monthly pricing run:** Scheduled job (pg_cron or Spring `@Scheduled`) → for each active policy, load consent and monthly features → compute score → compute premium with caps → store quote and explanation → notify customer.

**Consent change:** Customer toggles stream → Next.js inserts ledger row (RLS permits insert for own user) → trigger writes audit log → next pricing run reads new status. An immediate re-quote endpoint is used for the demo.

---

## 9. Repository and Project Structure

```
drivefair/
├── apps/
│   ├── web/                          # Next.js application
│   │   ├── app/
│   │   │   ├── (public)/             # landing, login, signup
│   │   │   ├── (customer)/           # dashboard, trips, consent, explain, settings
│   │   │   ├── (insurer)/            # portfolio, customers, rules, fairness
│   │   │   ├── (compliance)/         # audit, consent-ledger
│   │   │   └── api/                  # BFF route handlers: ingest, quote, consent, what-if
│   │   ├── components/               # semantic HTML components + CSS Modules
│   │   ├── lib/                      # supabase client, auth helpers, api client
│   │   ├── public/simulator/         # vanilla JS trip simulator
│   │   ├── styles/                   # tokens.css, base.css, layout.css
│   │   └── middleware.ts             # role-based route guards
│   └── pricing-service/              # Spring Boot
│       └── src/main/java/com/drivefair/
│           ├── api/                  # controllers, DTOs
│           ├── security/             # JWT validation, role checks
│           ├── consent/              # consent verification
│           ├── ingestion/            # validation, dedupe, quality score
│           ├── features/             # trip and monthly feature extraction
│           ├── scoring/              # scorecard, model registry
│           ├── pricing/              # formula, caps, fallback
│           ├── explain/              # explanation generator
│           ├── fairness/             # group metrics, disparity flags
│           └── audit/                # audit writer
├── supabase/
│   ├── migrations/                   # SQL schema, RLS, triggers
│   ├── seed/                         # synthetic drivers and claims
│   └── config.toml
├── data-science/                     # notebooks, generator, calibration
├── docs/                             # PRD, ADRs, API spec, fairness report
├── .github/workflows/                # ci.yml, deploy.yml
└── docker-compose.yml
```

---

## 10. Data Model

| Table | Key columns | Notes |
|---|---|---|
| `profiles` | id (FK auth.users), full_name, role, age_band, vehicle_class, created_at | One row per user; `role` drives access |
| `policies` | id, user_id, vehicle_id, coverage_level, base_fixed, status, start_date | One active policy per vehicle |
| `vehicles` | id, user_id, make, model, year, class | |
| `consent_ledger` | id, user_id, stream, purpose, status, text_version, created_at, source | Append-only; no update or delete policy |
| `consent_current` (view) | user_id, stream, purpose, status | Latest row per key |
| `trips` | id, user_id, policy_id, started_at, distance_km, duration_s, quality_score | Derived summary |
| `trip_features` | trip_id, harsh_brake_per_100km, harsh_accel_per_100km, speeding_ratio, night_share, rush_share, cornering | |
| `raw_events_files` | id, trip_id, bucket_path, expires_at | Pointer to Storage object; purged by job |
| `monthly_features` | user_id, policy_id, period, distance_km, aggregated features | |
| `risk_scores` | id, user_id, period, score, model_version, created_at | Written only by the pricing service |
| `quotes` | id, user_id, policy_id, period, premium, standard_tariff, mode (behavioural or standard), ruleset_version, inputs_json | Reproducible |
| `quote_explanations` | quote_id, factors_json, summary, tips_json | |
| `rulesets` | id, version, weights_json, caps_json, status (draft, published), fairness_report_json, created_by | |
| `audit_log` | id, actor_id, action, entity, entity_id, metadata, created_at | Append-only |

Indexes on `(user_id, period)` for features, scores and quotes, and on `(user_id, stream, purpose, created_at desc)` for consent.

---

## 11. Security: Supabase Auth, OAuth, Storage and RLS

### 11.1 Authentication and OAuth

- Supabase Auth issues JWTs; Google OAuth is configured with redirect URLs for local, staging and production.
- A custom claim `app_role` is added through an auth hook or by reading `profiles.role`; Spring Boot reads it from the verified token.
- Spring Boot validates tokens against Supabase's JWKS endpoint; service-to-service calls use a separate service credential.
- Secrets (service role key, JWT secret, OAuth client secrets) live only in environment variables and never in client code.

### 11.2 RLS policy matrix

RLS is enabled on **every** table in the `public` schema.

| Table | Customer | Underwriter | Compliance | Admin |
|---|---|---|---|---|
| `profiles` | read/update own | read (limited columns) | read | all |
| `policies`, `vehicles` | read/write own | read all | read all | all |
| `consent_ledger` | insert own, read own | none | read all | read all |
| `trips`, `trip_features`, `monthly_features` | read own | read aggregated view only | none | read all |
| `risk_scores`, `quotes`, `quote_explanations` | read own | read all | read all | read all |
| `rulesets` | none | read, create draft | read | all |
| `audit_log` | none | none | read all | read all |

Writes to scores, quotes and explanations come only from the pricing service role.

Example policies:

```sql
alter table consent_ledger enable row level security;

create policy "customer inserts own consent"
on consent_ledger for insert to authenticated
with check (user_id = auth.uid());

create policy "customer reads own consent"
on consent_ledger for select to authenticated
using (user_id = auth.uid());

create policy "compliance reads all consent"
on consent_ledger for select to authenticated
using ((auth.jwt() ->> 'app_role') in ('compliance','admin'));

-- no update or delete policies: ledger is append-only

create policy "customer reads own quotes"
on quotes for select to authenticated
using (user_id = auth.uid());
```

Underwriters see customer behavioural data only through aggregated or pseudonymised views, never raw trip tables.

### 11.3 Storage buckets

| Bucket | Purpose | Access |
|---|---|---|
| `trip-uploads` | Customer-uploaded trip files for replay | Private; path `user_id/trip_id.json`; policy allows a user to read and write only their own folder |
| `exports` | Generated data exports for the customer | Private; signed URLs expiring in 15 minutes |
| `reports` | Fairness and model documentation PDFs | Private; compliance and admin only |

File size limit and MIME-type restriction on every bucket; objects in `trip-uploads` are deleted by a scheduled job after 30 days.

### 11.4 Other controls

- TLS everywhere; database encryption at rest provided by Supabase.
- Input validation on all endpoints (Zod in Next.js, Bean Validation in Spring Boot).
- Rate limiting on ingestion and auth endpoints.
- Dependency scanning and secret scanning in CI.
- Logs contain no raw coordinates or personal identifiers.

---

## 12. API Specification (summary)

### Next.js BFF

| Method | Path | Purpose | Roles |
|---|---|---|---|
| POST | `/api/consent` | Grant or revoke a stream | customer |
| POST | `/api/ingest` | Submit trip events or a file reference | customer |
| GET | `/api/quote/current` | Current quote with explanation | customer |
| POST | `/api/quote/what-if` | Simulate changed behaviour | customer |
| GET | `/api/insurer/portfolio` | Portfolio aggregates | underwriter, admin |
| GET | `/api/insurer/fairness` | Fairness metrics | underwriter, compliance, admin |
| POST | `/api/insurer/rulesets` | Create draft ruleset | underwriter |
| POST | `/api/insurer/rulesets/{id}/publish` | Publish after simulation | admin |
| GET | `/api/compliance/audit` | Audit log query | compliance, admin |

### Spring Boot service (internal)

| Method | Path | Purpose |
|---|---|---|
| POST | `/v1/ingest` | Validate, consent-check, extract features |
| POST | `/v1/score` | Compute risk score for a period |
| POST | `/v1/quote` | Compute premium and explanation |
| POST | `/v1/simulate` | What-if or portfolio simulation |
| GET | `/v1/fairness/{rulesetId}` | Group metrics |

Standard error format: `{ "error": { "code": "CONSENT_REQUIRED", "message": "..." } }`. APIs are documented with OpenAPI and versioned under `/v1`.

---

## 13. UX Requirements

### 13.1 Screens

| Persona | Screens |
|---|---|
| Customer | Landing, sign in, onboarding (policy and consent), dashboard, trip history, explanation and what-if, consent centre, data export and delete, settings |
| Underwriter | Portfolio overview, customer drill-down, ruleset editor and simulator, fairness monitor |
| Compliance | Audit log, consent ledger, reports |

### 13.2 Design principles

- Semantic HTML first; keyboard navigation and ARIA labels; WCAG 2.1 AA contrast.
- Responsive layout (mobile first, since customers use phones).
- Design tokens for colour, spacing and typography in `tokens.css`.
- Trust cues: a persistent "data sharing: ON/OFF" indicator and one-tap access to consent.
- Insurance terms explained in plain language; rupee amounts shown with the reason beside them.

---

## 14. Non-Functional Requirements

| Category | Requirement |
|---|---|
| Performance | Quote retrieval under 500 ms (p95); trip ingestion batch under 2 s; monthly run for 10,000 policies under 10 minutes |
| Scalability | Stateless services; horizontal scaling of the Spring Boot service; indexed queries |
| Availability | 99.5% for demo and staging; graceful fallback to the last published quote if the pricing service is down |
| Reliability | Idempotent ingestion (dedupe key) and idempotent monthly runs |
| Privacy | Raw data retention 30 days; export and delete within the app |
| Auditability | Every quote reproducible from stored inputs and versions |
| Accessibility | WCAG 2.1 AA |
| Maintainability | Test coverage of at least 70% on pricing and consent modules; ADRs for major decisions |
| Observability | Structured logs, request IDs, health endpoints, basic metrics |

---

## 15. Testing Strategy

| Level | Scope |
|---|---|
| Unit | Formula, caps, fallback, feature extraction, explanation sentences (JUnit, Jest) |
| Property tests | Premium always within caps; same inputs always give the same premium |
| Integration | Consent gating on ingestion; RLS tests that attempt cross-user reads and expect denial |
| Contract | OpenAPI contract between Next.js and Spring Boot |
| End-to-end | Sign in, grant consent, run simulated trips, see quote, revoke consent, see standard tariff (Playwright) |
| Fairness | Disparity metrics computed on the synthetic cohort in CI; build fails if the threshold is exceeded |
| Security | Dependency and secret scanning; manual checklist for auth and RLS |

---

## 16. DevOps and Environments

- Environments: local (Docker Compose with Supabase CLI), staging, production.
- CI on every pull request: lint, unit tests, RLS tests, build images.
- CD: merge to `main` deploys to staging; a tagged release deploys to production.
- Database changes only through versioned migrations in `supabase/migrations`.
- Configuration through environment variables; `.env.example` committed without secrets.
- Branching: trunk-based with short-lived feature branches and mandatory review.

---

## 17. Analytics and KPIs

| Area | KPI |
|---|---|
| Adoption | Consent opt-in rate; share of customers on behavioural pricing |
| Pricing quality | Score-to-claims lift (top versus bottom decile); simulated loss ratio change |
| Trust | Explanation comprehension rate; consent revocation rate |
| Fairness | Maximum group disparity; number of flags per ruleset |
| Engagement | Weekly active customers; what-if usage |
| System | p95 latency, error rate, ingestion rejection rate |

---

## 18. Delivery Plan (hackathon timeline)

Adjust to the real time available; the order matters more than the durations.

| Block | Deliverables |
|---|---|
| 1. Foundations | Repo, Supabase project, auth with Google OAuth, schema and RLS, role guards |
| 2. Data and engine | Synthetic generator, trip simulator, ingestion, feature extraction, scorecard, pricing formula in Spring Boot |
| 3. Customer experience | Consent centre, dashboard, explanation, what-if |
| 4. Insurer experience | Portfolio charts, drill-down, fairness monitor, audit log |
| 5. Hardening and demo | RLS tests, seed demo data, README, pitch deck, rehearsal |

Suggested team split: one person on Supabase (schema, RLS, auth, storage, CI), one on the Spring Boot pricing service, one or two on the Next.js customer and insurer UI, one on data generation, fairness and the pitch.

---

## 19. Demo Script

1. Two customers, same age band, vehicle and coverage. Driver A is careful, driver B is aggressive.
2. Run the simulator for both. Show different scores and premiums, each with a plain-language explanation.
3. Use the what-if slider on driver B: reduce night driving and watch the premium drop.
4. Revoke consent for driver A. The price returns to the standard tariff, and the audit log and ledger show the event.
5. Switch to the insurer console: portfolio distribution, fairness monitor, ruleset simulation.
6. Close with the roadmap: wearable and IoT connectors, real claims calibration.

---

## 20. Risks and Open Questions

| # | Item | Owner | Decision needed by |
|---|---|---|---|
| Q1 | Which insurance line is the primary demo: motor only, or motor plus one mocked IoT discount? | Team | Start of build |
| Q2 | Can the available hosting run Java 21 and Spring Boot, or should the pricing service use a free container host? | DevOps | Block 1 |
| Q3 | Will judges expect a trained ML model, or is a transparent scorecard with an ML challenger acceptable? | Team | Block 2 |
| Q4 | Language for explanations (English only for MVP?) | Product | Block 3 |
| Q5 | Real-device phone-sensor demo, or the simulator only? | Team | Block 2 |

---

## 21. Glossary

**Telematics:** collection of driving data from vehicles or phones. **Behaviour factor:** multiplier from measured driving behaviour. **Standard tariff:** price without behavioural data. **RLS:** Row Level Security, database rules limiting which rows each user can access. **Ledger:** append-only record of consent events. **Ruleset:** versioned set of weights and caps used by the pricing engine.