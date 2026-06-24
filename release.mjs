#!/usr/bin/env node
/**
 * Release helper — one command to ship a new version everywhere.
 *
 * Bumps the version in package.json AND server.json (both the top-level
 * version and packages[0].version, which must stay in sync), rebuilds,
 * commits + tags + pushes to GitHub, publishes to npm, then publishes the
 * manifest to the MCP registry.
 *
 * Usage:
 *   npm run release              # patch  (1.0.0 -> 1.0.1)
 *   npm run release -- minor     # minor  (1.0.0 -> 1.1.0)
 *   npm run release -- major     # major  (1.0.0 -> 2.0.0)
 *   npm run release -- 1.4.2     # explicit version
 *
 * The only step that may need you is the MCP registry: its token expires,
 * so if that step fails, run `mcp-publisher login github` (authorize as
 * lanternrow) and then `npm run release:registry`. npm + GitHub are already
 * done by that point, so re-running only the registry step is safe.
 */
import { execSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

const run = (cmd) => execSync(cmd, { stdio: "inherit" });

const bump = process.argv[2] || "patch";
const isSemver = /^\d+\.\d+\.\d+(-[\w.]+)?$/.test(bump);
if (!["patch", "minor", "major"].includes(bump) && !isSemver) {
  console.error(`Invalid bump "${bump}". Use: patch | minor | major | x.y.z`);
  process.exit(1);
}

// 1. Bump package.json (let npm compute the semver). No git side effects yet.
run(`npm version ${bump} --no-git-tag-version`);
const pkg = JSON.parse(readFileSync("package.json", "utf8"));
const version = pkg.version;
console.log(`\n→ New version: ${version}`);

// 2. Keep server.json (the MCP registry manifest) in lockstep.
const server = JSON.parse(readFileSync("server.json", "utf8"));
server.version = version;
if (server.packages?.[0]) server.packages[0].version = version;
writeFileSync("server.json", JSON.stringify(server, null, 2) + "\n");
console.log(`→ Synced server.json to ${version}`);

// 3. Build.
run("npm run build");

// 4. Commit, tag, push.
run("git add -A");
run(`git commit -m "Release v${version}"`);
run(`git tag v${version}`);
run("git push --follow-tags");

// 5. Publish to npm.
run("npm publish --access public");
console.log(`\n✓ npm: ${pkg.name}@${version}`);

// 6. Publish to the MCP registry (token may have expired).
try {
  run("mcp-publisher publish");
  console.log(`\n✓ registry: ${server.name} v${version}`);
} catch {
  console.error(
    `\n⚠ Registry publish failed — token likely expired.\n` +
      `  1) mcp-publisher login github   (authorize as lanternrow)\n` +
      `  2) npm run release:registry\n` +
      `  npm + GitHub already shipped v${version}; only the registry step remains.`
  );
  process.exit(2);
}

console.log(`\n🚀 Release v${version} complete across npm, GitHub, and the MCP registry.`);
