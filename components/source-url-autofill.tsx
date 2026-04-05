"use client";

import { useState } from "react";

type SourceUrlAutofillProps = {
  initialTitle?: string;
  initialDescription?: string;
  initialImageUrl?: string;
  initialSourceUrl?: string;
  initialCategory?: string;
  initialCity?: string;
  initialState?: string;
  initialZip?: string;
};

function splitCityValue(cityValue: string) {
  if (!cityValue) {
    return {
      borough: "",
      neighborhood: "",
    };
  }

  const parts = cityValue.split(",").map((part) => part.trim());

  if (parts.length >= 2) {
    return {
      neighborhood: parts[0],
      borough: parts[1].toLowerCase(),
    };
  }

  const normalized = cityValue.trim().toLowerCase();

  const boroughs = [
    "manhattan",
    "brooklyn",
    "queens",
    "bronx",
    "staten island",
  ];

  if (boroughs.includes(normalized)) {
    return {
      borough: normalized,
      neighborhood: "",
    };
  }

  return {
    borough: "",
    neighborhood: cityValue,
  };
}

export default function SourceUrlAutofill({
  initialTitle = "",
  initialDescription = "",
  initialImageUrl = "",
  initialSourceUrl = "",
  initialCategory = "",
  initialCity = "",
  initialState = "",
  initialZip = "",
}: SourceUrlAutofillProps) {
  const parsedCity = splitCityValue(initialCity);

  const [mode, setMode] = useState(initialSourceUrl ? "link" : "manual");
  const [sourceUrl, setSourceUrl] = useState(initialSourceUrl);
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [imageUrl, setImageUrl] = useState(initialImageUrl);
  const [category, setCategory] = useState(initialCategory || "");
  const [borough, setBorough] = useState(parsedCity.borough);
  const [cityDetail, setCityDetail] = useState(parsedCity.neighborhood);
  const [stateValue, setStateValue] = useState(initialState || "NY");
  const [zip, setZip] = useState(initialZip);
  const [isFetching, setIsFetching] = useState(false);
  const [fetchMessage, setFetchMessage] = useState("");

  async function handleFetchPreview() {
    if (!sourceUrl.trim()) return;

    setIsFetching(true);
    setFetchMessage("");

    try {
      const res = await fetch("/api/link-preview", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: sourceUrl }),
      });

      const data = await res.json();

      if (!res.ok) {
        setFetchMessage(data?.error || "Could not fetch preview");
        return;
      }

      if (!title && data?.title) {
        setTitle(data.title);
      }

      if (!description && data?.description) {
        setDescription(data.description);
      }

      if (!imageUrl && data?.imageUrl) {
        setImageUrl(data.imageUrl);
      }

      setFetchMessage(
        data?.imageUrl || data?.title || data?.description
          ? "Preview details pulled from link."
          : "Link fetched, but no preview data was found."
      );
    } catch {
      setFetchMessage("Could not fetch preview from that link.");
    } finally {
      setIsFetching(false);
    }
  }

  const combinedCity = cityDetail.trim()
    ? `${cityDetail.trim()}, ${borough}`
    : borough;

  return (
    <div className="stack">
      <div className="card" style={{ padding: "14px" }}>
        <div className="split-actions" style={{ gap: "10px", flexWrap: "wrap" }}>
          <button
            type="button"
            className={mode === "link" ? "button" : "button secondary"}
            onClick={() => setMode("link")}
          >
            Post from link
          </button>

          <button
            type="button"
            className={mode === "manual" ? "button" : "button secondary"}
            onClick={() => setMode("manual")}
          >
            Create manually
          </button>
        </div>

        <p className="muted" style={{ marginTop: 12, marginBottom: 0 }}>
          {mode === "link"
            ? "Paste a listing link and FreeRadar will try to pull the title, image, and description."
            : "Create your own listing manually without using a source link."}
        </p>
      </div>

      {mode === "link" ? (
        <div className="field">
          <label htmlFor="source_url">Source URL</label>
          <div
            style={{
              display: "flex",
              gap: "10px",
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <input
              id="source_url"
              name="source_url"
              type="url"
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              placeholder="Paste a Craigslist or other listing link"
              style={{ flex: 1, minWidth: "260px" }}
            />
            <button
              type="button"
              className="button secondary"
              onClick={handleFetchPreview}
              disabled={isFetching || !sourceUrl.trim()}
            >
              {isFetching ? "Fetching..." : "Fetch preview"}
            </button>
          </div>
        </div>
      ) : (
        <input type="hidden" name="source_url" value={sourceUrl} />
      )}

      {fetchMessage ? <div className="notice">{fetchMessage}</div> : null}

      <div className="field">
        <label htmlFor="title">Title</label>
        <input
          id="title"
          name="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Free couch, crib, dresser..."
          required
        />
      </div>

      <div className="field">
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          name="description"
          rows={5}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Condition, pickup notes, details..."
        />
      </div>

      <div className="field">
        <label htmlFor="image_url">Image URL</label>
        <input
          id="image_url"
          name="image_url"
          type="url"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="Paste an image URL or auto-fill from link"
        />
      </div>

      {imageUrl ? (
        <div
          className="card"
          style={{
            padding: "12px",
            maxWidth: "360px",
          }}
        >
          <img
            src={imageUrl}
            alt="Preview"
            style={{
              width: "100%",
              height: "220px",
              objectFit: "cover",
              borderRadius: "12px",
              display: "block",
            }}
          />
        </div>
      ) : null}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "14px",
        }}
      >
        <div className="field">
          <label htmlFor="category">Category</label>
          <select
            id="category"
            name="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          >
            <option value="">Select category</option>
            <option value="furniture">Furniture</option>
            <option value="appliances">Appliances</option>
            <option value="electronics">Electronics</option>
            <option value="home">Home</option>
            <option value="baby">Baby</option>
            <option value="tools">Tools</option>
            <option value="outdoors">Outdoors</option>
            <option value="other">Other</option>
            <option value="free stuff">Free Stuff</option>
          </select>
        </div>

        <div className="field">
          <label htmlFor="borough">Borough</label>
          <select
            id="borough"
            value={borough}
            onChange={(e) => setBorough(e.target.value)}
            required
          >
            <option value="">Select borough</option>
            <option value="manhattan">Manhattan</option>
            <option value="brooklyn">Brooklyn</option>
            <option value="queens">Queens</option>
            <option value="bronx">Bronx</option>
            <option value="staten island">Staten Island</option>
          </select>
        </div>

        <div className="field">
          <label htmlFor="city_detail">Neighborhood (optional)</label>
          <input
            id="city_detail"
            type="text"
            value={cityDetail}
            onChange={(e) => setCityDetail(e.target.value)}
            placeholder="Williamsburg, Astoria, Harlem..."
          />
        </div>

        <div className="field">
          <label htmlFor="state">State</label>
          <input
            id="state"
            name="state"
            type="text"
            value={stateValue}
            onChange={(e) => setStateValue(e.target.value)}
            placeholder="NY"
            required
          />
        </div>

        <div className="field">
          <label htmlFor="zip">ZIP (optional)</label>
          <input
            id="zip"
            name="zip"
            type="text"
            value={zip}
            onChange={(e) => setZip(e.target.value)}
            placeholder="11211"
          />
        </div>
      </div>

      <input type="hidden" name="city" value={combinedCity} />
    </div>
  );
}
