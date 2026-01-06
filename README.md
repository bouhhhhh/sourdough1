
# Sourdough Store

Opinionated starter for a modern, production-ready Next.js storefront.

**Short description:** a TypeScript + Next.js e-commerce frontend with Tailwind, Stripe, i18n, and a small commerce API surface — configured for fast developer iteration and production deployment.

**Features**
- **TypeScript** throughout the codebase
- **Tailwind CSS** and utility-first UI primitives
- **Stripe** payments integration and Apple Pay components
- **i18n** message files under `src/messages`
- **Composable components** and hooks in `src/components` and `src/lib`
- Opinionated developer tooling: Biome, Husky, lint-staged, semantic-release

**Getting started (development)**
1. Install dependencies (recommended: Bun, pnpm, or npm):

```bash
# example with bun
bun install

# or with npm / pnpm
npm install
```

2. Run the dev server:

```bash
npm run dev
```

3. Open http://localhost:3000

**Available scripts** (from package.json)
- `dev` — run Next.js in development
- `build` — build the app for production
- `start` — run the production server
- `lint` — run Biome checks
- `test` — run tests
- `docker:build` / `docker:run` — build and run a Docker image

**Project structure (high level)**
- `src/app` — Next.js app routes and layouts
- `src/components` — UI components (client + server components)
- `src/lib` — utilities, API clients, and helpers
- `src/ui` — smaller presentational components and shared UI primitives
- `src/data` — local fixtures (products, recipes) used for mock/demo data

**Tech stack**
- Next.js 15, React 19, TypeScript
- TailwindCSS, Radix UI primitives, Lucide icons
- Stripe + @stripe/react-stripe-js
- Mongoose (for optional DB work)
- Biome, Husky, lint-staged, semantic-release for CI/quality

**Environment & secrets**
Place runtime secrets in environment variables (example `.env` keys):

- `STRIPE_SECRET_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- any DB connection string used by `src/lib/db.ts`

**Deployment**
- This repository is deployable on Vercel or any Node 20+ host. Build with `npm run build` and run with `npm start`.
- Docker: use `npm run docker:build` to build the image and `npm run docker:run` to run it locally.

**Contributing**
- Follow commit conventions; the repo is configured for `semantic-release`.
- Run Biome checks before pushing: `npm run lint`.

**License**
- This project includes dual licensing files in the repo; see the root-level LICENSE files for details.

---

If you'd like, I can also:
- add a short development checklist, or
- create a small CONTRIBUTING.md and CODE_OF_CONDUCT.md.

**Security**

For reporting vulnerabilities and security-related information, see `SECURITY.md` in the project root. If you want me to, I can add contact details or a preferred disclosure channel.


