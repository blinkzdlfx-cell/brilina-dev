import { readFileSync } from "node:fs";
import { spawn } from "node:child_process";
import crypto from "node:crypto";

function getVar(name) {
  const content = readFileSync(".dev.vars", "utf-8");
  const match = content.match(new RegExp(`^${name}=(.*)$`, "m"));
  if (!match) throw new Error(`Missing ${name} in .dev.vars`);
  return match[1].trim();
}

const email = getVar("ADMIN_EMAIL");
const password = getVar("ADMIN_PASSWORD");

if (!email || !password) {
  console.error("ADMIN_EMAIL and ADMIN_PASSWORD must be set in .dev.vars");
  process.exit(1);
}

const salt = crypto.randomBytes(16).toString("hex");
const hash = crypto
  .pbkdf2Sync(password, salt, 100000, 64, "sha256")
  .toString("hex");

const passwordHash = `pbkdf2:sha256:100000:${salt}:${hash}`;

const sql = `
INSERT OR IGNORE INTO admins (email, password_hash, created_at, updated_at)
VALUES ('${email}', '${passwordHash}', datetime('now'), datetime('now'));
`;

const child = spawn(
  "npx",
  ["wrangler", "d1", "execute", "brilina-dev-db", "--local", "--command", sql],
  { stdio: "inherit", shell: true }
);

child.on("exit", (code) => {
  if (code === 0) {
    console.log("Admin bootstrap complete.");
    console.log("Email:", email);
  } else {
    console.error("Bootstrap failed with code", code);
    process.exit(code);
  }
});
