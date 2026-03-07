#!/usr/bin/env node
/**
 * scripts/deploy-firebase-rules.mjs
 * Deploys Firestore security rules and indexes using the service account JWT,
 * bypassing the Firebase CLI's Service Usage API check.
 */

import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { createSign } from "crypto";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

const SA = JSON.parse(
  readFileSync(resolve(ROOT, "licoriceherbals1-firebase-adminsdk-fbsvc-e3d3ca70d9.json"), "utf8"),
);
const PROJECT_ID = SA.project_id;

// ── JWT / Access Token ────────────────────────────────────────────────────────

function makeJwt() {
  const now = Math.floor(Date.now() / 1000);
  const header = Buffer.from(JSON.stringify({ alg: "RS256", typ: "JWT" })).toString("base64url");
  const payload = Buffer.from(
    JSON.stringify({
      iss: SA.client_email,
      sub: SA.client_email,
      aud: "https://oauth2.googleapis.com/token",
      iat: now,
      exp: now + 3600,
      scope: [
        "https://www.googleapis.com/auth/cloud-platform",
        "https://www.googleapis.com/auth/firebase",
      ].join(" "),
    }),
  ).toString("base64url");
  const unsigned = `${header}.${payload}`;
  const sign = createSign("RSA-SHA256");
  sign.update(unsigned);
  const sig = sign.sign(SA.private_key, "base64url");
  return `${unsigned}.${sig}`;
}

async function getAccessToken() {
  const jwt = makeJwt();
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });
  const json = await res.json();
  if (!json.access_token) throw new Error(`Token error: ${JSON.stringify(json)}`);
  return json.access_token;
}

// ── Firestore Rules ───────────────────────────────────────────────────────────

async function deployRules(token) {
  const source = readFileSync(resolve(ROOT, "firestore.rules"), "utf8");

  // 1. Create ruleset
  const createRes = await fetch(
    `https://firebaserules.googleapis.com/v1/projects/${PROJECT_ID}/rulesets`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        source: {
          files: [{ name: "firestore.rules", content: source }],
        },
      }),
    },
  );
  const ruleset = await createRes.json();
  if (!createRes.ok) throw new Error(`Create ruleset failed: ${JSON.stringify(ruleset)}`);
  const rulesetName = ruleset.name;
  console.log(`  ✅ Ruleset created: ${rulesetName}`);

  // 2. Update release to point to new ruleset
  const releaseRes = await fetch(
    `https://firebaserules.googleapis.com/v1/projects/${PROJECT_ID}/releases/cloud.firestore`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        release: {
          name: `projects/${PROJECT_ID}/releases/cloud.firestore`,
          rulesetName,
        },
      }),
    },
  );
  const release = await releaseRes.json();
  if (!releaseRes.ok) throw new Error(`Update release failed: ${JSON.stringify(release)}`);
  console.log(`  ✅ Firestore rules deployed`);
}

// ── Firestore Indexes ─────────────────────────────────────────────────────────

function stripJsonComments(str) {
  return str.replace(/\/\/.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "");
}

async function deployIndexes(token) {
  const raw = readFileSync(resolve(ROOT, "firestore.indexes.json"), "utf8");
  const { indexes } = JSON.parse(stripJsonComments(raw));

  // Deduplicate (same index defined twice for clarity in the file)
  const seen = new Set();
  const unique = indexes.filter((idx) => {
    const key = JSON.stringify(
      [
        idx.collectionGroup,
        idx.queryScope,
        ...(idx.fields ?? []).map((f) => `${f.fieldPath}:${f.order ?? f.arrayConfig}`),
      ].sort(),
    );
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  let created = 0;
  let skipped = 0;

  for (const idx of unique) {
    const body = {
      queryScope: idx.queryScope,
      fields: idx.fields,
    };
    const res = await fetch(
      `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/collectionGroups/${idx.collectionGroup}/indexes`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      },
    );
    const json = await res.json();
    if (res.status === 409 || json?.error?.status === "ALREADY_EXISTS") {
      skipped++;
    } else if (!res.ok) {
      const msg = json?.error?.message ?? res.status;
      const code = json?.error?.code ?? res.status;
      console.warn(
        `  ⚠️  Index ${idx.collectionGroup} [${idx.fields.map((f) => f.fieldPath).join(",")}]: ${code} ${msg}`,
      );
    } else {
      created++;
    }
  }
  console.log(`  ✅ Indexes: ${created} created, ${skipped} already exist`);
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\n🔥  Deploying Firebase rules & indexes → ${PROJECT_ID}\n`);
  const token = await getAccessToken();

  await deployRules(token);
  await deployIndexes(token);

  console.log("\n✅  All done.\n");
}

main().catch((err) => {
  console.error("❌", err.message);
  process.exit(1);
});
