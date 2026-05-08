# AdminSat

A Next.js application ready for Vercel deployment.

## Prerequisites

- Node.js 18+
- PostgreSQL database (for production)

## Setup

1. Clone the repository
2. Install dependencies: `pnpm install`
3. Set up environment variables:
   - Create `.env` file with `DATABASE_URL` for your PostgreSQL connection

## Development

```bash
pnpm dev
```

## Deploy to Vercel

1. Push the code to GitHub/GitLab
2. Import the project on [Vercel](https://vercel.com/new)
3. Set the `DATABASE_URL` environment variable in Vercel project settings
4. Deploy!

### PostgreSQL Connection String Format

```
postgresql://USER:PASSWORD@HOST:5432/DATABASE?schema=public
```

## Database Migration

After deployment, run migrations using the Vercel CLI:

```bash
vercel --prod
vercel psql <migration.sql>
```

Or use Prisma Migrate locally with your production database URL.