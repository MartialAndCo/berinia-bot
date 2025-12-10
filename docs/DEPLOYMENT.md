# AWS Deployment Guide: BerinIA Chatbot Preview

Since you prefer **AWS**, the best solution for a Next.js application (that mimics Vercel's ease of use and features) is **AWS Amplify**.

## Option 1: AWS Amplify (Recommended)

AWS Amplify Hosting is a fully managed CI/CD and hosting service for full-stack applications. It natively supports Next.js App Router.

### Cost
*   **Free Tier**: 12 months free (1000 build minutes/month, 5 GB storage).
*   **Pay-as-you-go**: Very cheap for low traffic (~$0.023/GB).

### Steps
1.  **Push Code to Git**: Ensure your code is on GitHub, GitLab, or Bitbucket.
    *   *(If you are using AWS CodeCommit, that works too, but GitHub is easier).*
2.  **AWS Console**: Log in to AWS and search for **"AWS Amplify"**.
3.  **New App**: Click **"Create new app"** -> **"Gen 2"** (or "Host web app" in Classic). Use Gen 2 if available for best Next.js 14+ support, or Classic Gen 1 is fine too.
4.  **Connect Repository**: Select GitHub (or your provider) and authorize AWS to read your repo.
5.  **Build Settings**:
    *   Amplify usually auto-detects `Next.js`.
    *   Ensure the **Build Command** is `npm run build`.
    *   Ensure **Output Directory** is `.next` (Amplify handles the standalone build automatically).
6.  **Environment Variables**: **CRITICAL STEP**.
    *   In the "Advanced Settings" or "Environment Variables" section of the setup wizard, add:
        *   `GEMINI_API_KEY`
        *   `RETELL_API_KEY`
        *   `AIRTABLE_API_KEY`
        *   `AIRTABLE_BASE_ID`
        *   `AIRTABLE_TABLE_NAME`
        *   `NEXT_PUBLIC_APP_URL` (Set to your custom domain or the amplify-generated URL).
7.  **Deploy**: Click **"Save and Deploy"**.

### Custom Domain on AWS
1.  Go to **App Settings** -> **Domain management**.
2.  Click **"Add domain"**.
3.  Type your domain (e.g., `berinia.com`).
4.  **If your domain is on Route53**: AWS configures it correctly automatically.
5.  **If external (GoDaddy, etc.)**: AWS gives you a `CNAME` validation record. Add it to your registrar to verify ownership and point the traffic.

---

## Option 2: Docker (EC2 / App Runner)

If you prefer total control or containerization:

1.  **Create a `Dockerfile`**: We need to add a Dockerfile to your project.
2.  **Build Image**: `docker build -t berinia-bot .`
3.  **Push to ECR**: Upload the image to Amazon Elastic Container Registry (ECR).
4.  **Run**:
    *   **AWS App Runner** (Easiest): Point it to your ECR image. It handles auto-scaling and HTTPS. (~$5/month min).
    *   **EC2 (t2.micro)**: Free tier eligible. SSH in, install Docker, run manually. (High maintenance).

**My Advice**: Start with **AWS Amplify**. It's serverless, scales to zero, and handles the SSL/Domain complexity for you.
