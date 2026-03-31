export function formatDate(value: string | number | Date) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatLocation(
  city?: string | null,
  state?: string | null,
  zip?: string | null
) {
  return [city, state, zip].filter(Boolean).join(", ");
}

export function getListingAgeBadge(createdAt: string) {
  const created = new Date(createdAt);
  const now = new Date();

  if (Number.isNaN(created.getTime())) {
    return "";
  }

  const diffMs = now.getTime() - created.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  if (diffHours < 24) {
    return "New";
  }

  const diffDays = Math.floor(diffHours / 24);
  return `Day ${diffDays}`;
}
