# 🇮🇳 Job Alerts — India Job Search System

AI-powered job search for Indian portals. Built for Claude Code.

---

## What This Does

Every morning, this system:
1. Scrapes Naukri, Instahyre, LinkedIn, Hirist for new jobs
2. Evaluates each job against your profile (A-F scoring)
3. Generates tailored CVs for good-fit jobs (score ≥ 4.0)
4. Saves everything to `results/YYYY-MM-DD/`
5. You spend 20-30 min reviewing and clicking Apply

**You never need to spend hours crafting a CV per job again.**

---

## Setup (One Time)

### 1. Install dependencies
```bash
npm install
npx playwright install chromium
```

### 2. Fill your profile
Edit `config/profile.yml` with your details — skills, experience, preferences.
The more detail you give, the better the CV tailoring.

### 3. Set your search preferences
Edit `config/search.yml` — keywords, locations, salary expectations, which portals to scan.

---

## Daily Usage

### Option A: Claude Code (Recommended)
Open Claude Code in this folder:
```bash
cd job-alerts
claude
```
Then ask:
- `"Run job search"` — full pipeline
- `"Find new jobs from yesterday"` — scrape + evaluate
- `"Evaluate this job: [paste URL or JD]"` — single job
- `"Show results"` — see today's findings
- `"Generate CV for Razorpay backend role"` — generate a CV
- `"Show my pipeline"` — see tracker

### Option B: Run scraper manually, then use Claude Code
```bash
npm run scrape          # scrapes portals, saves to results/YYYY-MM-DD/
claude                  # open Claude Code
# ask: "Evaluate today's scraped jobs"
```

### Option C: Full automated run
```bash
bash scripts/run.sh     # runs everything
```

---

## Results Structure

```
results/
├── tracker.md                    ← Master list of all jobs
└── 2024-01-15/
    ├── scraped-jobs.json          ← Raw jobs from scraper
    ├── Razorpay-BackendEngineer.md        ← Evaluation report
    ├── Razorpay-BackendEngineer-cv.md     ← Tailored CV
    ├── CRED-SDE2.md
    ├── CRED-SDE2-cv.md
    └── summary.md                 ← Daily digest
```

---

## What You Do Manually

1. Review the daily summary in `results/YYYY-MM-DD/summary.md`
2. Read evaluation reports for jobs scored ≥ 4.0
3. Open the apply URL, upload the tailored CV PDF
4. Fill in form fields (name, experience, notice period, etc.)
5. Update tracker status to APPLIED

**That's it. 20-30 min per morning instead of hours.**

---

## Portals Supported

| Portal | Type | Quality |
|--------|------|---------|
| Naukri | Largest volume | Mixed |
| Instahyre | Pre-screened, product companies | High |
| LinkedIn | Direct company posts | High |
| Hirist | Tech-focused | Good |
| Foundit | Mixed | Medium |

---

## Important Notes

- This system **never applies on your behalf** — you always click Apply yourself
- No credentials stored — scraping uses public pages only
- Naukri/LinkedIn block bots — if blocked, the scraper skips and continues
- Update your `config/profile.yml` whenever your situation changes

---

## Folder Structure

```
job-alerts/
├── CLAUDE.md              ← Instructions for Claude Code (don't delete)
├── README.md              ← This file
├── package.json
├── config/
│   ├── profile.yml        ← YOUR profile (EDIT THIS)
│   └── search.yml         ← Search preferences (EDIT THIS)
├── modes/
│   ├── _shared.md         ← India job market context
│   ├── evaluate.md        ← Job evaluation logic
│   ├── cv-generate.md     ← CV tailoring logic
│   └── scan.md            ← Portal scraping instructions
├── scripts/
│   ├── scraper.js         ← Playwright scraper
│   └── run.sh             ← Main runner
├── templates/
│   └── cv-template.md     ← Base CV structure
└── results/
    ├── tracker.md         ← Master tracker
    └── YYYY-MM-DD/        ← Daily results
```
