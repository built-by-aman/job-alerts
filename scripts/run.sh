#!/bin/bash
# One-command runner: scrape + evaluate + generate CVs
# Usage: bash scripts/run.sh

set -e

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "Job Alerts — Full Pipeline"
echo "Date: $(date +%F)"
echo "──────────────────────────────────────────────────"

# Step 1: Scrape portals
echo ""
echo "[1/2] Scraping job portals..."
node scripts/scraper.js

# Step 2: Remind user to evaluate with Claude Code
echo ""
echo "[2/2] Scraping complete."
echo ""
echo "Open Claude Code and say:"
echo "  'Evaluate today's scraped jobs and generate CVs'"
echo ""
echo "Results saved to: results/$(date +%F)/"
