---
name: pnpm optional peer relinking
description: Filtered dependency installs can leave workspace links inconsistent after Drizzle peer changes.
---

After adding an optional Drizzle peer with a filtered pnpm install, run `pnpm install --frozen-lockfile` across the workspace if type checking reports incompatible copies of `SQL` or `PgColumn`.

**Why:** A filtered install updated the lockfile's Drizzle peer resolution for both the API and database packages, but left the database package linked to the previous peer variant. The resulting private-property type errors affected otherwise unchanged routes.

**How to apply:** Check the two packages' Drizzle symlink targets before changing application types. Relink from the existing lockfile rather than adding casts or changing business logic.
