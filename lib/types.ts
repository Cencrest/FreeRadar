export type ListingCategory =
  | "furniture"
  | "appliances"
  | "electronics"
  | "home"
  | "baby"
  | "tools"
  | "outdoors"
  | "other";

export interface Listing {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  source_name: string;
  source_url: string;
  category: ListingCategory | string;
  city: string | null;
  state: string | null;
  zip: string | null;
  posted_at: string;
  created_at: string;
  is_active: boolean;
}

export interface Alert {
  id: string;
  keyword: string;
  zip: string | null;
  radius_miles: number;
  category: string | null;
  created_at: string;
}

export interface Favorite {
  id: string;
  listing_id: string;
  user_id: string;
  created_at: string;
}

export interface Submission {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  source_url: string | null;
  category: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  status: "pending" | "approved" | "rejected";
  created_at: string;
}
