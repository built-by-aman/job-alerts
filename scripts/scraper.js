#!/usr/bin/env node
/**
 * job-alerts scraper
 * Scrapes Indian job portals for new listings
 * Run: node scripts/scraper.js
 */

import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import yaml from 'js-yaml';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

// Load configs
const searchConfig = yaml.load(fs.readFileSync(path.join(ROOT, 'config/search.yml'), 'utf8'));
const profileConfig = yaml.load(fs.readFileSync(path.join(ROOT, 'config/profile.yml'), 'utf8'));

// Load existing tracker to deduplicate
function loadTrackedUrls() {
  const trackerPath = path.join(ROOT, 'results/tracker.md');
  if (!fs.existsSync(trackerPath)) return new Set();
  const content = fs.readFileSync(trackerPath, 'utf8');
  const urls = new Set();
  const urlRegex = /https?:\/\/[^\s|)]+/g;
  const matches = content.match(urlRegex) || [];
  matches.forEach(url => urls.add(url.trim()));
  return urls;
}

// Get today's date string
function today() {
  return new Date().toISOString().split('T')[0];
}

// Get cutoff date (days_back from config)
function getCutoffDate() {
  const d = new Date();
  d.setDate(d.getDate() - (searchConfig.search.days_back || 1));
  return d;
}

// Sleep helper
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

// ─── SCRAPERS ───────────────────────────────────────────────────────────────

async function scrapeNaukri(page, keyword, location) {
  const jobs = [];
  try {
    const slug = keyword.toLowerCase().replace(/\s+/g, '-');
    const loc = location.toLowerCase().replace(/\s+/g, '-');
    const expMin = searchConfig.search.experience_range?.min || 2;
    const expMax = searchConfig.search.experience_range?.max || 6;
    const url = `https://www.naukri.com/${slug}-jobs-in-${loc}?experience=${expMin}to${expMax}`;

    console.log(`  [Naukri] Searching: ${keyword} in ${location}`);
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await sleep(3000);

    const jobCards = await page.$$eval('article.jobTuple, .job-tuple-wrapper, [class*="jobTuple"]', (cards) => {
      return cards.slice(0, 15).map(card => {
        const title = card.querySelector('[class*="title"], .title a, h2 a')?.textContent?.trim() || '';
        const company = card.querySelector('[class*="companyName"], .comp-name')?.textContent?.trim() || '';
        const location = card.querySelector('[class*="location"], .loc span')?.textContent?.trim() || '';
        const experience = card.querySelector('[class*="experience"], .exp span')?.textContent?.trim() || '';
        const salary = card.querySelector('[class*="salary"], .salary span')?.textContent?.trim() || 'Not mentioned';
        const posted = card.querySelector('[class*="freshness"], .job-post-day')?.textContent?.trim() || '';
        const link = card.querySelector('a[href*="naukri.com"]')?.href || card.querySelector('a')?.href || '';
        return { title, company, location, experience, salary, posted, apply_url: link, portal: 'Naukri' };
      }).filter(j => j.title && j.company);
    });

    jobs.push(...jobCards);
    console.log(`  [Naukri] Found ${jobCards.length} jobs`);
  } catch (err) {
    console.error(`  [Naukri] Error: ${err.message}`);
  }
  return jobs;
}

async function scrapeInstahyre(page, keyword, location) {
  const jobs = [];
  try {
    const q = encodeURIComponent(keyword);
    const l = encodeURIComponent(location);
    const url = `https://www.instahyre.com/search-jobs/?q=${q}&l=${l}`;

    console.log(`  [Instahyre] Searching: ${keyword} in ${location}`);
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await sleep(3000);

    const jobCards = await page.$$eval('[class*="job-card"], [class*="jobCard"], .opportunity-card', (cards) => {
      return cards.slice(0, 15).map(card => {
        const title = card.querySelector('h2, h3, [class*="title"], [class*="role"]')?.textContent?.trim() || '';
        const company = card.querySelector('[class*="company"], [class*="employer"]')?.textContent?.trim() || '';
        const location = card.querySelector('[class*="location"], [class*="city"]')?.textContent?.trim() || '';
        const experience = card.querySelector('[class*="experience"], [class*="exp"]')?.textContent?.trim() || '';
        const link = card.querySelector('a')?.href || '';
        return { title, company, location, experience, salary: 'Not mentioned', posted: 'Recent', apply_url: link, portal: 'Instahyre' };
      }).filter(j => j.title && j.company);
    });

    jobs.push(...jobCards);
    console.log(`  [Instahyre] Found ${jobCards.length} jobs`);
  } catch (err) {
    console.error(`  [Instahyre] Error: ${err.message}`);
  }
  return jobs;
}

