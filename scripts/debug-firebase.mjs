import { readFileSync } from "fs";
import { createSign } from "crypto";

const SA = JSON.parse(
  readFileSync("licoriceherbals1-firebase-adminsdk-fbsvc-e3d3ca70d9.json", "utf8"),
);
const PROJECT_ID = SA.project_id;

function makeJwt() {
  const now = Math.floor(Date.now() / 1000);
  const h = Buffer.from(JSON.stringify({ alg: "RS256", typ: "JWT" })).toString("base64url");
  const p = Buffer.from(
    JSON.stringify({
      iss: SA.client_email,
      sub: SA.client_email,
      aud: "https://oauth2.googleapis.com/token",
      iat: now,
      exp: now + 3600,
      scope:
        "https://www.googleapis.com/auth/cloud-platform https://www.googleapis.com/auth/firebase",
    }),
  ).toString("base64url");
  const s = createSign("RSA-SHA256");
  s.update(`${h}.${p}`);
  return `${h}.${p}.${s.sign(SA.private_key, "base64url")}`;
}

const tr = await fetch("https://oauth2.googleapis.com/token", {
  method: "POST",
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
  body: new URLSearchParams({
    grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
    assertion: makeJwt(),
  }),
});
const { access_token } = await tr.json();

// List all releases
const lr = await fetch(`https://firebaserules.googleapis.com/v1/projects/${PROJECT_ID}/releases`, {
  headers: { Authorization: `Bearer ${access_token}` },
});
const data = await lr.json();
console.log("Status:", lr.status);
console.log("Releases:", JSON.stringify(data?.releases?.map((r) => r.name) ?? data, null, 2));

// Also try listing indexes to see if permission works
const ir = await fetch(
  `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/collectionGroups/-/indexes`,
  { headers: { Authorization: `Bearer ${access_token}` } },
);
const idata = await ir.json();
console.log("\nIndex list status:", ir.status);
if (ir.ok) {
  console.log("Index count:", idata?.indexes?.length ?? 0);
} else {
  console.log("Index error:", JSON.stringify(idata?.error));
}
