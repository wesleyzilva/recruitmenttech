# RecruitmentTech — Competency Matrix for AI-Ready Engineering Squads

> Data-driven technical screening — empathy comes at the in-person interview, not before.

---

## Objective

Evaluate candidates through a structured competency matrix and generate automatically:
- **Numeric score** per candidate
- **Profile classification** (Junior / Mid-level / Senior / Tech Leader)
- **Exportable CSV** with squad ranking

**Proficiency scale (3 levels):**

| Score | Label | Meaning |
|-------|-------|---------|
| 1 | Learner | Has heard of it / studying — never used in production |
| 2 | Practitioner | Uses it daily with full autonomy |
| 3 | Teacher | Sets the standard, does code reviews, raises the team bar |

---

## How It Works

```
[Candidate]
    ↓ fills in
[Google Form]       ← Full name + LinkedIn URL only
    ↓ auto-saved
[Google Sheets]     ← Recruiter scores 50 skills manually (1–3) after LinkedIn review
    ↓ Apps Script trigger (onEdit)
[Score + Profile]  →  CSV on Google Drive  →  Email to recruiter
```

**Repository structure:**

```
recruitmentTech/
├── README.md                    ← this guide
├── apps_script/
│   ├── score.gs                 ← score calculation + profile classification (onEdit trigger)
│   ├── export_csv.gs            ← exports CSV to Google Drive
│   └── trigger_email.gs         ← sends summary email when a candidate is fully scored
├── form/
│   └── perguntas_form.md        ← Google Form setup guide
├── sheets/
│   └── matriz_competencias.md   ← Google Sheets column layout and setup
└── exemplos/
    └── candidato_exemplo.csv    ← sample CSV with calculated scores
```

---

## Google Form — Candidate Input

The form collects **identification only**. Skill assessment is done by the recruiter.

| Field | Type | Notes |
|-------|------|-------|
| Full Name | Short text | Required |
| LinkedIn URL | Short text | Required — used for skill review |

> After the candidate submits, the recruiter opens the Sheets row and fills in columns D onwards with scores 1–3 per skill.

---

## Competency Matrix — 50 Skills for AI-Ready Squads

> All skills carry equal weight within their category.

### Hard Skills — Technical (10 skills · 30% of total score)

| # | Skill | What it means |
|---|-------|---------------|
| 1 | **Backend (Java / Python / Node.js)** | Builds APIs, services and business domain logic |
| 2 | **Frontend (Angular / React / TypeScript)** | Delivers functional, accessible interfaces |
| 3 | **Cloud (AWS / GCP / Azure)** | Provisions infrastructure, deploys, manages observability |
| 4 | **AI / LLM Integration** | Works with LLM APIs (OpenAI, Gemini, Bedrock), RAG, prompt engineering |
| 5 | **DevOps / CI-CD** | Docker, Kubernetes, pipelines, GitHub Actions |
| 6 | **SQL & NoSQL Databases** | Models schemas, writes queries, tunes indexes, uses Redis/Mongo |
| 7 | **Testing (Unit / Integration / E2E)** | JUnit, Jest, Cypress, meaningful coverage |
| 8 | **Security (OWASP / Auth / LGPD)** | JWT, OAuth2, input validation, data privacy basics |
| 9 | **REST / GraphQL API Design** | Designs contracts, versioning, error handling, pagination |
| 10 | **System Design** | Decompose large systems, trade-off analysis, capacity estimation |

### Hard Skills — Process (10 skills · 20% of total score)

| # | Skill | What it means |
|---|-------|---------------|
| 11 | **Git / Version Control** | Gitflow, PR discipline, rebase, meaningful commits |
| 12 | **Software Architecture Patterns** | Microservices, event-driven, DDD, hexagonal |
| 13 | **Observability & Monitoring** | Structured logs, metrics, tracing (Datadog, Kibana, OpenTelemetry) |
| 14 | **Prompt Engineering** | Writes effective prompts, validates AI outputs, reduces hallucination risk |
| 15 | **Technical Documentation** | ADRs, READMEs, Swagger, architecture decision rationale |
| 16 | **Agile / Scrum** | Estimations, refinement, retrospectives, continuous delivery |
| 17 | **Code Review** | Gives constructive feedback, catches bugs and design issues |
| 18 | **Incident Response** | Root cause analysis, blameless post-mortems, runbooks |
| 19 | **Data Modelling** | Normalisation, denormalisation, event sourcing, migration strategies |
| 20 | **Performance Optimisation** | Profiling, query tuning, caching strategies, load testing |

