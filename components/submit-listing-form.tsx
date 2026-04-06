"use client";

import Link from "next/link";
import { useState } from "react";
import SourceUrlAutofill from "@/components/source-url-autofill";

type SubmitListingFormProps = {
  formAction: (formData: FormData) => void | Promise<void>;
  isEditMode: boolean;
  listingId?: string;
  initialTitle?: string;
  initialDescription?: string;
  initialImageUrl?: string;
  initialSourceUrl?: string;
  initialCategory?: string;
  initialCity?: string;
  initialState?: string;
  initialZip?: string;
};

export default function SubmitListingForm({
  formAction,
  isEditMode,
  listingId,
  initialTitle = "",
  initialDescription = "",
  initialImageUrl = "",
  initialSourceUrl = "",
  initialCategory = "",
  initialCity = "",
  initialState = "",
  initialZip = "",
}: SubmitListingFormProps) {
  const [isValid, setIsValid] = useState(
    Boolean(
      initialTitle?.trim() &&
        initialCategory?.trim() &&
        initialCity?.trim()
    )
  );

  return (
    <form action={formAction} className="stack">
      {isEditMode && listingId ? (
        <input type="hidden" name="listingId" value={listingId} />
      ) : null}

      <SourceUrlAutofill
        initialTitle={initialTitle}
        initialDescription={initialDescription}
        initialImageUrl={initialImageUrl}
        initialSourceUrl={initialSourceUrl}
        initialCategory={initialCategory}
        initialCity={initialCity}
        initialState={initialState}
        initialZip={initialZip}
        onValidityChange={setIsValid}
      />

      <div className="split-actions" style={{ marginTop: 8 }}>
        <button
          type="submit"
          className="button"
          disabled={!isValid}
          style={{
            opacity: isValid ? 1 : 0.55,
            cursor: isValid ? "pointer" : "not-allowed",
          }}
        >
          {isEditMode ? "Save changes" : "Create listing"}
        </button>

        <Link href="/dashboard" className="button secondary">
          Cancel
        </Link>
      </div>
    </form>
  );
}
