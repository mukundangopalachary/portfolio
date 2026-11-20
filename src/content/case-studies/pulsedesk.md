---
title: "PulseDesk — AI-Built App Audit"
summary: "Security and production-readiness audit for a Bolt-generated customer feedback platform. 6 failing checks → 0, anonymous AI endpoint HTTP 200 → 401."
stack: ["Supabase", "React", "Vite", "TypeScript", "Edge Functions", "Vercel"]
builtWith: "Bolt"
isDemo: true
resultBefore: "7 pass / 6 fail"
resultAfter: "11 pass / 4 partial / 0 fail"
reportPdf: "/content/case-studies/pulsedesk/sample-audit-report.pdf"
github: "https://github.com/mukundangopalachary/pulsedesk"
order: 1
---

**Demo project: I generated this app with Bolt as a typical AI-built SaaS, then audited and fixed it exactly as I would for a client.**

**App:** PulseDesk, a customer feedback inbox with a public feedback form, a public roadmap with voting, AI triage and team invites.
**Built with:** Bolt (React, Vite, Tailwind) on Supabase (Postgres, Auth, Storage, Edge Functions).
**Hosted on:** Vercel.
**Service:** security and production-readiness audit, then fixes.

## The result

| | Before | After |
|---|---|---|
| Anonymous call to AI function | HTTP 200 — AI-written reply | HTTP 401 — "Sign in to use this feature." |
| `npm audit` | High-severity finding | 0 vulnerabilities |
| Failing checklist items | 6 | 0 |
| Pass | 7 | 11 |
| Partial | 1 | 4 |
| Fail | 6 | 0 |
| Open / Unknown | 2 | 1 |

## The problem

The app worked in the preview. Features were complete and the database already had Row Level Security. That is the usual state of an AI-built app: the visible 80% works, and the production gaps sit underneath.

I audited it against a 17-point checklist covering security, reliability and deployment.

## The audit: what I found (before)

Result: **7 pass, 1 partial, 6 fail, 2 unknown, 1 not applicable.**

| Severity | Finding | Why it matters |
|---|---|---|
| High | The AI endpoint accepted the public anon key, so anyone could call it without signing in. | Strangers could spend the owner's Gemini quota. I confirmed it: an anonymous request returned HTTP 200 with an AI-written reply. |
| High | No rate limiting on the public feedback form, screenshot uploads or roadmap votes. | Spam, storage abuse and vote stuffing were all possible. |
| Medium | CORS was `*` on all functions. | Any website could call them from a visitor's browser. |
| Medium | The Slack notification function trusted a bare feedback id and lost the notification if Slack failed. | Replay abuse and silent data loss. |
| Medium | `npm audit` reported a high-severity vulnerability in a production dependency. | Known, fixable. |
| Low | Invite links were built from a client-supplied origin, and the invite email put an unescaped value into HTML. | Phishing and injection risk. |
| Low | Raw error messages were returned to callers. | Information leak. |
| Ops | No CI, no README, no error boundary, no error tracking, no backups. | One bad commit or render error could break the app with no warning. |

### Evidence: before

**An anonymous call to the AI function succeeds.** No login, only the public key (blurred here). The function returns a generated reply.

![Before: unauthenticated call to the AI function returns HTTP 200 with a generated reply](/content/case-studies/pulsedesk/before-ai-call-200.png)

**A high-severity dependency finding.**

![Before: npm audit reports a high-severity vulnerability in ws](/content/case-studies/pulsedesk/before-npm-audit.png)

**Row Level Security policies.** RLS is on for every table, which is good. The `Anyone can submit feedback` INSERT policy for `anon` is what the fix replaced with a rate-limited server path.

![Before: Supabase policies page showing the anonymous INSERT policy on feedback](/content/case-studies/pulsedesk/before-rls-policies.png)

**What was already good:** RLS on every table, locked-down `SECURITY DEFINER` functions, no secrets in git, sensible indexes. A good audit says what is right too.

## The fixes (after)

1. **Auth on the AI function.** `summarize` and `draft_reply` now require a signed-in user. The public `classify` call is rate limited per IP.
2. **A server-side gate for anonymous writes.** Feedback submits, screenshot uploads and votes now go through one edge function that applies database-backed rate limits and, optionally, a captcha. Direct anonymous inserts and uploads were switched off in the database, so the limits cannot be bypassed from the browser.
3. **Database-level throttles.** A trigger rejects floods from one email or into one workspace, and votes are burst limited.
4. **CORS allow-list** driven by an environment variable instead of `*`.
5. **Slack function hardening:** validates input, only acts on fresh submissions, and releases its claim when Slack fails so it can retry.
6. **Invite flow:** server-side base URL, escaped HTML, generic errors.
7. **Dependencies:** cleared all vulnerabilities, including the dev toolchain (0 reported).
8. **Operations:** GitHub Actions CI (lint, typecheck, build, audit), a React error boundary with optional Sentry, a README with the deploy order, and SPA routing config for hosting. Workflow added and verified locally; not yet run on GitHub.

One bug turned up on the way: signed-in team members could not submit the public form because they had no insert permission. The new path fixed that as well.

### Evidence: after

**The same call, now blocked.**

![After: the same unauthenticated call returns HTTP 401](/content/case-studies/pulsedesk/after-ai-call-401.png)

**Dependencies clean.**

![After: npm audit reports 0 vulnerabilities](/content/case-studies/pulsedesk/after-npm-audit.png)

**The anonymous INSERT policy is gone.** `feedback` no longer has `Anyone can submit feedback`. The new `rate_limits` table has RLS on and no policies, so only the server can touch it.

![After: Supabase policies page, no anonymous INSERT policy on feedback, rate_limits locked down](/content/case-studies/pulsedesk/after-rls-policies.png)

## Still open, and what I'd recommend

- **CI:** fix the GitHub billing lock (or make the repo public), then re-run the workflow and capture a green run.
- **Backups:** automated backups need the Supabase Pro plan. I took a manual dump before the migrations and recommended Pro for production.
- **Error tracking:** create a Sentry project and set `VITE_SENTRY_DSN`. The code is already wired in.
- **Custom domain:** connect one in Vercel, then update `APP_URL`, `ALLOWED_ORIGINS` and the Auth URL settings.
- **Captcha:** enable Turnstile (`TURNSTILE_SECRET_KEY` and `VITE_TURNSTILE_SITE_KEY`) for stronger protection on submit and vote.

I would rather list open items than promise "100% secure". The app was reviewed against this checklist, and each remaining gap is named with a next step.

## Takeaways for AI-built apps

1. The database layer is often fine. The edge functions and operations are where the gaps are.
2. "Requires a JWT" is not "requires a user". The public anon key is a valid JWT.
3. Anything anonymous needs a server-side gate with rate limits.
4. Production readiness includes CI, error tracking and backups, not only secure code.

## Want this for your app?

I audit apps built with Lovable, Bolt, Cursor and Replit, and can fix what matters. [Get in touch](/contact) with your stack and what the app does.
