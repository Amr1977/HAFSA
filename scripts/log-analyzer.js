const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const LOG_DIR = path.join(__dirname, "..", "backend", "logs");
const STATE_FILE = path.join(__dirname, ".analyzer-state.json");
const REPO_DIR = path.join(__dirname, "..");

// Determine which AI tool to use
function getAITool() {
  try {
    execSync("which opencode", { stdio: "pipe" });
    return "opencode";
  } catch {
    try {
      execSync("which kilocode", { stdio: "pipe" });
      return "kilocode";
    } catch {
      return null;
    }
  }
}

const FIXABLE_PATTERNS = [
  {
    match: /CORS: origin.*not allowed/,
    label: "cors_origin",
    fix: async (match) => {
      const origin = match[0].match(/origin\s+(https?:\/\/[^\s]+)/)?.[1];
      if (!origin) return null;
      const envPath = path.join(REPO_DIR, "backend", ".env");
      let envContent = fs.readFileSync(envPath, "utf8");
      const m = envContent.match(/FRONTEND_URL=(.+)/);
      if (m && !m[1].includes(origin)) {
        envContent = envContent.replace(/FRONTEND_URL=(.+)/, `FRONTEND_URL=$1,${origin}`);
        fs.writeFileSync(envPath, envContent);
        return `Added ${origin} to FRONTEND_URL`;
      }
      return null;
    },
  },
  {
    match: /ECONNREFUSED|connect ECONNREFUSED/,
    label: "connection_refused",
    fix: async () => {
      try {
        execSync("pgrep -x redis-server || sudo systemctl start redis", { stdio: "pipe" });
        return "Redis restarted";
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
        return `Added ${fixes} missing return in ${path.basename(filePath)}`;
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
  const content = fs.readFileSync(path.join(LOG_DIR, latest), "utf8");

  const errors = [];
  const lines = content.split("\n").filter(Boolean);

  for (const line of lines) {
    try {
      const entry = JSON.parse(line);

      // Skip client-side errors (browser issues)
      if (entry.client) continue;
      // Skip HTTP request logs (just metadata, not actual errors)
      if (entry.message === "HTTP Request") continue;

      const ts = new Date(entry.timestamp).getTime();
      if (ts <= state.lastTimestamp) continue;

      const errorMsg = entry.error || "";
      const msg = entry.message || "";
      const stack = entry.stack || "";
      const fingerprint = errorMsg || msg || "unknown";

      if (!state.seenErrors.includes(fingerprint)) {
        errors.push({ entry, fingerprint, line: JSON.stringify(entry) });
        state.seenErrors.push(fingerprint);
      }
    } catch {
      // skip unparseable
    }
  }

  if (errors.length > 0) {
    state.lastTimestamp = errors[errors.length - 1].entry.timestamp;
    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
  }

  return errors;
}

function gitAddOnlySource() {
  // Only stage actual source changes, not docs, prompts, bump files
  const patterns = [
    "backend/src/", "frontend/src/", "backend/prisma/",
    "scripts/log-analyzer.js", "scripts/auto-fix.sh",
    "backend/.env",
  ];
  for (const p of patterns) {
    try {
      execSync(`git add ${p} 2>/dev/null`, { stdio: "pipe" });
    } catch {}
  }
}

async function tryAIFix(fingerprint, line, tool) {
  const cmd = tool === "kilocode" ? "kilocode" : "opencode";
  const prompt = `You are a bug-fixing AI for a Node.js/Express backend. 
A new error was detected in production logs:

ERROR: ${fingerprint.substring(0, 500)}

Full log entry: ${line.substring(0, 1000)}

The repo is at /home/ec2-user/hafsa. Analyze the error, find the root cause in the source code under backend/src/, and fix it. 
Rules:
1. Only modify files under backend/src/ or frontend/src/
2. Do NOT add comments to the code
3. Do NOT modify config files, .env, documentation, or markdown files
4. After fixing, run the build to verify
5. Report what you changed and why`;

  try {
    execSync(`cd ${REPO_DIR} && ${cmd} run "${prompt}"`, {
      stdio: "inherit",
      timeout: 120000,
      shell: "/bin/bash",
    });
    return true;
  } catch (e) {
    console.log(`[AUTO-FIX] ${cmd} failed: ${e.message}`);
    return false;
  }
}

async function main() {
  console.log("[LOG-ANALYZER] Scanning error logs...");
  const errors = await getNewErrors();
  if (errors.length === 0) {
    console.log("[LOG-ANALYZER] No new errors found.");
    return;
  }

  console.log(`[LOG-ANALYZER] Found ${errors.length} new server error(s).`);
  let madeChanges = false;

  for (const { entry, fingerprint, line } of errors) {
    console.log(`[LOG-ANALYZER] Analyzing: ${fingerprint.substring(0, 120)}`);

    let fixed = false;
    // First try pattern-based fixes
    for (const pattern of FIXABLE_PATTERNS) {
      const match = fingerprint.match(pattern.match);
      if (match) {
        console.log(`[LOG-ANALYZER] Matched pattern: ${pattern.label}`);
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

    // If pattern didn't match, try AI fix
    if (!fixed) {
      const tool = getAITool();
      if (tool) {
        console.log(`[LOG-ANALYZER] Trying AI fix via ${tool}...`);
        const ok = await tryAIFix(fingerprint, line, tool);
        if (ok) {
          // AI tool may have made changes — git add will pick them up
          madeChanges = true;
          fixed = true;
        }
      } else {
        console.log("[LOG-ANALYZER] No AI tool available, skipping");
      }
    }

    if (!fixed) {
      console.log("[LOG-ANALYZER] Could not fix automatically");
    }
  }

  if (madeChanges) {
    console.log("\n[LOG-ANALYZER] Committing and deploying...");
    try {
      gitAddOnlySource();
      execSync("cd " + REPO_DIR + " && git diff --cached --quiet || (git commit -m 'fix(auto): apply log-based fixes' && git push)", { stdio: "inherit", timeout: 30000 });
      execSync("cd " + REPO_DIR + "/backend && npm run build 2>/dev/null && pm2 restart hafsa-backend 2>/dev/null", { stdio: "inherit", timeout: 60000 });
      console.log("[LOG-ANALYZER] Deployed.");
    } catch (e) {
      console.log("[LOG-ANALYZER] Deploy error:", e.message);
    }
  }

  console.log("[LOG-ANALYZER] Done.");
}

main().catch(console.error);
