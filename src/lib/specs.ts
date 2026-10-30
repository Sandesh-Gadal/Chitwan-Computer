export interface SpecLine {
  /** Normalised key used to line specs up across products */
  key: string;
  label: string;
  value: string;
}

export interface ParsedSpecs {
  specs: SpecLine[];
  /** Whatever in the description isn't a "Key: Value" line */
  overview: string;
}

const BULLET = /^\s*[•\-*–—·▪●○►✓✔]+\s*/;
const SPEC_LINE = /^([^:]{2,40}):\s*(.+)$/;

export const specKey = (label: string) => label.toLowerCase().replace(/[^a-z0-9]+/g, '');

/**
 * Pulls "Key: Value" lines (with or without bullets) out of a description.
 * Lines like "Feature Name: a long sentence about it" read as prose, not specs.
 */
export const parseSpecs = (description: string | null | undefined): ParsedSpecs => {
  const specs: SpecLine[] = [];
  const prose: string[] = [];

  for (const raw of (description ?? '').split(/\r?\n/)) {
    const line = raw.replace(BULLET, '').trim();
    if (!line) continue;

    const match = line.match(SPEC_LINE);
    const label = match?.[1].trim() ?? '';
    const value = match?.[2].trim().replace(/\.$/, '') ?? '';
    // A bullet says "this is a spec", so bulleted values may run longer
    const maxWords = BULLET.test(raw) ? 40 : 14;
    const looksLikeSpec =
      match && label.split(/\s+/).length <= 5 && !/[.!?]$/.test(label) && value.split(/\s+/).length <= maxWords;

    if (looksLikeSpec && !specs.some((s) => s.key === specKey(label))) {
      specs.push({ key: specKey(label), label, value });
    } else {
      prose.push(line);
    }
  }

  return { specs, overview: prose.join('\n\n') };
};