### Soft Skills (10 skills · 20% of total score)

| # | Skill | What it means |
|---|-------|---------------|
| 21 | **Adaptability** | Picks up new tools and languages quickly, embraces change |
| 22 | **Critical Thinking** | Questions AI outputs, validates before applying, challenges assumptions |
| 23 | **Autonomy** | Unblocks themselves without waiting for hand-off |
| 24 | **Async Communication** | Writes clearly, documents decisions, keeps the team informed |
| 25 | **Continuous Learning** | Studies outside work hours, follows industry trends |
| 26 | **Collaboration** | Does unsolicited code reviews, pairs productively, raises team quality |
| 27 | **Mentorship** | Shares knowledge, creates learning materials, grows others |
| 28 | **Complex Problem Solving** | Breaks down large problems, proposes structured solutions |
| 29 | **Ownership & Accountability** | Sees things through to production, takes responsibility for outcomes |
| 30 | **English Proficiency (C1/C2)** | Reads docs, writes PRs, joins international calls with confidence |

### Leadership & Organisational Impact (10 skills · 15% of total score)

> These behaviours signal how far a candidate has grown beyond individual contribution — the depth of organisational imprint they have left.

| # | Skill | What it means |
|---|-------|---------------|
| 31 | **Stakeholder Management** | Navigates cross-functional relationships; translates technical constraints into business language for executives and product |
| 32 | **Technical Vision & Roadmap** | Defines medium-term technical direction (12–24 months) aligned with company OKRs and business strategy |
| 33 | **Cross-functional Leadership** | Drives initiatives spanning multiple squads or domains without formal authority |
| 34 | **People Development** | Identifies high-potential engineers, creates structured growth plans, holds impactful 1:1s |
| 35 | **Hiring & Bar Raising** | Conducts structured interviews, calibrates the hiring bar, evaluates cultural and technical fit accurately |
| 36 | **Executive Communication** | Presents trade-offs and technical decisions at C-level with clarity, framing and business impact |
| 37 | **Organisational Influence** | Drives adoption of engineering standards, practices, and culture beyond one’s own team |
| 38 | **Conflict & Alignment** | Mediates technical disagreements; aligns diverse stakeholders toward a shared decision without leaving friction |
| 39 | **Budget & Cost Awareness** | Understands infrastructure cost models, estimates engineering effort for roadmap planning, optimises team ROI |
| 40 | **Strategic Prioritisation** | Manages tech debt vs. feature trade-offs effectively, says no with data, maps work to company-wide OKRs |

### Company & Culture Alignment (10 skills · 15% of total score)

> These signals reveal how deeply a candidate internalises the company’s mission, security posture, product domain and culture — the difference between a contractor and a builder.

| # | Skill | What it means |
|---|-------|---------------|
| 41 | **Trade-off Argumentation** | Structures and defends technical trade-offs with clear rationale, data and business context; says no constructively and proposes alternatives rather than just objecting |
| 42 | **Security Culture** | Treats security as a first-class concern across OWASP, PCI, LGPD and threat modelling; raises risks proactively — never waits to be asked |
| 43 | **Business Domain Knowledge** | Understands the company’s verticals, revenue drivers, key customer pain points and competitive context; maps every technical decision to a business outcome |
| 44 | **Regulatory & Compliance Awareness** | Knows and correctly applies LGPD, PCI-DSS, SOX and other relevant regulations; designs compliant solutions from inception, not as an afterthought |
| 45 | **WOW Delivery** | Consistently ships features with exceptional quality, polish and UX attention that exceeds the spec and leaves stakeholders genuinely impressed |
| 46 | **Culture & Values Embodiment** | Actively lives and amplifies the company’s core values in daily behaviour; visible culture carrier across teams even when no one is watching |
| 47 | **Customer Empathy** | Deeply understands end-user pain points; advocates for the customer in every technical decision; comfortable speaking directly with users |
| 48 | **Proactive Initiative** | Spots gaps, risks or opportunities outside their defined scope and moves on them without being asked — no ticket required |
| 49 | **Data Privacy by Design** | Embeds data minimisation, protection and governance into solutions from the first line of code; never retrofits compliance |
| 50 | **Internal Reputation & Trust** | Has built genuine credibility with peers, management and cross-functional partners; people naturally seek their input and trust their judgement |

