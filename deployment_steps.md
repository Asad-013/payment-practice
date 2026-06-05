# Deployment & Setup Steps

Follow these steps to deploy and run the Next.js ecommerce application with UddoktaPay integration.

## 1. Database Setup (Supabase)

1. Create a new project on [Supabase Console](https://database.new).
2. Open the **SQL Editor** from the sidebar.
3. Copy the contents of [schema.sql](file:///d:/payment%20practsie/schema.sql) and execute the query to set up the tables, indexes, row-level security (RLS) policies, and the atomic `process_completed_payment` RPC function.

## 2. Environment Variables Configuration

Create a `.env.local` file at the root of your project using the keys from [.env.example](file:///d:/payment%20practsie/.env.example):

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
UDDOKTAPAY_BASE_URL=https://asaduzzaman.paymently.io/api
UDDOKTAPAY_API_KEY=rkWc3p49Ni6y8OjQRzYDRxpyuZ0fgAyGqbhmZpwz
```

> [!WARNING]
> Ensure `SUPABASE_SERVICE_ROLE_KEY` and `UDDOKTAPAY_API_KEY` are kept strictly server-side. Do not expose them using `NEXT_PUBLIC_` prefixes.

## 3. Local Development

Install dependencies and start the local development server:

```bash
npm install axios @supabase/supabase-js uuid
npm install --save-dev @types/uuid
npm run dev
```

## 4. Webhook Tunneling (Local Testing)

Since UddoktaPay needs to send POST requests back to your server's callback endpoint (`/api/payment/callback`), you must use a tunneling tool like **localtunnel** or **ngrok** during local development:

```bash
# Example using localtunnel on port 3000
npx localtunnel --port 3000
```

Update your `NEXT_PUBLIC_APP_URL` env variable to the public tunnel URL provided (e.g. `https://funny-herons-sing.localtunnel.me`).

## 5. Production Deployment (e.g. Vercel)

1. Connect your GitHub repository to Vercel.
2. Configure all environment variables in Vercel project settings:
   - `NEXT_PUBLIC_APP_URL` set to the production deployment URL (e.g. `https://my-store.vercel.app`).
   - Standard Supabase and UddoktaPay secrets.
3. Deploy! UddoktaPay will route users back to your success page and invoke your callback webhook.
