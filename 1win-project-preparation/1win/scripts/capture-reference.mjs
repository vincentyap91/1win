import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

// Run locally after installing Playwright. Guest-only; no form or click actions.
const root = fileURLToPath(new URL('../', import.meta.url));
const config = JSON.parse(await readFile(path.join(root, 'qa/audit.json'), 'utf8'));
const destination = path.join(root, 'reference', new Date().toISOString().replace(/[:.]/g, '-'));
await mkdir(destination, { recursive: true });
const run = {
  started_at: new Date().toISOString(),
  requested_url: config.reference_url,
  evidence_scope: 'Guest default states at CSS viewport sizes; not a full site audit.',
  captures: [],
  status: 'in_progress',
};
let browser;
try {
  const { chromium } = await import('playwright');
  browser = await chromium.launch({ headless: false });
  run.browser_version = browser.version();
  run.platform = process.platform;
  for (const viewport of config.viewports) {
    const context = await browser.newContext({
      viewport,
      deviceScaleFactor: 1,
      locale: 'en-US',
      colorScheme: 'light',
    });
    try {
      const page = await context.newPage();
      const response = await page.goto(config.reference_url, {
        waitUntil: 'domcontentloaded', timeout: 45000,
      });
      // Fonts and a short settle period help with ordinary client-rendered pages.
      // Dynamic banners are not frozen: all captures require manual validation.
      await page.evaluate(() => Promise.race([
        document.fonts.ready,
        new Promise(resolve => setTimeout(resolve, 5000)),
      ]));
      await page.waitForTimeout(2500);
      const label = `${viewport.width}x${viewport.height}`;
      const snapshot = await page.evaluate(() => {
        const safeUrl = value => {
          try {
            const url = new URL(value, location.href);
            return /^https?:$/.test(url.protocol) ? `${url.origin}${url.pathname}` : null;
          } catch { return null; }
        };
        const visible = element => {
          const rect = element.getBoundingClientRect();
          const style = getComputedStyle(element);
          return rect.width > 0 && rect.height > 0 && style.visibility !== 'hidden' && style.display !== 'none';
        };
        const selectors = 'header,nav,aside,main,section,footer,h1,h2,h3,p,a,button,input,select,textarea,img';
        const properties = ['fontFamily','fontSize','fontWeight','lineHeight','letterSpacing','color','backgroundColor','backgroundImage','padding','margin','gap','borderRadius','border','boxShadow','display','position','width','height'];
        return {
          title: document.title,
          url_without_query: safeUrl(location.href),
          viewport: { width: innerWidth, height: innerHeight },
          device_scale_factor: devicePixelRatio,
          prefers_color_scheme: matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
          scroll: { x: scrollX, y: scrollY },
          language: document.documentElement.lang,
          user_agent: navigator.userAgent,
          body_text_sample: document.body?.innerText.slice(0, 12000) || '',
          links: [...document.querySelectorAll('a[href]')].filter(visible).map(el => ({
            text: (el.textContent || '').trim().slice(0, 160), url_without_query: safeUrl(el.href),
          })),
          images: [...document.images].map(el => ({
            url_without_query: safeUrl(el.currentSrc || el.src),
            alt: el.alt, natural_width: el.naturalWidth, natural_height: el.naturalHeight,
          })),
          stylesheets: [...document.querySelectorAll('link[rel="stylesheet"]')].map(el => safeUrl(el.href)),
          elements: [...document.querySelectorAll(selectors)].filter(visible).slice(0, 2500).map(el => {
            const rect = el.getBoundingClientRect();
            const style = getComputedStyle(el);
            const sensitive = ['INPUT','TEXTAREA','SELECT'].includes(el.tagName);
            return {
              tag: el.tagName.toLowerCase(),
              text: sensitive ? '' : (el.textContent || '').trim().slice(0, 160),
              rectangle: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
              computed_style: Object.fromEntries(properties.map(key => [key, style[key]])),
            };
          }),
        };
      });
      const text = snapshot.body_text_sample;
      const denied = /site unavailable|unable to access this site|verify (?:that )?you are human|checking your browser|access denied|unusual traffic|not available in your (?:country|region)|geo.?restricted/i.test(text);
      const httpError = response && response.status() >= 400;
      const blank = !text.trim() && snapshot.images.length === 0;
      const status = denied || httpError || blank ? 'blocked_or_unusable' : 'captured_requires_manual_review';
      await page.screenshot({ path: path.join(destination, `${label}-viewport.png`) });
      if (status !== 'blocked_or_unusable') {
        await page.screenshot({ path: path.join(destination, `${label}-full.png`), fullPage: true });
      }
      await writeFile(path.join(destination, `${label}-measurements.json`), JSON.stringify(snapshot, null, 2));
      run.captures.push({ viewport, status, http_status: response?.status() ?? null, file_prefix: label });
      console.log(`${label}: ${status}`);
      if (status === 'blocked_or_unusable') {
        run.status = 'blocked';
        console.error('Reference could not be verified. Stopping without retries or alternate routes.');
        process.exitCode = 1;
        break;
      }
    } finally {
      await context.close();
    }
  }
  if (run.status === 'in_progress') run.status = 'captured_requires_manual_review';
} catch (error) {
  run.status = 'failed';
  // Do not dump network/request logs or browser profiles.
  run.error_type = error?.name || 'Error';
  console.error('Capture failed. Check dependency/browser installation and reference accessibility.');
  process.exitCode = 1;
} finally {
  if (browser) await browser.close();
  run.finished_at = new Date().toISOString();
  await writeFile(path.join(destination, 'capture-summary.json'), JSON.stringify(run, null, 2));
  console.log(`Evidence directory: ${destination}`);
}
