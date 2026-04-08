// Format date like: Apr 8, 2026
export function formatDate(dateString: string) {
  const date = new Date(dateString);

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// Format location like: Brooklyn, NY
export function formatLocation(
  city?: string | null,
  state?: string | null,
  zip?: string | null
) {
  const parts = [city, state].filter(Boolean);
  return parts.join(", ");
}

// Badge logic (NEW CLEAN VERSION)
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
