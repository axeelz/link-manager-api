> This is the back-end of my personal link manager. The front-end is available [here](https://github.com/axeelz/link-manager-dashboard).

## General

- [Presentation](https://axlz.me/why) - Learn more about the project

---

# Elysia with Bun runtime

## Getting Started

To run this application you need to have the [Bun CLI installed](https://bun.sh/)

## Development

To start the development server run:

```bash
bun run dev
```

Open http://localhost:3000/ with your browser to see the result.

## Database

This uses SQLite with Turso and Drizzle ORM.

Launch Drizzle Studio with:

```bash
npx drizzle-kit studio
```

Generate a migration with:

```bash
npx drizzle-kit generate:sqlite
```

Run the migration with:

```bash
npx drizzle-kit push:sqlite
```