---

## Scoring Formula

```
Score_Hard_Technical = avg(skills 1–10)  × 0.30
Score_Hard_Process   = avg(skills 11–20) × 0.20
Score_Soft           = avg(skills 21–30) × 0.20
Score_Leadership     = avg(skills 31–40) × 0.15
Score_Company        = avg(skills 41–50) × 0.15

Score_Final = (Score_Hard_Technical + Score_Hard_Process + Score_Soft + Score_Leadership + Score_Company) / 3 × 100
             (max possible: avg 3.0 across all 5 categories → Score 100)
```

### Profile Classification

| Profile | Score | Additional rule |
|---------|-------|-----------------|
| Junior | 20–44 | — |
| Mid-level | 45–64 | — |
| Senior | 65–79 | Hard Technical avg ≥ 2.3 |
| Tech Leader | 80–100 | Soft avg ≥ 2.5 AND Leadership avg ≥ 2.0 AND Mentorship = 3 |

> The **Company & Culture** category does not gate any profile threshold — it enriches the total score and surfaces cultural alignment for the recruiter’s qualitative review.

---

## Sheets Column Layout

| Column Range | Content |
|-------------|----------|
| A | Timestamp |
| B | Full Name |
| C | LinkedIn URL |
| D–M | Hard Technical skills 1–10 |
| N–W | Hard Process skills 11–20 |
| X–AG | Soft skills 21–30 |
| AH–AQ | Leadership & Organisational Impact skills 31–40 |
| AR–BA | Company & Culture Alignment skills 41–50 |
| BB | `score_hard_tec` |
| BC | `score_hard_proc` |
| BD | `score_soft` |
| BE | `score_leadership` |
| BF | `score_company` |
| BG | `score_total` |
| BH | `profile` |

---

## Development Roadmap

### Phase 1 — Google Form
- [ ] Create form with two fields: Full Name + LinkedIn URL
- [ ] Link form responses to Google Sheets
- [ ] Add 50 skill columns (D–BA) with headers matching the matrix above

### Phase 2 — Recruiter Evaluation Workflow
- [ ] Recruiter reviews LinkedIn profile
- [ ] Fills scores 1–3 for each of the 50 skills in the candidate’s row
- [ ] Apps Script `onEdit` trigger fires automatically on row completion

### Phase 3 — Automated Scoring (Apps Script)
- [ ] `score.gs` calculates score per category and total
- [ ] Writes `score_hard_tec`, `score_hard_proc`, `score_soft`, `score_leadership`, `score_company`, `score_total`, `profile` to output columns

### Phase 4 — CSV Export
- [ ] `export_csv.gs` exports all candidates sorted by score descending
- [ ] Saved to Google Drive with date stamp

### Phase 5 — Email Notification
- [ ] `trigger_email.gs` sends recruiter a summary when score ≥ 65 (Senior+)

### Phase 6 — Squad Competency Gap Analysis
- [ ] "Matrix" tab in Sheets: define minimum score per skill for current squad
- [ ] Candidate vs squad ideal profile comparison
- [ ] Dashboard: skill gaps identified

---

## CSV Output (column reference)

```
name,linkedin,score_hard_tec,score_hard_proc,score_soft,score_leadership,score_company,score_total,profile,scored_date
Wesley Silva,linkedin.com/in/wesleyzilva,2.8,2.5,2.7,2.6,2.9,91.3,Tech Leader,2026-05-02
```

---

## Links

- Repo: https://github.com/wesleyzilva/recruitmenttech
- Google Form: _(paste URL here)_
- Google Sheets: _(paste URL here)_
- Google Drive CSV folder: _(paste URL here)_

---

> **Next step:** set up the Google Form (name + LinkedIn only), connect to Sheets, add the 50 skill columns D–BA, then install `score.gs` with the `onEdit` trigger.