async function scrapeLinkedIn(page, keyword, location) {
  const jobs = [];
  try {
    const q = encodeURIComponent(keyword);
    const l = encodeURIComponent(location + ', India');
    const url = `https://www.linkedin.com/jobs/search/?keywords=${q}&location=${l}&f_TPR=r86400&sortBy=DD`;

    console.log(`  [LinkedIn] Searching: ${keyword} in ${location}`);
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await sleep(4000);

    const jobCards = await page.$$eval('.jobs-search__results-list li, .base-card', (cards) => {
      return cards.slice(0, 15).map(card => {
        const title = card.querySelector('.base-search-card__title, h3')?.textContent?.trim() || '';
        const company = card.querySelector('.base-search-card__subtitle, h4')?.textContent?.trim() || '';
        const location = card.querySelector('.job-search-card__location, .base-search-card__metadata span')?.textContent?.trim() || '';
        const posted = card.querySelector('time')?.getAttribute('datetime') || '';
        const link = card.querySelector('a[href*="linkedin.com/jobs"]')?.href || '';
        return { title, company, location, experience: 'See JD', salary: 'Not mentioned', posted, apply_url: link, portal: 'LinkedIn' };
      }).filter(j => j.title && j.company);
    });

    jobs.push(...jobCards);
    console.log(`  [LinkedIn] Found ${jobCards.length} jobs`);
  } catch (err) {
    console.error(`  [LinkedIn] Error: ${err.message}`);
  }
  return jobs;
}

async function scrapeHirist(page, keyword, location) {
  const jobs = [];
  try {
    const q = encodeURIComponent(keyword);
    const l = encodeURIComponent(location);
    const url = `https://www.hirist.tech/search?q=${q}&location=${l}`;

    console.log(`  [Hirist] Searching: ${keyword} in ${location}`);
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await sleep(3000);

    const jobCards = await page.$$eval('[class*="job-card"], [class*="list-item"]', (cards) => {
      return cards.slice(0, 15).map(card => {
        const title = card.querySelector('h2, h3, [class*="title"]')?.textContent?.trim() || '';
        const company = card.querySelector('[class*="company"]')?.textContent?.trim() || '';
        const location = card.querySelector('[class*="location"]')?.textContent?.trim() || '';
        const experience = card.querySelector('[class*="exp"]')?.textContent?.trim() || '';
        const link = card.querySelector('a')?.href || '';
        return { title, company, location, experience, salary: 'Not mentioned', posted: 'Recent', apply_url: link, portal: 'Hirist' };
      }).filter(j => j.title && j.company);
    });

    jobs.push(...jobCards);
    console.log(`  [Hirist] Found ${jobCards.length} jobs`);
  } catch (err) {
    console.error(`  [Hirist] Error: ${err.message}`);
  }
  return jobs;
}

// ─── MAIN ───────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n Job Alerts — India Job Search');
  console.log(`Date: ${today()}`);
  console.log(`Keywords: ${searchConfig.search.keywords.join(', ')}`);
  console.log(`Locations: ${searchConfig.search.locations.join(', ')}`);
  console.log('─'.repeat(50));

  const trackedUrls = loadTrackedUrls();
  const allJobs = [];

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    viewport: { width: 1280, height: 800 }
  });

  const page = await context.newPage();

  const portals = searchConfig.portals;
  const keywords = searchConfig.search.keywords;
  const locations = searchConfig.search.locations;

  // Scrape each enabled portal
  for (const keyword of keywords.slice(0, 3)) { // limit to 3 keywords to avoid overload
    for (const location of locations.slice(0, 2)) { // limit to 2 locations
      if (portals.naukri?.enabled) {
        const jobs = await scrapeNaukri(page, keyword, location);
        allJobs.push(...jobs);
        await sleep(3000);
      }
      if (portals.instahyre?.enabled) {
        const jobs = await scrapeInstahyre(page, keyword, location);
        allJobs.push(...jobs);
        await sleep(3000);
      }
      if (portals.linkedin?.enabled) {
        const jobs = await scrapeLinkedIn(page, keyword, location);
        allJobs.push(...jobs);
        await sleep(4000);
      }
      if (portals.hirist?.enabled) {
        const jobs = await scrapeHirist(page, keyword, location);
        allJobs.push(...jobs);
        await sleep(3000);
      }
    }
  }

  await browser.close();

  // Deduplicate by URL and against tracker
  const seen = new Set();
  const newJobs = allJobs.filter(job => {
    if (!job.apply_url || seen.has(job.apply_url) || trackedUrls.has(job.apply_url)) return false;
    // Filter blacklisted companies
    const blacklist = searchConfig.blacklist || [];
    if (blacklist.some(b => b && job.company.toLowerCase().includes(b.toLowerCase()))) return false;
    seen.add(job.apply_url);
    return true;
  });

  console.log('\n' + '─'.repeat(50));
  console.log(`Total jobs found: ${allJobs.length}`);
  console.log(`New jobs (not seen before): ${newJobs.length}`);

  // Save raw results for Claude Code to evaluate
  const resultsDir = path.join(ROOT, 'results', today());
  fs.mkdirSync(resultsDir, { recursive: true });

  const outputPath = path.join(resultsDir, 'scraped-jobs.json');
  fs.writeFileSync(outputPath, JSON.stringify(newJobs, null, 2));
  console.log(`\nSaved to: results/${today()}/scraped-jobs.json`);
  console.log('\nNow ask Claude Code to: "Evaluate the scraped jobs and generate CVs"\n');

  return newJobs;
}

main().catch(console.error);
