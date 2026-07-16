# Investment Compass

Investment compass is a SaaS platform that connects Iraqi investors with entrepreneurs and project owners seeking investment. The platform provides verified financial information, AI-powered analytics, secure communication tools, and project performance tracking, enabling investors to evaluate opportunities with confidence while helping entrepreneurs access suitable investors efficiently.

## 1. Install

```bash
npm install
```

## 2. Connect it to n8n

1. In n8n, add a **Webhook** node, set the method to `POST`, and copy its **Production URL**
   (not the Test URL — the test URL only works while you're listening in the n8n editor).
2. Copy `.env.example` to `.env` if you haven't already (a starter `.env` is included):
   ```bash
   cp .env.example .env
   ```
3. Fill in the values in `.env`:
   ```
   VITE_N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/investment-compass
   VITE_N8N_WEBHOOK_TOKEN=      # only if your webhook uses Header Auth
   ```
4. Restart the dev server after editing `.env` — Vite only reads env files on startup.

> **Note on secrecy:** this is a client-side app, so anything in `.env` is bundled into
> the JavaScript the browser downloads — it is not hidden from end users. That's normal
> for a webhook URL. If your n8n webhook needs a real secret, protect it with n8n's
> **Header Auth** on the Webhook node and set `VITE_N8N_WEBHOOK_TOKEN`, or put a small
> backend in front of the webhook if you need to keep the URL itself private.

## 3. Run it

```bash
npm run dev
```

Open the printed local URL. Build for production with:

```bash
npm run build
npm run preview
```

## What gets sent to the webhook

On submit, the app sends one JSON `POST` body:

```json
{
  "answers": {
    "respondent_type": "caregiver",
    "cane_frequency": "daily",
    "...": "one entry per question id, see src/data/questions.ts"
  },
  "email": "person@example.com or null",
  "phone": "+964 7xx xxx xxxx or null",
  "submittedAt": "2026-07-09T12:00:00.000Z",
  "source": "smart-cane-survey-web"
}
```

Email and phone are always optional and are sent as `null` when left blank. All 15
questions are required (single-select, no free text) before the form will submit.

## Customizing the questions

Edit `src/data/questions.ts` — each question is an id, a short prompt, and a list of
2–4 selectable options. The progress bar, validation, and layout all adapt automatically
to however many questions are in that file.

## Project structure

```
src/
  data/questions.ts   15 survey questions
  types.ts            shared TypeScript types
  App.tsx             the single-page survey (form, validation, submit)
  App.css             component styles
  index.css           design tokens + global reset
  main.tsx            React entry point
  vite-env.d.ts        typing for the VITE_ env vars
```

# SafeStep_survey
