# Premium PayStore - Next.js & UddoktaPay Integration Template

A production-ready, highly secure, modular e-commerce storefront boilerplate integrating **Next.js (App Router)**, **Supabase**, and **UddoktaPay** (supporting automated bKash, Rocket, Nagad, and manual Personal Transfers).

## 🚀 Features

*   **Next.js 14 App Router**: Powered by React Server Components (RSC) and strict TypeScript.
*   **Supabase Database**: Uses Postgres with strict Row-Level Security (RLS) policies and RPC functions for atomic transaction processing.
*   **UddoktaPay Integration**: Complete checkout session creation, verified webhook callbacks, and auto-poll verification.
*   **bKash Personal Flow Helper**: Clear UI instructions guiding manual personal transfer customers to submit TrxIDs.
*   **Secure Admin dashboard**: Server-side authenticated product catalog manager (CRUD actions protected by Supabase Auth).
*   **Modular Architecture**: Domain separation (products, orders, admin, payments) with reusable services and shared UI primitives.

---

## 🛠️ Database Setup (Supabase)

1.  Create a new project on the [Supabase Console](https://database.new).
2.  Open the **SQL Editor** in your Supabase dashboard.
3.  Copy and execute the entire contents of [schema.sql](file:///d:/payment%20practsie/schema.sql) to initialize tables, database indexes, RLS policies, and the atomic order processing RPC (`process_completed_payment`).

---

## ⚙️ Environment Variables Configuration

Create a `.env.local` file in the root of your project using the keys from `.env.example`:

```env
# Server URL Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Supabase Configurations
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# UddoktaPay Configurations
UDDOKTAPAY_BASE_URL=https://your-brand.paymently.io/api
UDDOKTAPAY_API_KEY=your-uddoktapay-api-key
```

> [!CAUTION]
> Make sure `SUPABASE_SERVICE_ROLE_KEY` and `UDDOKTAPAY_API_KEY` are kept strictly server-side. Do not prefix them with `NEXT_PUBLIC_` to prevent leaking them to client browsers.

---

## 💻 Local Development Setup

Follow these steps to run the application locally:

1.  **Install dependencies**:
    ```bash
    npm install
    ```
2.  **Start development server**:
    ```bash
    npm run dev
    ```
3.  **Forward Webhooks for Local Testing**:
    UddoktaPay needs a public internet URL to send webhook callbacks to your local route (`/api/payment/callback`). Set up tunneling (e.g., via `localtunnel` or `ngrok`):
    ```bash
    npx localtunnel --port 3000
    ```
    Update `NEXT_PUBLIC_APP_URL` in `.env.local` to match the generated public tunnel URL (e.g. `https://cool-turtles-swim.localtunnel.me`).

---

## 📂 Codebase Architecture Overview

*   `/app`: Routing layer (pages and API route handlers). Keep routes lean; delegate logic to services.
*   `/components/ui`: Shareable, custom-styled UI primitives (`Button`, `Input`, `Card`, `Badge`).
*   `/features`: Domain-specific components and actions (`features/products`, `features/orders`, `features/admin`).
*   `/services`: Centralized backend business logic.
    *   `product-service.ts`: Product retrieval, inventory adjustments, and CRUD database calls.
    *   `order-service.ts`: Orders queries and transaction queries.
    *   `payment-service.ts`: Webhook verification, API synchronization, and database transaction RPC routing.
    *   `logger.ts`: Centralized console and environment-based logs.
*   `/lib`: Third-party configuration files (`supabase.ts`, `uddoktapay.ts`).
