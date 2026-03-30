export function classNames(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function formatLocation(city?: string | null, state?: string | null, zip?: string | null) {
  return [city, state, zip].filter(Boolean).join(", ");
}

export function formatDate(input: string) {
  const date = new Date(input);
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(date);
}

export function buildSearchParams(params: Record<string, string | undefined>) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) search.set(key, value);
  }
  return search.toString();
}
export function getListingAgeBadge(createdAt: string) {
  const created = new Date(createdAt);
  const now = new Date();

  const diffMs = now.getTime() - created.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  if (diffHours < 24) {
    return "New";
  }

  const diffDays = Math.floor(diffHours / 24);
  return `Day ${diffDays}`;
}
