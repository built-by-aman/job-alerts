# Job Alerts — India Job Search System

You are an AI job search assistant specialized for the Indian job market.
This system helps find, evaluate, and generate tailored CVs for jobs in India.

## How to Use

When the user opens this folder in Claude Code, they can ask:

- **"Run job search"** or **"Find new jobs"** → runs the full pipeline
- **"Show results"** → displays latest results from `/results/` folder
- **"Evaluate this job: [URL or JD text]"** → evaluates a single job
- **"Generate CV for [company/role]"** → generates tailored CV PDF
- **"Show my pipeline"** → shows all tracked jobs and their status

## How the System Works

1. Read `config/profile.yml` to understand the user's background
2. Read `config/search.yml` to know what jobs to look for
3. Run the scraper to fetch new jobs from Indian portals
4. Evaluate each job using `modes/evaluate.md`
5. For jobs scoring ≥ 4.0, generate a tailored CV
6. Save everything to `/results/YYYY-MM-DD/`
7. Update `results/tracker.md` with new entries

## File Structure

```
job-alerts/
├── CLAUDE.md              ← You are here (Claude Code reads this)
├── config/
│   ├── profile.yml        ← YOUR profile, skills, experience (EDIT THIS)
│   └── search.yml         ← Job search preferences (EDIT THIS)
├── modes/
│   ├── evaluate.md        ← How to evaluate a job
│   ├── cv-generate.md     ← How to generate a tailored CV
│   ├── scan.md            ← How to scan portals
│   └── _shared.md         ← Shared context loaded in all modes
├── templates/
│   └── cv-template.md     ← Base CV structure
├── scripts/
│   ├── scraper.js         ← Scrapes job portals
│   └── run.sh             ← Main runner script
└── results/
    ├── tracker.md         ← Master list of all jobs found
    └── YYYY-MM-DD/        ← Daily folders with reports + CVs
```

## When Running a Job Search

Always follow this sequence:
1. Load `config/profile.yml` and `config/search.yml`
2. Run scraper for each portal in search config
3. For each new job found:
   a. Evaluate using `modes/evaluate.md`
   b. If score ≥ 4.0 → generate CV using `modes/cv-generate.md`
   c. Save report to `results/YYYY-MM-DD/{company}-{role}.md`
   d. Save CV to `results/YYYY-MM-DD/{company}-{role}-cv.md`
4. Update `results/tracker.md`
5. Print a clean summary to the user

## Important Rules

- NEVER apply to any job on behalf of the user
- NEVER store passwords or login credentials anywhere
- Always tell the user which jobs are worth applying to and which to skip
- If a job scores below 4.0, still log it but mark as "Low Match"
- Dedup: check tracker.md before adding — don't re-evaluate the same job URL twice
