const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const LOG_DIR = path.join(__dirname, "..", "backend", "logs");
const STATE_FILE = path.join(__dirname, ".analyzer-state.json");
const REPO_DIR = path.join(__dirname, "..");

const FIXABLE_PATTERNS = [
  {
    match: /CORS: origin.*not allowed/,
    label: "cors_origin",
    fix: async (match) => {
      const origin = match[0].match(/origin\s+(https?:\/\/[^\s]+)/)?.[1];
      if (!origin) return null;
      const envPath = path.join(REPO_DIR, "backend", ".env");
      let envContent = fs.readFileSync(envPath, "utf8");
      const match2 = envContent.match(/FRONTEND_URL=(.+)/);
      if (match2 && !match2[1].includes(origin)) {
        envContent = envContent.replace(/FRONTEND_URL=(.+)/, `FRONTEND_URL=$1,${origin}`);
        fs.writeFileSync(envPath, envContent);
        return `Added ${origin} to FRONTEND_URL in .env`;
      }
      return null;
    },
  },
  {
    match: /ECONNREFUSED|connect ECONNREFUSED/,
    label: "redis_db_connection",
    fix: async () => {
      try {
        execSync("pgrep -x redis-server || sudo systemctl start redis", { stdio: "pipe" });
        return "Redis was down, restarted";
      } catch {
        return "Redis restart attempted";
      }
    },
  },
  {
    match: /Cannot set headers after they are sent/,
    label: "double_response",
    fix: async (_match, contextLines) => {
      const fileMatch = contextLines.match(/\/(home\/ec2-user\/hafsa\/backend\/src\/[^\s:]+)/);
      if (!fileMatch) return null;
      const filePath = fileMatch[1];
      if (!fs.existsSync(filePath)) return null;
      let code = fs.readFileSync(filePath, "utf8");
      const lines = code.split("\n");
      let fixes = 0;
      for (let i = 0; i < lines.length; i++) {
        if (/^\s+res\.(json|send|status)\(/.test(lines[i])) {
          const prevLine = lines[i - 1] || "";
          if (!prevLine.includes("return") && prevLine.trim() !== "else") {
            lines[i] = "      return " + lines[i].trim();
            fixes++;
          }
        }
      }
      if (fixes > 0) {
        fs.writeFileSync(filePath, lines.join("\n"));
        return `Added ${fixes} missing return statements in ${path.basename(filePath)}`;
      }
      return null;
    },
  },
  {
    match: /Invalid namespace|Invalid namespace.*socket/,
    label: "socket_namespace",
    fix: async () => {
      const socketPath = path.join(REPO_DIR, "frontend", "src", "lib", "socket.ts");
      if (!fs.existsSync(socketPath)) return null;
      let content = fs.readFileSync(socketPath, "utf8");
      content = content.replace(/SOCKET_URL\s*=\s*(['"`][^'"`]+['"`])/g, (m, url) => {
        const parsed = url.slice(1, -1).replace(/\/hafsa.*$/, "");
        return `SOCKET_URL = '${parsed}'`;
      });
      content = content.replace(/path:\s*['"`][^'"`]*['"`]/g, "path: '/hafsa/socket.io'");
      fs.writeFileSync(socketPath, content);
      return "Fixed Socket.IO path";
    },
  },
  {
    match: /HTTP Request.*status.*500/,
    label: "internal_server_error",
    fix: async (_match, contextLines) => {
      const urlMatch = contextLines.match(/"url":"([^"]+)"/);
      const methodMatch = contextLines.match(/"method":"([^"]+)"/);
      if (urlMatch && methodMatch) {
        console.log(`[AUTO-FIX] 500 on ${methodMatch[1]} ${urlMatch[1]} - needs investigation`);
      }
      return null;
    },
  },
];

async function getNewErrors() {
  const files = fs.readdirSync(LOG_DIR).filter((f) => f.startsWith("error-") && f.endsWith(".log"));
  if (files.length === 0) return [];

  const state = { lastTimestamp: 0, seenErrors: [] };
  if (fs.existsSync(STATE_FILE)) {
    Object.assign(state, JSON.parse(fs.readFileSync(STATE_FILE, "utf8")));
  }

  const latest = files.sort().reverse()[0];
  const logPath = path.join(LOG_DIR, latest);
  const content = fs.readFileSync(logPath, "utf8");

  const errors = [];
  const lines = content.split("\n").filter(Boolean);

  for (const line of lines) {
    try {
      const entry = JSON.parse(line);
      const ts = new Date(entry.timestamp).getTime();
      if (ts <= state.lastTimestamp) continue;

      const msg = entry.message || "";
      const errorMsg = entry.error || "";
      const fingerprint = errorMsg || msg || "unknown";

      if (!state.seenErrors.includes(fingerprint)) {
        errors.push({ entry, fingerprint, line });
        state.seenErrors.push(fingerprint);
      }
    } catch {
      // skip
    }
  }

  if (errors.length > 0) {
    state.lastTimestamp = errors[errors.length - 1].entry.timestamp;
    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
  }

  return errors;
}

async function main() {
  console.log("[LOG-ANALYZER] Scanning error logs...");
  const errors = await getNewErrors();
  if (errors.length === 0) {
    console.log("[LOG-ANALYZER] No new errors found.");
    return;
  }

  console.log(`[LOG-ANALYZER] Found ${errors.length} new error(s).`);
  let madeChanges = false;

  for (const { entry, fingerprint, line } of errors) {
    console.log(`[LOG-ANALYZER] Analyzing: ${fingerprint.substring(0, 120)}`);

    let fixed = false;
    for (const pattern of FIXABLE_PATTERNS) {
      const match = fingerprint.match(pattern.match);
      if (match) {
        console.log(`[LOG-ANALYZER] Matched: ${pattern.label}`);
        try {
          const result = await pattern.fix(match, line);
          if (result) {
            console.log(`[LOG-ANALYZER] Fixed: ${result}`);
            madeChanges = true;
            fixed = true;
          }
        } catch (e) {
          console.log(`[LOG-ANALYZER] Fix failed: ${e.message}`);
        }
        break;
      }
    }

    if (!fixed) {
      console.log(`[LOG-ANALYZER] Unknown pattern, needs manual review`);
    }
  }

  if (madeChanges) {
    console.log("\n[LOG-ANALYZER] Committing and deploying...");
    try {
      execSync("cd " + REPO_DIR + " && git add -A && git diff --cached --quiet || (git commit -m 'fix(auto): apply log-based fixes' && git push)", { stdio: "inherit", timeout: 30000 });
      execSync("cd " + REPO_DIR + "/backend && npm run build 2>/dev/null && pm2 restart hafsa-backend 2>/dev/null", { stdio: "inherit", timeout: 60000 });
      console.log("[LOG-ANALYZER] Deployed.");
    } catch (e) {
      console.log("[LOG-ANALYZER] Deploy error:", e.message);
    }
  }

  console.log("[LOG-ANALYZER] Done.");
}

main().catch(console.error);
