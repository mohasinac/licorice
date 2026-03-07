#!/usr/bin/env node
/**
 * scripts/sync-env-vercel.mjs
 *
 * Syncs .env.local → Vercel environment variables so both match exactly.
 *
 * What it does:
 *   • Reads every KEY=VALUE pair from .env.local
 *   • Fetches current env vars from Vercel via REST API
 *   • Creates vars that don't exist on Vercel yet
 *   • Updates vars whose value has changed
 *   • Deletes vars that exist on Vercel but are absent from .env.local
 *     (only the targets listed in --env, default: production,preview,development)
 *
 * Usage:
 *   node scripts/sync-env-vercel.mjs
 *   node scripts/sync-env-vercel.mjs --dry-run
 *   node scripts/sync-env-vercel.mjs --env production
 *   node scripts/sync-env-vercel.mjs --env production,preview
 *   node scripts/sync-env-vercel.mjs --no-delete   # skip deletions
 *
 * Requirements:
 *   VERCEL_TOKEN must be set in .env.local or as a real env var.
 *   (Create one at https://vercel.com/account/tokens)
 */

import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

// ─── CLI flags ───────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const DRY_RUN = args.includes("--dry-run");
const NO_DELETE = args.includes("--no-delete");
const envFlagIdx = args.indexOf("--env");
const TARGET_ENVS =
  envFlagIdx !== -1 ? args[envFlagIdx + 1].split(",") : ["production", "preview", "development"];

// ─── Constants ───────────────────────────────────────────────────────────────
const PROJECT_ID = "prj_C9AsS6otFazmVMCdZh38WLpubdIo";
const API_BASE = "https://api.vercel.com";

// ─── Parse .env file ─────────────────────────────────────────────────────────
function parseEnvFile(filePath) {
  if (!existsSync(filePath)) {
    console.error(`❌  File not found: ${filePath}`);
    process.exit(1);
  }
  const lines = readFileSync(filePath, "utf8").split("\n");
  const vars = {};
  for (const raw of lines) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eqIdx = line.indexOf("=");
    if (eqIdx === -1) continue;
    const key = line.slice(0, eqIdx).trim();
    let value = line.slice(eqIdx + 1).trim();
    // Strip surrounding quotes (single or double)
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    vars[key] = value;
  }
  return vars;
}

// ─── Vercel API helpers ───────────────────────────────────────────────────────
async function apiFetch(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
  });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = { error: { message: text } };
  }
  if (!res.ok) {
    throw new Error(`Vercel API ${res.status}: ${json?.error?.message ?? text}`);
  }
  return json;
}

async function listVercelEnvs() {
  // Paginate through all env vars
  let all = [];
  let cursor = null;
  do {
    const qs = cursor ? `?until=${cursor}` : "";
    const data = await apiFetch(`/v9/projects/${PROJECT_ID}/env${qs}`);
    all = all.concat(data.envs ?? []);
    cursor = data.pagination?.next ?? null;
  } while (cursor);
  return all;
}

async function createVercelEnv(key, value, targets) {
  return apiFetch(`/v9/projects/${PROJECT_ID}/env`, {
    method: "POST",
    body: JSON.stringify({ key, value, type: "encrypted", target: targets }),
  });
}

async function updateVercelEnv(id, value, targets) {
  return apiFetch(`/v9/projects/${PROJECT_ID}/env/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ value, target: targets }),
  });
}

async function deleteVercelEnv(id) {
  return apiFetch(`/v9/projects/${PROJECT_ID}/env/${id}`, {
    method: "DELETE",
  });
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  // Resolve token — prefer real env, then fall back to .env.local
  const envPath = resolve(ROOT, ".env.local");
  const localVars = parseEnvFile(envPath);
  const TOKEN_FROM_FILE = localVars["VERCEL_TOKEN"];
  global.TOKEN = process.env.VERCEL_TOKEN ?? TOKEN_FROM_FILE;

  if (!global.TOKEN) {
    console.error(
      "❌  VERCEL_TOKEN is not set.\n" +
        "    Add it to .env.local as VERCEL_TOKEN=<token>, or export it as an env var.\n" +
        "    Create a token at https://vercel.com/account/tokens",
    );
    process.exit(1);
  }

  // Remove VERCEL_TOKEN from the set that gets synced
  delete localVars["VERCEL_TOKEN"];

  console.log(
    `\n🔄  Syncing .env.local → Vercel  [targets: ${TARGET_ENVS.join(", ")}]${DRY_RUN ? "  (DRY RUN)" : ""}\n`,
  );

  // Fetch existing Vercel vars
  let vercelEnvs;
  try {
    vercelEnvs = await listVercelEnvs();
  } catch (err) {
    console.error("❌  Failed to fetch Vercel env vars:", err.message);
    process.exit(1);
  }

  // Index by key → array of Vercel env objects (one per target combination)
  /** @type {Map<string, Array>} */
  const vercelByKey = new Map();
  for (const e of vercelEnvs) {
    if (!vercelByKey.has(e.key)) vercelByKey.set(e.key, []);
    vercelByKey.get(e.key).push(e);
  }

  const stats = { created: 0, updated: 0, deleted: 0, skipped: 0 };

  // ── Upsert: create or update ─────────────────────────────────────────────
  for (const [key, value] of Object.entries(localVars)) {
    const existing = vercelByKey.get(key);

    if (!existing || existing.length === 0) {
      // Create new
      console.log(`  ➕  CREATE  ${key}`);
      if (!DRY_RUN) {
        try {
          await createVercelEnv(key, value, TARGET_ENVS);
          stats.created++;
        } catch (err) {
          console.error(`     ⚠️  Failed to create ${key}: ${err.message}`);
        }
      } else {
        stats.created++;
      }
    } else {
      // Check if any existing record covers all our targets with the same value
      // Strategy: find the record that covers all TARGET_ENVS; update its value.
      // If multiple records exist (different target sets), update each one.
      let anyUpdated = false;
      for (const rec of existing) {
        const recTargets = rec.target ?? [];
        const overlaps = TARGET_ENVS.some((t) => recTargets.includes(t));
        if (!overlaps) continue;

        if (rec.value === value) {
          // Value unchanged
          continue;
        }

        console.log(`  ✏️   UPDATE  ${key}`);
        if (!DRY_RUN) {
          try {
            await updateVercelEnv(rec.id, value, recTargets);
            anyUpdated = true;
            stats.updated++;
          } catch (err) {
            console.error(`     ⚠️  Failed to update ${key}: ${err.message}`);
          }
        } else {
          anyUpdated = true;
          stats.updated++;
        }
      }
      if (!anyUpdated) stats.skipped++;
    }
  }

  // ── Delete: remove vars not in .env.local ────────────────────────────────
  if (!NO_DELETE) {
    for (const [key, records] of vercelByKey.entries()) {
      if (key in localVars) continue; // still present locally
      for (const rec of records) {
        const recTargets = rec.target ?? [];
        const overlaps = TARGET_ENVS.some((t) => recTargets.includes(t));
        if (!overlaps) continue;

        console.log(`  🗑️   DELETE  ${key}  (id: ${rec.id})`);
        if (!DRY_RUN) {
          try {
            await deleteVercelEnv(rec.id);
            stats.deleted++;
          } catch (err) {
            console.error(`     ⚠️  Failed to delete ${key}: ${err.message}`);
          }
        } else {
          stats.deleted++;
        }
      }
    }
  }

  console.log(
    `\n✅  Done.  created=${stats.created}  updated=${stats.updated}  deleted=${stats.deleted}  skipped(unchanged)=${stats.skipped}\n`,
  );
}

main();
