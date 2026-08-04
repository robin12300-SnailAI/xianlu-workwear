/**
 * Address autocomplete provider for the checkout page.
 *
 * The site is a static export (GitHub Pages) with no backend, so the lookup
 * is performed directly from the browser. The default provider is OpenStreetMap
 * Nominatim because it requires no API key and has reasonable Australian
 * address coverage for small volumes.
 *
 * For a production site with higher volume or stricter accuracy requirements,
 * swap this to Google Places or Australia Post Address Search. Both require
 * an API key and, in a static export, the key is exposed in the browser unless
 * you add a backend proxy.
 */

export interface ParsedAddress {
  /** Street number + street name, e.g. "4 Parklawn Place". */
  street: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  /** Full human-readable name from the provider. */
  displayName: string;
}

export interface AddressSuggestion {
  id: string;
  displayName: string;
  parsed: ParsedAddress;
}

export interface AddressProvider {
  name: string;
  search(query: string, countryCode?: string): Promise<AddressSuggestion[]>;
}

const AU_STATE_ABBREVIATIONS: Record<string, string> = {
  'new south wales': 'NSW',
  'victoria': 'VIC',
  'queensland': 'QLD',
  'western australia': 'WA',
  'south australia': 'SA',
  'tasmania': 'TAS',
  'northern territory': 'NT',
  'australian capital territory': 'ACT',
};

function normalizeState(raw: string | undefined, country: string): string {
  if (!raw) return '';
  if (country.toLowerCase() === 'australia') {
    const abbr = AU_STATE_ABBREVIATIONS[raw.trim().toLowerCase()];
    if (abbr) return abbr;
  }
  return raw.toUpperCase();
}

function extractStreet(addr: Record<string, string | undefined>): string {
  const parts: string[] = [];
  if (addr.house_number) parts.push(addr.house_number);
  if (addr.house_name) parts.push(addr.house_name);
  if (addr.road) parts.push(addr.road);
  if (addr.pedestrian) parts.push(addr.pedestrian);
  if (addr.street) parts.push(addr.street);
  return parts.join(' ');
}

function extractCity(addr: Record<string, string | undefined>): string {
  return (
    addr.suburb ||
    addr.town ||
    addr.city ||
    addr.municipality ||
    addr.district ||
    addr.county ||
    ''
  );
}

class NominatimProvider implements AddressProvider {
  name = 'nominatim';
  private lastRequestAt = 0;

  async search(query: string, countryCode = 'au'): Promise<AddressSuggestion[]> {
    const trimmed = query.trim();
    if (trimmed.length < 3) return [];

    // Nominatim usage policy: no more than 1 request per second.
    const now = Date.now();
    const delay = Math.max(0, 1000 - (now - this.lastRequestAt));
    if (delay > 0) await new Promise((resolve) => setTimeout(resolve, delay));
    this.lastRequestAt = Date.now();

    const params = new URLSearchParams({
      q: trimmed,
      format: 'json',
      addressdetails: '1',
      limit: '6',
      countrycodes: countryCode.toLowerCase(),
    });

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?${params.toString()}`,
        {
          method: 'GET',
          headers: { Accept: 'application/json' },
          // Browsers send a User-Agent automatically; Nominatim requires one.
        },
      );
      if (!res.ok) return [];
      const data = (await res.json()) as Array<Record<string, unknown>>;
      return data.map((item) => this.parse(item));
    } catch {
      return [];
    }
  }

  private parse(item: Record<string, unknown>): AddressSuggestion {
    const addr = (item.address as Record<string, string | undefined>) || {};
    const country = addr.country || '';
    const parsed: ParsedAddress = {
      street: extractStreet(addr),
      city: extractCity(addr),
      state: normalizeState(addr.state, country),
      postcode: addr.postcode || '',
      country,
      displayName: (item.display_name as string) || '',
    };
    return {
      id: String(item.place_id || item.osm_id || Math.random()),
      displayName: parsed.displayName,
      parsed,
    };
  }
}

/** Optional Google Places provider. Not active unless explicitly configured. */
class GooglePlacesProvider implements AddressProvider {
  name = 'google';
  constructor(private apiKey: string) {}

  async search(query: string, countryCode = 'au'): Promise<AddressSuggestion[]> {
    // Google Places New API requires an API key. In a static export the key is
    // visible in the browser, so it must be restricted by HTTP referrer in the
    // Google Cloud console. A backend proxy is the safer long-term approach.
    if (!this.apiKey || typeof window === 'undefined') return [];
    if (query.trim().length < 3) return [];

    const sessionToken = this.getSessionToken();
    const body = {
      input: query.trim(),
      includedPrimaryTypes: ['street_address', 'subpremise', 'premise'],
      regionCode: countryCode.toLowerCase(),
      sessionToken,
    };

    try {
      const res = await fetch(
        `https://places.googleapis.com/v1/places:autocomplete?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-FieldMask': 'suggestions.placePrediction(placeId,structuredFormat,formattedAddress)',
          },
          body: JSON.stringify(body),
        },
      );
      if (!res.ok) return [];
      const json = (await res.json()) as { suggestions?: Array<Record<string, unknown>> };
      return (json.suggestions || [])
        .map((s) => {
          const pred = (s.placePrediction as Record<string, unknown>) || {};
          const structured = (pred.structuredFormat as Record<string, unknown>) || {};
          const mainText = (structured.mainText as { text?: string })?.text || '';
          const secondaryText = (structured.secondaryText as { text?: string })?.text || '';
          const formatted = (pred.formattedAddress as string) || '';
          return {
            id: (pred.placeId as string) || String(Math.random()),
            displayName: formatted || `${mainText}, ${secondaryText}`,
            parsed: {
              street: mainText,
              city: '',
              state: '',
              postcode: '',
              country: '',
              displayName: formatted,
            },
          };
        })
        .filter((s) => s.parsed.street);
    } catch {
      return [];
    }
  }

  private getSessionToken(): string {
    // A real implementation should reuse a session token for the duration of
    // one autocomplete session. This placeholder generates a fresh UUID each
    // call for simplicity.
    return crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`;
  }
}

export function createAddressProvider(): AddressProvider {
  const providerName = process.env.NEXT_PUBLIC_ADDRESS_PROVIDER || 'nominatim';
  if (providerName === 'google') {
    const key = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY || '';
    if (!key) {
      // eslint-disable-next-line no-console
      console.warn(
        'NEXT_PUBLIC_GOOGLE_PLACES_API_KEY is missing; falling back to Nominatim.',
      );
      return new NominatimProvider();
    }
    return new GooglePlacesProvider(key);
  }
  return new NominatimProvider();
}

/** Singleton provider instance so rate-limiting state is shared. */
export const addressProvider = createAddressProvider();
