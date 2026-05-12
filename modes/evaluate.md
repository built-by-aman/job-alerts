# Job Evaluation Mode

Use this mode when evaluating a job posting against the user's profile.

## Input
- Job posting (URL, pasted JD, or scraped JSON entry)
- User profile from `config/profile.yml`
- User preferences from `config/search.yml`

## Scoring Rubric (0-5 scale)

Score each dimension, then average for a final score.

### 1. Skills Match (0-5)
- 5: 80%+ of required skills match profile's primary/secondary skills
- 4: 60-80% match; missing skills are learnable or adjacent
- 3: 40-60% match; some gaps but core skills align
- 2: 20-40% match; significant gaps
- 1: <20% match; wrong tech stack entirely

### 2. Level & Experience Fit (0-5)
- 5: Required experience exactly matches profile (±1 year)
- 4: Within 1-2 years either way; level title matches
- 3: Slight over/under-qualification; role is reachable
- 2: Notably overqualified or underqualified
- 1: Wrong level entirely (e.g., 10 YOE required, profile has 2)

### 3. Salary Alignment (0-5)
- 5: Offered range is at or above expected CTC
- 4: Offered range is within 10% below expected CTC
- 3: Offered range is 10-25% below expected CTC
- 2: Offered range is 25-40% below expected CTC
- 1: No salary mentioned OR significantly below expected
- Note: if salary not mentioned, default to 2.5 and flag it

### 4. Company Quality (0-5)
- 5: Tier 1 product company (see _shared.md); domain match
- 4: Tier 2 product company; strong brand; good engineering culture
- 3: Unknown startup with good signals (funded, product-focused)
- 2: Service company OR unknown with weak signals
- 1: Tier 3 service company; body shop; known red-flag employer

### 5. Role & Domain Preference (0-5)
- 5: Exact role type and domain from profile preferences
- 4: Role type matches; domain is acceptable
- 3: Adjacent role type (e.g., wanted backend, this is full-stack)
- 2: Partial mismatch; contains things user wants to avoid
- 1: Clear mismatch with stated preferences

### 6. Location & Work Mode (0-5)
- 5: Preferred city AND preferred work mode (remote/hybrid/on-site)
- 4: Preferred city OR preferred work mode
- 3: Acceptable city; work mode is negotiable
- 2: Not preferred city but not blacklisted; work mode mismatch
- 1: Explicitly avoided work mode OR unacceptable location

## Final Score

```
final_score = average(skills, level, salary, company, role, location)
```

Rounding: keep one decimal place.

## Output Format

For each job, produce this evaluation report:

```markdown
# [Company] — [Role Title]
**Portal:** [Naukri / LinkedIn / Instahyre / Hirist]
**Apply URL:** [url]
**Posted:** [date or "Recent"]

## Score: X.X / 5.0  →  [STRONG MATCH / GOOD MATCH / WEAK MATCH / SKIP]

| Dimension | Score | Note |
|-----------|-------|------|
| Skills Match | X/5 | [brief note] |
| Level Fit | X/5 | [brief note] |
| Salary | X/5 | [offered vs expected] |
| Company | X/5 | [tier + signals] |
| Role/Domain | X/5 | [match or mismatch] |
| Location/Mode | X/5 | [city + remote/hybrid/on-site] |

## Why Apply
[2-3 bullet points on what makes this worth applying to]

## Watch Out For
[1-2 bullet points on concerns or red flags, if any]

## CV Tailoring Notes
[3-5 specific notes on what to emphasize in the CV for this role:
- Which skills from profile to highlight
- Which experience bullets are most relevant
- What to de-emphasize]

## Decision: [APPLY / CONSIDER / SKIP]
[One line reason]
```

## Score → Decision Mapping

| Score | Decision | Action |
|-------|----------|--------|
| 4.0 - 5.0 | APPLY | Generate tailored CV |
| 3.0 - 3.9 | CONSIDER | Log, show to user, no CV |
| < 3.0 | SKIP | Log with reason, no further action |

## When Evaluating Batches

When evaluating `scraped-jobs.json`:
1. Load all jobs from the file
2. Evaluate each job using the rubric above
3. Save each evaluation to `results/YYYY-MM-DD/{Company}-{Role}.md`
4. For jobs scoring ≥ 4.0, trigger CV generation (see cv-generate.md)
5. After all evaluations, write `results/YYYY-MM-DD/summary.md`
6. Update `results/tracker.md` with all new entries

## Summary Report Format

```markdown
# Job Search Summary — YYYY-MM-DD

## Results
- Total scraped: X
- Evaluated: X
- Strong matches (≥4.0): X
- Consider (3.0-3.9): X
- Skipped (<3.0): X

## Strong Matches — Apply Today
| Company | Role | Score | Salary | Apply |
|---------|------|-------|--------|-------|
| ... | ... | ... | ... | [link] |

## Worth Considering
| Company | Role | Score | Note |
|---------|------|-------|------|
| ... | ... | ... | ... |

## CVs Generated
- results/YYYY-MM-DD/{Company}-{Role}-cv.md
- ...
```
