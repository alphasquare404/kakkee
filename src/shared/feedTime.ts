function toMilliseconds(value: string): number | null {
  const timestamp = Number(value);

  if (!Number.isFinite(timestamp) || timestamp <= 0) {
    return null;
  }

  // Server timestamps are epoch seconds in some fields and epoch ms in others.
  return timestamp < 1_000_000_000_000 ? timestamp * 1_000 : timestamp;
}

export function formatRelativeTime(value: string): string {
  const timestamp = toMilliseconds(value);

  if (timestamp === null) {
    return '';
  }

  const deltaSeconds = Math.round((timestamp - Date.now()) / 1000);
  const abs = Math.abs(deltaSeconds);
  const formatter = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

  if (abs < 60) {
    return formatter.format(deltaSeconds, 'second');
  }

  if (abs < 3_600) {
    return formatter.format(Math.round(deltaSeconds / 60), 'minute');
  }

  if (abs < 86_400) {
    return formatter.format(Math.round(deltaSeconds / 3_600), 'hour');
  }

  if (abs < 2_592_000) {
    return formatter.format(Math.round(deltaSeconds / 86_400), 'day');
  }

  if (abs < 31_536_000) {
    return formatter.format(Math.round(deltaSeconds / 2_592_000), 'month');
  }

  return formatter.format(Math.round(deltaSeconds / 31_536_000), 'year');
}

export function formatRelativeTimeShort(value: string): string {
  const timestamp = toMilliseconds(value);

  if (timestamp === null) {
    return '';
  }

  const deltaSeconds = Math.round((timestamp - Date.now()) / 1000);
  const abs = Math.abs(deltaSeconds);
  const suffix = deltaSeconds > 0 ? 'from now' : 'ago';

  if (abs < 60) {
    return `${abs} sec ${suffix}`;
  }

  if (abs < 3_600) {
    return `${Math.round(abs / 60)} min ${suffix}`;
  }

  if (abs < 86_400) {
    return `${Math.round(abs / 3_600)} hr ${suffix}`;
  }

  if (abs < 2_592_000) {
    return `${Math.round(abs / 86_400)} day ${suffix}`;
  }

  if (abs < 31_536_000) {
    return `${Math.round(abs / 2_592_000)} mo ${suffix}`;
  }

  return `${Math.round(abs / 31_536_000)} yr ${suffix}`;
}

export function feedDay(value: string): string {
  const timestamp = toMilliseconds(value);

  if (timestamp === null) {
    return 'Earlier';
  }

  const date = new Date(timestamp);
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const dayStart = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  ).getTime();
  const days = Math.round((start - dayStart) / 86_400_000);

  if (days <= 0) {
    return 'Today';
  }

  if (days === 1) {
    return 'Yesterday';
  }

  return 'Earlier';
}
