# Scan Mode — Manual Portal Search

Use this mode when the user asks you to search for jobs without running the scraper,
or when they paste a job URL / JD directly.

## When to Use This Mode

- User says: "Find jobs on Naukri for backend engineer"
- User says: "Evaluate this job: [URL or JD text]"
- Scraper failed or was skipped
- User wants a quick single-job check

## For a Single Job URL

1. Use WebFetch to fetch the page content
2. Extract: title, company, location, experience required, salary (if listed), JD text
3. Pass to evaluate.md for scoring
4. If score ≥ 4.0, offer to generate a CV

## For a Manual Portal Search

When the user asks you to search a portal manually:

1. Construct the search URL using the portal's known URL pattern (from search.yml)
2. Fetch the results page
3. Extract job listings (title, company, link)
4. For each listing, fetch the JD page and extract details
5. Evaluate using evaluate.md
6. Report results to user

### Naukri search URL pattern:
`https://www.naukri.com/{keyword-slug}-jobs-in-{location-slug}?experience={min}to{max}`

### LinkedIn search URL pattern:
`https://www.linkedin.com/jobs/search/?keywords={encoded-keyword}&location={encoded-location}%2C+India&f_TPR=r86400&sortBy=DD`

### Instahyre search URL pattern:
`https://www.instahyre.com/search-jobs/?q={encoded-keyword}&l={encoded-location}`

### Hirist search URL pattern:
`https://www.hirist.tech/search?q={encoded-keyword}&location={encoded-location}`

## Output

For manual scans, show the user a table of results before doing full evaluations:

```
Found X jobs. Evaluating top matches...

| # | Company | Role | Location | Quick Take |
|---|---------|------|----------|------------|
| 1 | ... | ... | ... | Skills match |
| 2 | ... | ... | ... | Salary too low |
```

Then evaluate the top 5-10 in full and present the summary.
