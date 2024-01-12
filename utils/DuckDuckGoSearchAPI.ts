import axios, { type AxiosResponse, type Method } from 'axios';

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

class HTTPError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'HTTPError';
  }
}

function unescape(text: string): string {
  // Replace &quot; with "
  return text.replace(/&quot;/g, '"');
}

function sub(pattern: RegExp, replacement: string, text: string): string {
  return text.replace(pattern, replacement);
}

function unquote(url: string): string {
  return url; // Simulating unquoting
}

const REGEX_STRIP_TAGS = /<[^>]*>/g;

type TEXT_RESPONSE = {
  status: number;
  data: {
    results: {
      a: string;
      t: string;
      u: string;
    }[];
  };
};

class SearchApi {
  private logger = console;

  async text(
    keywords: string,
    n = 3, // Default to returning 3 results
    region = 'wt-wt', // no region
    safesearch = 'moderate',
    timelimit: string | null = null,
  ): Promise<
    {
      title: string;
      href: string;
      body: string;
    }[]
  > {
    if (!keywords) {
      throw new Error('Keywords are mandatory');
    }

    const vqd = await this._getVqd(keywords);
    if (!vqd) {
      throw new Error('Error in getting vqd');
    }

    const payload = {
      q: keywords,
      kl: region,
      l: region,
      s: 0,
      df: timelimit || '',
      vqd: vqd,
      o: 'json',
      sp: '0',
      ex: '',
      p: '',
    };

    safesearch = safesearch.toLowerCase();
    if (safesearch === 'moderate') {
      payload.ex = '-1';
    } else if (safesearch === 'off') {
      payload.ex = '-2';
    } else if (safesearch === 'on') {
      payload.p = '1';
    }

    const cache = new Set<string>();
    const searchPositions = ['0', '20', '70', '120'];

    const results: {
      title: string;
      href: string;
      body: string;
    }[] = [];

    while (results.length < n) {
      const s = searchPositions[results.length % searchPositions.length];
      payload.s = Number(s);
      const resp = (await this._getUrl(
        'GET',
        'https://links.duckduckgo.com/d.js',
        payload,
      )) as TEXT_RESPONSE;

      if (!resp) {
        break;
      }

      try {
        const pageData = resp.data.results;
        if (!pageData) {
          break;
        }

        let resultExists = false;
        for (const row of pageData) {
          const href = row.u;
          if (
            href &&
            !cache.has(href) &&
            href !== `http://www.google.com/search?q=${keywords}`
          ) {
            cache.add(href);
            const body = this._normalize(row.a);
            if (body) {
              resultExists = true;
              results.push({
                title: this._normalize(row.t),
                href: this._normalizeUrl(href),
                body: body,
              });
            }
          }
        }

        if (!resultExists) {
          break;
        }
      } catch (error) {
        break;
      }
    }

    return results.slice(0, n);
  }

  private async _getUrl(
    method: string,
    url: string,
    params: Record<string, unknown>,
  ): Promise<AxiosResponse | null> {
    for (let i = 0; i < 3; i++) {
      try {
        const resp = await axios.request({
          method: method as Method,
          url,
          [method === 'GET' ? 'params' : 'data']: params,
        });
        if (this._is500InUrl(String(resp.config.url)) || resp.status === 202) {
          throw new HTTPError('');
        }
        if (resp.status === 200) {
          return resp;
        }
      } catch (ex) {
        this.logger.warn(`_getUrl() ${url} ${ex}`);
        // if (i >= 2 || ex.message.includes("418")) {
        //   throw ex;
        // }
      }
      await sleep(3000);
    }
    return null;
  }

  private async _getVqd(keywords: string): Promise<string | null> {
    try {
      const resp = await this._getUrl('GET', 'https://duckduckgo.com', {
        q: keywords,
      });
      if (resp) {
        const charPairs: [string, string][] = [
          ['vqd="', '"'],
          ['vqd=', '&'],
          ["vqd='", "'"],
        ];
        for (const [c1, c2] of charPairs) {
          try {
            const start = String(resp.data).indexOf(c1) + (c1.length || 0);
            const end = String(resp.data).indexOf(c2, start);
            if (start !== -1 && end !== -1) {
              return String(resp.data).substring(start, end);
            }
          } catch (error) {
            this.logger.warn(`_getVqd() keywords=${keywords} vqd not found`);
          }
        }
      }
    } catch (error) {
      console.error('eyyy', error);
    }
    return null;
  }

  private _is500InUrl(url: string): boolean {
    return url.includes('500');
  }

  private _normalize(rawHtml: string | undefined): string {
    if (rawHtml) {
      return unescape(sub(REGEX_STRIP_TAGS, '', rawHtml));
    }
    return '';
  }

  private _normalizeUrl(url: string | null): string {
    if (url) {
      return unquote(url).replace(' ', '+');
    }
    return '';
  }
}

const DuckDuckGoSearchApi = new SearchApi();

export default DuckDuckGoSearchApi;
