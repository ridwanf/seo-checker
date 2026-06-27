# SEO Checker

A monorepo project for checking and analyzing SEO performance of websites.

## Project Structure

```text
seo-checker/
├── apps/
│   ├── api/                # Backend API (NestJS)
│   └── web/                # Frontend (Web App)
├── packages/
│   ├── shared-types/       # Shared TypeScript types
│   └── seo-engine/         # Core SEO analysis engine
├── turbo.json              # Turbo configuration
├── pnpm-workspace.yaml     # PNPM workspace configuration
└── package.json            # Root package.json
```

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later)
- [pnpm](https://pnpm.io/) (v10 or later)

## Getting Started

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Run Development Server

```bash
pnpm dev
```

### 3. Build All Packages

```bash
pnpm build
```

### 4. Run Tests

```bash
pnpm test
```

### 5. Run Linting

```bash
pnpm lint
```

## Tech Stack

- **Package Manager:** [pnpm](https://pnpm.io/)
- **Build System:** [Turborepo](https://turbo.build/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Backend:** [NestJS](https://nestjs.com/)
- **Testing:** [Jest](https://jestjs.io/)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/my-feature`)
3. Commit your changes (`git commit -m 'feat: add my feature'`)
4. Push to the branch (`git push origin feature/my-feature`)
5. Open a Pull Request

## License

This project is licensed under the [MIT License](LICENSE).