# GovEx — Verifiable Manifesto & Democratic Accountability Platform

[![Next.js](https://img.shields.io/badge/Next.js-16.3-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4-38bdf8?logo=tailwind-css)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-5.22-2D3748?logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql)](https://www.postgresql.org/)

GovEx is an open civic evidence infrastructure designed to convert political party manifesto commitments into traceable, verifiable evidentiary records of democratic accountability.

> **Official Disclaimer:** GovEx presents verifiable documentary evidence, never political judgement.

---

## 🏛️ Evidence Chain Model

Unlike subjective political scorecards, GovEx mandates a rigorous forensic audit trail for every single commitment:

$$\text{Promise} \longrightarrow \text{Verification} \longrightarrow \text{Evidence} \longrightarrow \text{Source} \longrightarrow \text{Status}$$

1. **Promise Ingestion:** Extracted verbatim from primary manifesto documents with exact citation and contextual text.
2. **Research Verification:** Accredited researchers cross-examine commitments against parliamentary records, legislative dockets, and official gazettes.
3. **Tiered Evidence Artifacts:**
   - **High Tier:** Official government gazettes, enacted legislation, statutory rules, national budget line items.
   - **Medium Tier:** Ministry press releases, committee reports, official statements, departmental audit reports.
   - **Supporting Tier:** News coverage, independent watchdogs, investigative journalism.
4. **Status Determination:** Strict rule enforced — a pledge can **never** be classified as *Implemented* or *Partially Implemented* without at least one verified **High Tier** government source.

---

## 🚀 Key Features

- **Public Evidence Registry:**
  - Full-text search and filtering across manifestos, political parties, jurisdictions, and policy categories.
  - Dedicated promise detail views featuring verbatim commitments, status histories, and attached documentary artifacts.
- **Cross-Party Comparative Matrix (`/compare`):**
  - Benchmark performance across competing parties in specific societal categories (Infrastructure, Employment, Healthcare, Education, Taxation, Welfare).
  - Empirical progress bars and status distribution visualizations.
- **Accredited Researcher Portal (`/researcher`):**
  - Searchable, sortable tabular research console with quality tier filters.
  - 1-click dataset export to **CSV** and **JSON** formats for civic watchdogs, journalists, and academic researchers.
- **Audited Administration Console (`/admin`):**
  - Secure management of elections, political parties, manifestos, commitments, evidence links, and status evaluations.
- **Enterprise-Grade UI/UX:**
  - Modern aesthetic with curated typography, dark mode support, smooth scrolling, and custom auto-hiding scrollbars.
  - Unified iconography powered by `lucide-react`.

---

## 🛠️ Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (App Router, Turbopack)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **UI & Styling:** [Tailwind CSS v4](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Charts:** [Recharts](https://recharts.org/)
- **ORM:** [Prisma ORM](https://www.prisma.io/)
- **Database:** PostgreSQL (local Docker container or managed Supabase/Neon)
- **Authentication:** [NextAuth.js](https://next-auth.js.org/) (Role-based: `ADMIN`, `RESEARCHER`)

---

## ⚡ Quick Start

### Prerequisites
- Node.js `20+` or `22+`
- Docker (optional, for local PostgreSQL)

### 1. Clone the Repository
```bash
git clone https://github.com/JayneelMavani/GovEx.git
cd GovEx
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```
Ensure your database connection string and NextAuth secret are set:
```env
DATABASE_URL="postgresql://govex:govex_secret@localhost:5432/govex?schema=public"
NEXTAUTH_SECRET="your-development-secret"
NEXTAUTH_URL="http://localhost:3000"
```

### 4. Database Setup

To run PostgreSQL locally with Docker:
```bash
docker compose up -d
```

Run migrations and seed demo data:
```bash
npx prisma db push
npx prisma db seed
```

### 5. Launch the Development Server
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to view the application.

---

## 🔐 Demo Credentials

GovEx includes preconfigured test accounts for evaluation:

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@govex.demo` | `admin123` | Full administrative CRUD access |
| **Researcher** | `researcher@govex.demo` | `researcher123` | Evidence evaluation & data exports |

*Citizens can browse all verified evidence without requiring an account.*

---

## 📜 License

This project is licensed under the MIT License — see the LICENSE file for details.
