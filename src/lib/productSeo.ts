import type { Product } from './types';

/**
 * Per-product SEO generation.
 *
 * Every product used to ship the same hard-coded title and description, which
 * meant 12 pages competed for one snippet and Google treated them as near
 * duplicates. Rather than asking the operator to hand-write SEO for each new
 * product, we DERIVE it from data that already exists on the product record:
 * name, fabric (buried inside `description`), colours, sizes and price.
 *
 * Generation happens at build time, so a product published through /admin gets
 * correct, unique SEO automatically with no extra input. `seoTitle` /
 * `seoDescription` remain supported as manual overrides for the rare case where
 * marketing wants bespoke copy.
 */

/** Legacy site-wide boilerplate that was stamped onto every product. */
export const LEGACY_SEO_TITLE =
  'Xianlu Workwear | Quality Workwear & Safety Clothing Australia';
export const LEGACY_SEO_DESCRIPTION =
  'Xianlu Workwear supplies premium workwear, hi-vis clothing, uniforms, PPE, and safety apparel across Australia. Quality products, competitive prices, reliable service, and fast shipping.';

/** Google truncates around here; staying under keeps the snippet intact. */
const MAX_DESCRIPTION = 160;

/** Max colours listed before we fall back to "and more". */
const MAX_COLOURS_LISTED = 4;

const BRANDING_CLAUSE = 'Logo embroidery & printing available.';

/* ------------------------------------------------------------------ */
/* Small text helpers                                                  */
/* ------------------------------------------------------------------ */

