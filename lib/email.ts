import { Resend } from "resend";

type AlertEmailInput = {
  to: string;
  keyword: string;
  matches: Array<{
    title: string;
    source_url: string;
    city: string | null;
    state: string | null;
  }>;
};

function emailTemplate(input: AlertEmailInput) {
  const intro = `We found ${input.matches.length} new FreeRadar match${input.matches.length === 1 ? "" : "es"} for "${input.keyword}".`;
  const items = input.matches
    .map(
      (match) =>
        `<li style="margin-bottom:12px;">
          <a href="${match.source_url}" target="_blank" rel="noreferrer">${match.title}</a>
          <div>${[match.city, match.state].filter(Boolean).join(", ") || "Location not provided"}</div>
        </li>`
    )
    .join("");

  return `
    <div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;padding:24px;">
      <h1 style="margin:0 0 12px;">FreeRadar alert</h1>
      <p>${intro}</p>
      <ul>${items}</ul>
      <p style="margin-top:24px;">Open FreeRadar to manage your alerts.</p>
    </div>
  `;
}

export async function sendAlertEmail(input: AlertEmailInput) {
  if (!process.env.RESEND_API_KEY || !process.env.ALERTS_FROM_EMAIL) {
    throw new Error("Missing Resend configuration.");
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  return resend.emails.send({
    from: process.env.ALERTS_FROM_EMAIL,
    to: [input.to],
    subject: `New FreeRadar matches for "${input.keyword}"`,
    html: emailTemplate(input)
  });
}
