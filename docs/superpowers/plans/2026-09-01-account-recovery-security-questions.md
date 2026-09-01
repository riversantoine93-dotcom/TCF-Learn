# Account Recovery and Security Questions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add three security questions to paid account creation and add a secure Supabase email-based forgot/reset password flow.

**Architecture:** Keep email as the user's login identifier and Supabase Auth as the authority for passwords and recovery tokens. Store only salted, iterated hashes of three security-question answers in a private database table; never expose answer values. Password recovery uses Supabase `resetPasswordForEmail` and `updateUser`, while security questions remain a secondary recovery signal rather than a replacement for secure email recovery.

**Tech Stack:** Next.js App Router, TypeScript, Supabase Auth/Postgres, Web Crypto API.

**Spec:** Approved in chat on 2026-09-01.

## Global Constraints

- Paid Stripe enrollment remains required before account creation.
- Login identifier remains the paid purchaser email address.
- Passwords remain managed exclusively by Supabase Auth.
- Store no plaintext security answers.
- Collect exactly three distinct security questions and non-empty answers at registration.
- Primary password recovery uses a Supabase recovery email.
- Do not use Mailchimp for password-reset tokens or authentication.

---

## Task 1: Security-question persistence

- [ ] Add a failing contract test describing the required private security-question schema and registration behavior.
- [ ] Add a Supabase migration for `account_security_questions` keyed by `auth.users.id`, with three question IDs, three answer hashes, three salts, timestamps, RLS enabled, and no client read/write policies.
- [ ] Add server helpers to normalize and hash answers with PBKDF2 and persist the three records atomically enough for registration.
- [ ] Verify schema/security advisors.

## Task 2: Paid registration UI and API

- [ ] Add a failing contract test requiring three security questions in the registration request.
- [ ] Add a controlled security-question catalog and require three distinct selections.
- [ ] Update the registration form to collect the three answers.
- [ ] Update `/api/register` validation and persist security questions after creating the paid user's Supabase account.
- [ ] Keep the existing paid-enrollment check and enrollment attachment.

## Task 3: Forgot/reset password

- [ ] Add failing contract tests for a login-page forgot-password link, forgot-password page, and reset-password page.
- [ ] Add `/forgot-password` to collect email and call `supabase.auth.resetPasswordForEmail` with the production reset URL.
- [ ] Add `/reset-password` to accept the recovery session and call `supabase.auth.updateUser({ password })`.
- [ ] Add `Forgot password?` to `/login`.
- [ ] Use neutral recovery-request messaging to avoid disclosing whether an account exists.

## Task 4: Verification and deployment

- [ ] Run repository tests/build via deployment evidence.
- [ ] Verify the production deployment reaches READY.
- [ ] Verify `/login`, `/forgot-password`, and `/reset-password` return successfully.
- [ ] Confirm the Supabase redirect allow-list includes `https://tcf-learn.vercel.app/reset-password`; if not tool-configurable, give the user the exact dashboard setting.
- [ ] Keep Mailchimp reserved for welcome/onboarding automation, not password recovery.
