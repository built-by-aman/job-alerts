# CV Generation Mode

Use this mode when generating a tailored CV for a specific job.

## Input
- Evaluation report for the job (from evaluate.md)
- User profile from `config/profile.yml`
- CV template from `templates/cv-template.md`
- The job description (full text if available)

## Tailoring Principles

1. **Mirror the JD language** — use the same terms the JD uses (e.g., if JD says "distributed systems", use that phrase, not "scalable backend")
2. **Reorder experience bullets** — put the most relevant highlights first for this specific role
3. **Trim irrelevant content** — if a skill or project is not relevant to this JD, cut it or minimize it
4. **Quantify everything possible** — prefer "reduced latency by 40%" over "improved performance"
5. **Match the role level** — for senior roles, lead with ownership/impact; for mid roles, balance technical depth with impact

## What to Tailor Per Job

### Summary / Objective
- Write a 3-sentence summary that speaks directly to what this company is looking for
- Mention their domain (fintech, SaaS, etc.) if it matches the user's background
- Use keywords from the JD naturally

### Skills Section
- Lead with the skills the JD explicitly asks for
- Remove skills that are irrelevant to this role entirely
- Add frameworks/tools from JD that the user knows but didn't list prominently

### Experience Bullets
- For each role, pick the 3-4 highlights most relevant to this JD
- Rewrite bullets to use the JD's language where honest
- If the user built something similar to what the JD asks for, make that connection explicit

### Projects
- Include only projects relevant to the role's domain or tech stack
- Lead with impact, not description

## Output Format

Save the CV as `results/YYYY-MM-DD/{Company}-{Role}-cv.md`

Use the structure from `templates/cv-template.md` and fill it with tailored content.

At the top of the file, include a metadata block:

```markdown
---
job: [Company] — [Role Title]
score: X.X
apply_url: [url]
generated: YYYY-MM-DD
---
```

## Important Rules

- NEVER invent experience or skills the user doesn't have
- NEVER change numbers/metrics unless correcting formatting
- Keep the CV to one page worth of content (roughly 600-800 words of body text)
- If the user has insufficient experience for a section, omit the section rather than padding it
- The goal is honest tailoring, not fabrication

## After Generating

Tell the user:
1. Which file the CV was saved to
2. The top 2-3 things you tailored for this role
3. Any gaps between the JD requirements and the profile that they should address in a cover note or during the interview
