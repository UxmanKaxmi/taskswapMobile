export const FEELING_OPTIONS = [
  { value: 'stuck', label: 'Stuck' },
  { value: 'nervous', label: 'Nervous' },
  { value: 'tired', label: 'Tired' },
  { value: 'avoiding_it', label: 'Avoiding it' },
  { value: 'overwhelmed', label: 'Overwhelmed' },
  { value: 'almost_there', label: 'Almost there' },
] as const;

export type FeelingValue = (typeof FEELING_OPTIONS)[number]['value'];

const FEELING_LABEL_BY_VALUE = new Map(
  FEELING_OPTIONS.map(option => [option.value, option.label] as const),
);

function normalizeFeelingKey(feeling?: string | null): FeelingValue | undefined {
  if (!feeling) return undefined;

  const normalized = feeling.trim().toLowerCase().replace(/\s+/g, '_');
  return FEELING_LABEL_BY_VALUE.has(normalized as FeelingValue)
    ? (normalized as FeelingValue)
    : undefined;
}

export function getFeelingLabel(feeling?: string | null): string {
  const normalized = normalizeFeelingKey(feeling);
  if (normalized) {
    return FEELING_LABEL_BY_VALUE.get(normalized) ?? normalized;
  }

  return feeling?.trim() ?? '';
}

export function normalizeFeelingValue(feeling?: string | null): FeelingValue | undefined {
  return normalizeFeelingKey(feeling);
}
