# GovEx — Evidence-Based Manifesto Tracker

GovEx is an evidence-oriented platform for tracking electoral manifesto promises. It converts each promise into a traceable record: Promise -> Verification -> Evidence -> Source -> Implementation Status.

**Disclaimer:** GovEx presents evidence, not political judgement.

## Features

- **Public Dashboard:** View promises by party and compare policy domains with a clean, responsive layout.
- **Promise Tracking:** Keep track of total commitments, promises with evidence, works in progress, and unverifiable promises.
- **Admin Console:** Secure interface for admins and researchers to add and update election manifestos and their respective promises (Requires login).
- **Responsive UI:** A clean, modern UI optimized for various device sizes.

## Tech Stack

- **Framework:** Next.js (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + shadcn/ui
- **Database ORM:** Prisma
- **Database:** PostgreSQL (Supabase or Neon)
- **Charts:** Recharts
- **Authentication:** NextAuth (Auth.js)

## Local Setup

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd GovEx
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up Environment Variables:**
   Copy the `.env.example` file to `.env` and fill in your database credentials:
   ```bash
   cp .env.example .env
   ```

4. **Initialize the Database:**
   Generate Prisma client and push the schema to your database.
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Run the Development Server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
