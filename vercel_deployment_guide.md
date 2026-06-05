# Vercel Deployment Guide

This guide details how to deploy the **payment-practice** Next.js application to Vercel and configure all required environment variables securely.

---

## 📋 Prerequisites

Before deploying, ensure you have:
1. A **Vercel Account** connected to your GitHub profile.
2. A **Supabase Project** up and running with the database schema applied.
3. A **UddoktaPay Merchant Account** (sandbox or live credentials).

---

## 🚀 Step-by-Step Deployment

### 1. Import Repository
1. Go to your [Vercel Dashboard](https://vercel.com/dashboard) and click **Add New > Project**.
2. Select your repository: **`payment-practice`** (from user `asad-013` or `Asad-013`).
3. Click **Import**.

### 2. Configure Project Settings
- **Framework Preset**: Vercel automatically detects Next.js. Leave it as is.
- **Root Directory**: `./` (leave default).
- **Build and Output Settings**: Leave defaults (Vercel automatically runs `next build`).

### 3. Add Environment Variables 🔒
Expand the **Environment Variables** section and add the following keys. 

> [!WARNING]
> Do **not** commit these variables to your Git repository. Input them directly into the Vercel dashboard.

| Key | Description | Example Value |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_APP_URL` | The production URL of your Vercel deployment (use the domain Vercel assigns you, or your custom domain). | `https://your-app-domain.vercel.app` |
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase Project URL. | `https://your-project.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase public anonymous API key. | `eyJhbGciOiJIUzI...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase private service role key (bypasses RLS, used safely in server actions). | `eyJhbGciOiJIUzI...` |
| `UDDOKTAPAY_BASE_URL` | Your UddoktaPay merchant API base URL. | `https://your-panel.paymently.io/api` |
| `UDDOKTAPAY_API_KEY` | Your UddoktaPay merchant API Key. | `rkWc3p49Ni6y8OjQRz...` |

### 4. Deploy
Click the **Deploy** button. Vercel will fetch the codebase, resolve dependencies, compile the production bundles, and deploy it to a global CDN.

---

## ⚡ Post-Deployment Steps

### 1. Update UddoktaPay Webhook / Callback URL
To ensure payment verification callback works automatically:
1. Copy your Vercel production URL (e.g., `https://payment-practice.vercel.app`).
2. Log into your **UddoktaPay Panel**.
3. Go to **Settings > API Channels** (or Webhooks).
4. Update the **Webhook URL** or **Callback URL** to point to:
   ```
   https://your-app-domain.vercel.app/api/payment/callback
   ```

### 2. Verification Checklist
- [ ] **Storefront:** Navigate to the production URL, add a product to the cart, check out, and verify it redirects to the UddoktaPay gateway correctly.
- [ ] **Admin Dashboard:** Access the `/admin` path, sign in using your admin user credentials, and check if you can create, update, or delete products.
- [ ] **Callbacks:** Complete a test checkout process using UddoktaPay sandbox mode and verify that the payment state automatically updates to **Paid** on the invoice page.
