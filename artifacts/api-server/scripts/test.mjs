import { build } from "esbuild";
import { mkdtemp, rm } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = fileURLToPath(new URL("../", import.meta.url));
// Use the production bundler for extensionless TS imports, but replace only
// the DB entry point: tests must never open a connection to the application's DB.
const output = await mkdtemp(path.join(root, "node_modules/.api-tests-"));
try {
  await build({
    absWorkingDir: root,
    entryPoints: ["src/routes/startup-posts.test.ts", "src/lib/career-exploration.test.ts"],
    outdir: output,
    outExtension: { ".js": ".mjs" },
    bundle: true,
    platform: "node",
    format: "esm",
    packages: "external",
    alias: {
      "@workspace/db": path.join(root, "src/test-support/startup-posts-db.ts"),
    },
  });
  const result = spawnSync(process.execPath, ["--test",
    path.join(output, "routes/startup-posts.test.mjs"),
    path.join(output, "lib/career-exploration.test.mjs"),
  ], { stdio: "inherit" });
  if (result.error) throw result.error;
  process.exitCode = result.status ?? 1;
} finally {
  await rm(output, { recursive: true, force: true });
}
