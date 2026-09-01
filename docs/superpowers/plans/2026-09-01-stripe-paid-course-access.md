# Stripe Paid Course Access Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Require a verified one-time $97 Stripe purchase before a user can create an account or access Turning Forward lessons, while keeping the course outline publicly previewable.

**Architecture:** Public visitors can view the course overview but lesson routes require both Supabase authentication and an active Turning Forward enrollment. Stripe Checkout is created server-side for exactly $97; a signed Stripe webhook records the purchaser email in Supabase. The post-payment registration endpoint verifies that paid email, creates the Supabase user with the server-side service role, and attaches the enrollment to the new user.

**Tech Stack:** Next.js 16 App Router, React 19, Supabase Auth/Postgres/RLS, Stripe Checkout REST API + signed webhooks, Vercel environment variables.

**Spec:** Approved in chat: one-time $97 Turning Forward purchase; unpaid visitors can preview only; no account creation before payment; rename student login language to user login.

## Global Constraints

- Price is exactly $97 USD, one time.
- Stripe webhook confirmation is the source of truth for payment, not the success redirect.
- Unpaid visitors can see the course outline but cannot open lesson content.
- Account creation requires a paid enrollment email.
- Protected access requires authenticated user plus active enrollment.
- Never expose Stripe secret, webhook secret, or Supabase service-role key to browser code.
- Existing learner progress behavior remains unchanged after access is granted.

---

## Task 1: Adapt enrollment schema for payment-first registration
- [ ] Verify current enrollments schema and constraints.
- [ ] Add purchaser_email and payment status fields; allow user_id to be null until registration.
- [ ] Add unique/index constraints for Stripe session and normalized purchaser email/course.
- [ ] Add RLS so authenticated users can only read their own active enrollment.
- [ ] Verify schema and policies.

## Task 2: Add server-only Stripe/Supabase helpers
- [ ] Add helpers for Stripe Checkout creation, webhook signature verification, and Supabase admin REST calls without adding a new package dependency.
- [ ] Fail closed when required server secrets are absent.

## Task 3: Add checkout and webhook endpoints
- [ ] Add POST /api/checkout that creates a one-time $97 Checkout Session.
- [ ] Add POST /api/stripe/webhook that verifies Stripe signature and records checkout.session.completed payments.
- [ ] Add success/cancel URLs and course metadata.

## Task 4: Gate account creation behind payment
- [ ] Replace direct browser Supabase signUp with POST /api/register.
- [ ] Verify paid enrollment by normalized email before admin user creation.
- [ ] Attach enrollment to created user.
- [ ] Update registration copy to paid-user language.

## Task 5: Enforce paid course access
- [ ] Add enrollment lookup helper for authenticated users.
- [ ] Update module renderer to deny lesson content unless authenticated and actively enrolled.
- [ ] Preserve public course overview as preview.
- [ ] Change overview CTA for unpaid visitors to Unlock Full Course — $97 and paid users to Begin/Continue.

## Task 6: Rename student-facing authentication copy
- [ ] Change Student sign in / student account / New student language to User Login / account language throughout UI.

## Task 7: Verify and deploy
- [ ] Verify database schema/RLS.
- [ ] Verify source contracts for checkout price, webhook verification, registration gate, and module gate.
- [ ] Verify Vercel build/deployment reaches READY.
- [ ] Document required Vercel secrets: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, SUPABASE_SERVICE_ROLE_KEY.
- [ ] Document required Stripe webhook endpoint and Supabase Auth setting to disable public signups after server registration is live.