function titleWord(word: string): string {
  const lower = word.toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

/**
 * Uppercase the leading letter so a clause reads as a sentence. Leaves
 * non-alphabetic openers ("100% Polyester") untouched.
 */
function sentenceCase(text: string): string {
  return text.replace(/^([a-z])/, (c) => c.toUpperCase());
}

/** Strip everything but letters and digits, for duplicate detection. */
function fingerprint(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * "Orange, Yellow and Navy" — with a graceful cut-off once the list gets long
 * enough to eat the whole snippet.
 */
function listPhrase(items: string[], max = MAX_COLOURS_LISTED): string {
  if (items.length === 0) return '';
  if (items.length === 1) return items[0];

  if (items.length > max) {
    return `${items.slice(0, max).join(', ')} and more`;
  }
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;
}

/* ------------------------------------------------------------------ */
/* Colour normalisation                                                */
/* ------------------------------------------------------------------ */

/** Full-width and half-width separators both appear in the product data. */
const COLOUR_SEPARATORS = /[，,;、|]+/;

function prettyColour(raw: string): string {
  return raw
    .split('/')
    .map((segment) => segment.trim())
    .filter(Boolean)
    .map((segment) => segment.split(/\s+/).map(titleWord).join(' '))
    .join('/');
}

/**
 * The colour data is inconsistent — some products use separate array entries
 * ("Orange", "Yellow"), some cram a full-width-comma list into one string
 * ("yellow，orange"), and one uses space-separated combination pairs
 * ("Navy/Yellow Navy/Orange Yellow/Navy Orange/Navy").
 *
 * We only split on whitespace when EVERY token carries a slash, so a genuine
 * two-word colour such as "Royal Blue" survives intact.
 */
export function normaliseColours(colours: string[] = []): string[] {
  const out: string[] = [];
  const seen = new Set<string>();

  for (const entry of colours) {
    if (typeof entry !== 'string') continue;

    for (const chunk of entry.split(COLOUR_SEPARATORS)) {
      const trimmed = chunk.trim();
      if (!trimmed) continue;

      const tokens = trimmed.split(/\s+/);
      const isComboList = tokens.length > 1 && tokens.every((t) => t.includes('/'));
      const pieces = isComboList ? tokens : [trimmed];

      for (const piece of pieces) {
        const pretty = prettyColour(piece);
        const key = fingerprint(pretty);
        if (!pretty || !key || seen.has(key)) continue;
        seen.add(key);
        out.push(pretty);
      }
    }
  }

  return out;
}

/* ------------------------------------------------------------------ */
/* Fabric + feature extraction                                         */
/* ------------------------------------------------------------------ */

const FABRIC_PATTERN = /fabric\s*[:：]\s*(.+)$/i;

/** "100%POLYESTER" -> "100% Polyester", "95% Cotton; 5% Spandex" -> "..., ..." */
function tidyFabric(raw: string): string {
  return raw
    .replace(/\s*;\s*/g, ', ')
    .replace(/(\d)\s*%\s*/g, '$1% ')
    .split(/\s+/)
    .map((token) => (/\d/.test(token) ? token : titleWord(token)))
    .join(' ')
    .replace(/\s+([,.])/g, '$1')
    .replace(/[.,;:\s]+$/, '')
    .trim();
}

/** Pull the fabric composition out of the free-text description field. */
export function extractFabric(description = ''): string | null {
  const match = description.match(FABRIC_PATTERN);
  if (!match) return null;
  const fabric = tidyFabric(match[1]);
  return fabric || null;
}

/**
 * Whatever the operator wrote BEFORE "FABRIC:" — often a genuine selling point
 * ("Work Pants With Reinforced Patches"), but sometimes just the product name
 * repeated, which we drop so the snippet doesn't stutter.
 */
export function extractFeature(description = '', name = ''): string | null {
  const beforeFabric = description.split(FABRIC_PATTERN)[0] ?? '';
  const cleaned = beforeFabric.replace(/[,.;:\s]+$/, '').trim();
  if (!cleaned) return null;

  const featureKey = fingerprint(cleaned);
  const nameKey = fingerprint(name);
  if (!featureKey) return null;

  // Drop it when it merely restates the product name (either direction).
  if (nameKey.startsWith(featureKey) || featureKey.startsWith(nameKey)) return null;

  return cleaned.replace(/[.]+$/, '');
}

/* ------------------------------------------------------------------ */
/* Public API                                                          */
/* ------------------------------------------------------------------ */

/** True when the value is real bespoke copy rather than the old boilerplate. */
export function isCustomSeoValue(value: string | undefined, legacy: string): boolean {
  if (!value) return false;
  const trimmed = value.trim();
  if (!trimmed) return false;
  return fingerprint(trimmed) !== fingerprint(legacy);
}

export interface ProductSeo {
  /** Product-specific part only — the layout template appends " | Xianlu Workwear". */
  title: string;
  /** Full title as it will appear in the SERP, used for previews and QA. */
  fullTitle: string;
  description: string;
  /** Descriptive alt text; shorter and more literal than the meta description. */
  imageAlt: string;
}

export const BRAND_SUFFIX = 'Xianlu Workwear';

/**
 * Build unique SEO for one product. Deterministic: same input, same output.
 */
export function buildProductSeo(product: Product): ProductSeo {
  const name = (product.name || '').trim() || 'Workwear';
  const colours = normaliseColours(product.colors);
  const fabric = extractFabric(product.description);
  const feature = extractFeature(product.description, name);
  const sizes = (product.sizes || [])
    .map((s) => (typeof s === 'string' ? s.trim() : ''))
    .filter(Boolean);

  /* ---- Title ---- */
  const customTitle = isCustomSeoValue(product.seoTitle, LEGACY_SEO_TITLE)
    ? product.seoTitle!.trim()
    : name;

  // Never let the brand appear twice — the layout template already adds it.
  const title = customTitle
    .replace(new RegExp(`\\s*\\|\\s*${BRAND_SUFFIX}\\s*$`, 'i'), '')
    .trim() || name;

  /* ---- Description ---- */
  let description: string;

  if (isCustomSeoValue(product.seoDescription, LEGACY_SEO_DESCRIPTION)) {
    description = product.seoDescription!.trim();
  } else {
    const colourPhrase = listPhrase(colours);

    const lead = colourPhrase ? `${name} in ${colourPhrase}.` : `${name}.`;

    const specParts: string[] = [];
    if (fabric) specParts.push(fabric);
    if (sizes.length) specParts.push(`sizes ${sizes.join(', ')}`);
    const spec = specParts.length ? `${sentenceCase(specParts.join(', '))}.` : '';

    const featureClause = feature ? `${sentenceCase(feature)}.` : '';
    const priceClause =
      typeof product.price === 'number' && product.price > 0
        ? `From $${product.price.toFixed(2)} AUD, Australia-wide delivery.`
        : 'Australia-wide delivery.';

    // Highest-value clauses first; anything that would overflow is dropped.
    const clauses = [lead, spec, featureClause, BRANDING_CLAUSE, priceClause].filter(Boolean);

    description = clauses.reduce((acc, clause) => {
      const next = acc ? `${acc} ${clause}` : clause;
      return next.length <= MAX_DESCRIPTION ? next : acc;
    }, '');

    // Pathological fallback: a name long enough to blow the budget on its own.
    if (!description) description = lead.slice(0, MAX_DESCRIPTION);
  }

  /* ---- Image alt ---- */
  const altBits = [name];
  if (colours.length) altBits.push(`in ${listPhrase(colours, 3)}`);
  const category = (product.category || '').trim();
  if (category && !fingerprint(name).includes(fingerprint(category))) {
    altBits.push(`— ${category} workwear`);
  }
  const imageAlt = altBits.join(' ').replace(/\s+/g, ' ').trim();

  return {
    title,
    fullTitle: `${title} | ${BRAND_SUFFIX}`,
    description,
    imageAlt,
  };
}
