#!/usr/bin/env node
/**
 * auto-commit.js
 *
 * Monitors your FindBack PH project for file changes on save.
 * After a debounce period, it:
 *   1. Runs `npx tsc --noEmit` (type-check)
 *   2. If that passes, runs `npm run build` (production build)
 *   3. If BOTH pass, runs `git add .` -> `git commit` -> `git push`
 *   4. If the build FAILS, it stops and reports the error (no push).
 *
 * Excludes: node_modules, .next, .git, dist, .vercel, logs, .env* files
 *
 * Usage:
 *   npm run watch:commit
 * Or via VS Code Command Palette -> "Run Task" -> "Auto Commit + Push"
 *
 * To STOP the watcher: Ctrl+C in the terminal where it was started.
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const os = require("os");

const chokidar = require("chokidar");

const PROJECT_ROOT = path.resolve(__dirname, "..");

const IGNORED_DIRS = new Set([
  "node_modules",
  ".next",
  ".git",
  "dist",
  ".vercel",
  "logs",
  ".vscode",
  ".idea",
  ".DS_Store",
]);

const IGNORED_EXTENSIONS = new Set([
  ".log",
  ".tmp",
  ".swp",
  ".swo",
  ".db",
  ".db-journal",
  ".tsbuildinfo",
]);

const SOURCE_EXTENSIONS = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".json",
  ".css",
  ".md",
  ".txt",
  ".prisma",
  ".html",
  ".svg",
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".ico",
]);

function shouldWatch(filePath) {
  const relPath = path.relative(PROJECT_ROOT, filePath);
  if (!relPath || relPath.startsWith("..")) return false;

  const parts = relPath.split(path.sep);
  for (const part of parts) {
    if (IGNORED_DIRS.has(part)) return false;
  }

  const fileName = parts[parts.length - 1];
  if (/^\.env/.test(fileName)) return false;
  if (fileName.startsWith(".env")) return false;

  const ext = path.extname(filePath).toLowerCase();
  if (IGNORED_EXTENSIONS.has(ext)) return false;
  if (!SOURCE_EXTENSIONS.has(ext)) return false;

  return true;
}

let debounceTimer = null;
let pendingFiles = new Set();
let isBuilding = false;
const DEBOUNCE_MS = 2000;

function log(msg, type = "info") {
  const icons = {
    info: "[INFO]",
    warn: "[WARN]",
    error: "[ERROR]",
    success: "[OK]",
    build: "[BUILD]",
  };
  const timestamp = new Date().toLocaleTimeString("en-PH", { hour12: false });
  console.log(`${timestamp} ${icons[type] || icons.info} ${msg}`);
}

function notify(title, message, isError = false) {
  try {
    execSync(
      `powershell -NoProfile -Command "New-BurntToastNotification -Text '${title}', '${message}' 2>$null"`,
      { stdio: "ignore", timeout: 3000 }
    );
  } catch {
    // BurntToast not installed -- skip
  }
}

function run(cmd, label) {
  log(`Running: ${label || cmd}`, "build");
  try {
    const stdout = execSync(cmd, {
      cwd: PROJECT_ROOT,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
      timeout: 300000,
    });
    log(`${label || cmd} -> SUCCESS`, "success");
    return { ok: true, output: stdout };
  } catch (e) {
    log(`${label || cmd} -> FAILED`, "error");
    if (e.stderr) log(e.stderr.toString().slice(0, 500), "error");
    return { ok: false, output: e.stderr ? e.stderr.toString() : e.message };
  }
}

function getCurrentBranch() {
  try {
    const branch = execSync("git branch --show-current", {
      cwd: PROJECT_ROOT,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    }).trim();
    return branch || "main";
  } catch {
    return "main";
  }
}

function getTimestamp() {
  return new Date().toISOString().replace(/T/, " ").replace(/\..+/, "");
}

async function processChanges() {
  if (isBuilding) return;
  isBuilding = true;

  const files = Array.from(pendingFiles).sort();
  pendingFiles.clear();
  debounceTimer = null;

  log(`Detected changes in ${files.length} file(s)`, "info");
  files.forEach((f) => log(`  - ${path.relative(PROJECT_ROOT, f)}`, "info"));

  const branch = getCurrentBranch();

  const tscResult = run("npx tsc --noEmit", "TypeScript check");
  if (!tscResult.ok) {
    notify("Build Failed", "TypeScript errors detected. Fix before commit.", true);
    isBuilding = false;
    return;
  }

  const buildResult = run("npm run build", "Production build");
  if (!buildResult.ok) {
    notify("Build Failed", "Production build failed. Fix before commit.", true);
    isBuilding = false;
    return;
  }

  log("Staging files...", "build");
  const addResult = run("git add .", "Git add");
  if (!addResult.ok) {
    notify("Git Failed", "git add failed.", true);
    isBuilding = false;
    return;
  }

  try {
    const status = execSync("git status --porcelain", {
      cwd: PROJECT_ROOT,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
    if (!status.trim()) {
      log("No changes to commit after build (likely generated files only).", "warn");
      isBuilding = false;
      return;
    }
  } catch {
    log("Could not check git status.", "warn");
  }

  const timestamp = getTimestamp();
  const commitMsg = `auto: update ${timestamp}`;
  const commitResult = run(`git commit -m "${commitMsg}"`, "Git commit");
  if (!commitResult.ok) {
    notify("Git Failed", "git commit failed.", true);
    isBuilding = false;
    return;
  }

  log(`Pushing to origin/${branch}...`, "build");
  const pushResult = run(`git push origin ${branch}`, "Git push");
  if (!pushResult.ok) {
    notify("Push Failed", "git push failed. Check network/auth.", true);
    isBuilding = false;
    return;
  }

  log(`Successfully committed and pushed to origin/${branch}`, "success");
  notify(
    "Auto-Commit Success",
    `Pushed ${files.length} change(s) to GitHub. Vercel will deploy shortly.`
  );
  isBuilding = false;
}

function onChange(filePath) {
  if (!shouldWatch(filePath)) return;
  pendingFiles.add(filePath);

  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    processChanges();
  }, DEBOUNCE_MS);
}

function startWatcher() {
  log("Starting file watcher...", "info");
  log(`Project root: ${PROJECT_ROOT}`, "info");
  log(`Watching for changes... (Ctrl+C to stop)`, "info");

  const watcher = chokidar.watch(PROJECT_ROOT, {
    ignored: [
      /(?:^|[\/\\])(?:node_modules|\.next|\.git|dist|\.vercel|logs|\.vscode|\.idea)(?:[\/\\]|$)/,
      /\.env/,
    ],
    persistent: true,
    ignoreInitial: true,
    awaitWriteFinish: {
      stabilityThreshold: 500,
      pollInterval: 200,
    },
  });

  watcher
    .on("add", (filePath) => onChange(filePath))
    .on("change", (filePath) => onChange(filePath))
    .on("error", (error) => log(`Watcher error: ${error.message}`, "error"));

  watcher.on("ready", () => {
    log("Watcher is ready. All changes will trigger auto-commit.", "success");
  });

  process.on("SIGINT", () => {
    log("Stopping watcher...", "info");
    watcher.close();
    process.exit(0);
  });
}

startWatcher();
