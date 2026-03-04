# DBS (DB STUDIO)

An advanced, production-ready Admin Dashboard and Role-Based Access Control (RBAC) starter template built with Next.js, Better Auth, and Prisma.

## 📚 Documentation

The full documentation for this project—including installation guides, API references, architecture patterns, and component usage—is available at:

**👉 [docs.ibobdb.com](https://docs.ibobdb.com)**

> *Note: The documentation is hosted on a separate repository (using Nextra/Docusaurus) to keep the core application lightweight and focused solely on backend and dashboard logic.*

## 🚀 Quick Start (Local Development)

If you are just looking to run the dashboard locally:

1. **Clone and Install**
   ```bash
   npm install
   ```

2. **Environment Variables**
   Duplicate `.env.example` to `.env` and fill in your database string and Better Auth secrets.

3. **Database Setup**
   ```bash
   npx prisma db push
   npx prisma generate
   npm run seed
   ```
   *(Running the seed command is critical to populate the initial `super_admin` roles and permissions).*

4. **Run Development Server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) with your browser. The root `/` path will automatically redirect to the `/dashboard`.

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Authentication**: [Better Auth](https://better-auth.com/)
- **Database ORM**: [Prisma](https://www.prisma.io/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/) & [Tailwind CSS](https://tailwindcss.com/)
- **State & Fetching**: [SWR](https://swr.vercel.app/)

## 📝 License

All rights reserved &copy; DBS.
