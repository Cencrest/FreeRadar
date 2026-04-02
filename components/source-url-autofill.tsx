"use client";

import { useState } from "react";

type SourceUrlAutofillProps = {
  initialTitle?: string;
  initialDescription?: string;
  initialImageUrl?: string;
  initialSourceUrl?: string;
};

export default function SourceUrlAutofill({
  initialTitle = "",
  initialDescription = "",
  initialImageUrl = "",
  initialSourceUrl = "",
}: SourceUrlAutofillProps) {
  const [sourceUrl, setSourceUrl] = useState(initialSourceUrl);
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [imageUrl, setImageUrl] = useState(initialImageUrl);
  const [category, setCategory] = useState("");
  const [city, setCity] = useState("");
  const [stateValue, setStateValue] = useState("");
  const [zip, setZip] = useState("");
  const [isFetching, setIsFetching] = useState(false);
  const [fetchMessage, setFetchMessage] = useState("");

  async function handleBlur() {
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

      if (data?.sourceUrl) {
        setSourceUrl(data.sourceUrl);
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

  return (
    <div className="stack">
      <div className="field">
        <label htmlFor="source_url">Source URL</label>
        <input
          id="source_url"
          name="source_url"
          type="url"
          value={sourceUrl}
          onChange={(e) => setSourceUrl(e.target.value)}
          onBlur={handleBlur}
          placeholder="Paste a Craigslist or other listing link"
        />
        <small className="muted">
          When you tab out of this field, FreeRadar will try to pull the title,
          image, and description automatically.
        </small>
      </div>

      {fetchMessage ? (
        <div className="notice">{isFetching ? "Fetching preview..." : fetchMessage}</div>
      ) : null}

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
          placeholder="Auto-filled when available"
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
          <input
            id="category"
            name="category"
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="furniture, electronics..."
          />
        </div>

        <div className="field">
          <label htmlFor="city">City</label>
          <input
            id="city"
            name="city"
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Brooklyn"
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
          />
        </div>

        <div className="field">
          <label htmlFor="zip">ZIP</label>
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
    </div>
  );
}
