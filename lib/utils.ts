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
export function getListingAgeBadge(dateString: string) {
  const created = new Date(dateString);
  const now = new Date();

  const diffMs = now.getTime() - created.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) {
    return "Just now";
  }

  if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  }

  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }

  if (diffDays === 1) {
    return "Yesterday";
  }

  return `${diffDays}d ago`;
}

  return `${diffDays} days ago`;
}
