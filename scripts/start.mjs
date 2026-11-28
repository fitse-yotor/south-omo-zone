// Starts the whole portal for local development: Laravel (admin + API) and the Vite website.
//   npm start                 start both          (Windows: or double-click start.bat)
//   npm start -- --open       also open both in the browser
//   Ctrl+C                    stop both
// Other ports: set BACKEND_PORT / FRONTEND_PORT.
import { spawn, spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import net from "node:net";
import path from "node:path";
import readline from "node:readline";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const backend = path.join(root, "backend");
const HOST = "127.0.0.1";
const API_PORT = Number(process.env.BACKEND_PORT || 8000);
const WEB_PORT = Number(process.env.FRONTEND_PORT || 5173);
const API = `http://${HOST}:${API_PORT}`;
const WEB = `http://${HOST}:${WEB_PORT}`;

const colour = (code, text) => (process.stdout.isTTY ? `\x1b[${code}m${text}\x1b[0m` : text);
const say = (text) => console.log(`${colour(1, "[portal]")} ${text}`);
const fail = (text) => {
  console.error(`${colour(31, "[portal]")} ${text}`);
  process.exit(1);
};

// PHP start-up noise from unused XAMPP extensions, and the built-in server's line for every request.
// PHP errors and warnings from the application still show.
const NOISE = [
  /pdo_firebird/, /Cannot find module \(/, /MIB search path/, /^\s*$/,
  /\] \S+ (Accepted|Closing)$/, /Closed without sending a request/, /\[(GET|POST|HEAD|OPTIONS)\] URI:/, /\[200\]:|\[30\d\]:/,
];

// ── Checks ──────────────────────────────────────────────────

if (spawnSync("php", ["-v"], { stdio: "ignore" }).status !== 0) fail("PHP was not found. Install PHP 8.2+ (XAMPP) and add it to PATH.");
if (!existsSync(path.join(backend, "vendor", "autoload.php"))) fail('Backend packages are missing. Run "composer install" in the backend folder.');
if (!existsSync(path.join(backend, ".env"))) fail("backend/.env is missing. Follow “Development (local)” in deploy/DEPLOY.md once, then run this again.");
const vite = path.join(root, "node_modules", "vite", "bin", "vite.js");
if (!existsSync(vite)) fail('Website packages are missing. Run "npm install" first.');

const migrations = spawnSync("php", ["artisan", "migrate:status", "--no-ansi"], { cwd: backend, encoding: "utf8" });
if (migrations.status !== 0) say(colour(33, "Could not check the database. If pages fail, run: php artisan migrate  (in backend)"));
else if (/\bPending\b/.test(migrations.stdout)) say(colour(33, "The database has pending updates. Run: php artisan migrate  (in backend)"));

// ── Processes ───────────────────────────────────────────────

const children = [];
let stopping = false;

function run(name, code, command, args, options) {
  const child = spawn(command, args, { stdio: ["ignore", "pipe", "pipe"], ...options });
  for (const stream of [child.stdout, child.stderr]) {
    readline.createInterface({ input: stream }).on("line", (line) => {
      if (!NOISE.some((re) => re.test(line))) console.log(`${colour(code, `[${name}]`)} ${line}`);
    });
  }
  child.on("error", (error) => stop(1, `${name} could not start: ${error.message}`));
  child.on("exit", (exitCode) => !stopping && stop(1, `${name} stopped unexpectedly (exit code ${exitCode}).`));
  children.push(child);
}

function stop(exitCode = 0, reason) {
  if (stopping) return;
  stopping = true;
  if (reason) say(reason);
  say("Stopping…");
  for (const child of children) {
    if (child.exitCode !== null || !child.pid) continue;
    // Windows has no process groups to signal: end the whole tree so no server is left holding the port.
    if (process.platform === "win32") spawnSync("taskkill", ["/pid", String(child.pid), "/T", "/F"], { stdio: "ignore" });
    else child.kill("SIGTERM");
  }
  process.exit(exitCode);
}

for (const signal of ["SIGINT", "SIGTERM", "SIGHUP", "SIGBREAK"]) process.on(signal, () => stop(0));

const portInUse = (port) =>
  new Promise((resolve) => {
    const socket = net.connect({ host: HOST, port });
    socket.once("connect", () => (socket.destroy(), resolve(true)));
    socket.once("error", () => resolve(false));
  });

const responds = async (url) => {
  try {
    return (await fetch(url, { signal: AbortSignal.timeout(5000) })).ok;
  } catch {
    return false;
  }
};

async function waitFor(url, name) {
  const deadline = Date.now() + 90_000;
  while (Date.now() < deadline) {
    if (await responds(url)) return;
    await new Promise((r) => setTimeout(r, 500));
  }
  stop(1, `${name} did not answer at ${url} within 90 seconds. See the messages above.`);
}

// Backend. PHP's built-in server is started directly (what "php artisan serve" does) so that local
// uploads can be allowed up to 20 MB without editing php.ini. A live server uses its own PHP settings.
if (await portInUse(API_PORT)) {
  if (!(await responds(`${API}/api/content`))) fail(`Port ${API_PORT} is used by another program. Close it, or set BACKEND_PORT to another number.`);
  say(`The backend is already running on port ${API_PORT}; using it.`);
} else {
  say("Starting the backend…");
  run("admin", 36, "php", [
    "-d", "upload_max_filesize=20M", "-d", "post_max_size=25M",
    "-S", `${HOST}:${API_PORT}`,
    path.join(backend, "vendor/laravel/framework/src/Illuminate/Foundation/resources/server.php"),
  ], { cwd: path.join(backend, "public") });
}

// Frontend, pointed at the backend so it shows what is edited in the admin panel.
// stop(), not fail(): it also ends the backend started above.
if (await portInUse(WEB_PORT)) stop(1, `Port ${WEB_PORT} is already in use (is the website already running?). Close it, or set FRONTEND_PORT.`);
say("Starting the website…");
run("website", 35, process.execPath, [vite, "--host", HOST, "--port", String(WEB_PORT), "--strictPort", "--clearScreen", "false"], {
  cwd: root,
  env: { ...process.env, VITE_API_URL: `${API}/api` },
});

await Promise.all([waitFor(`${API}/api/content`, "The backend"), waitFor(`${WEB}/`, "The website")]);

console.log(`
  ${colour(32, "The portal is running")}
  Website      ${WEB}
  Admin panel  ${API}/admin

  Press Ctrl+C to stop.
`);

if (process.argv.includes("--open")) {
  for (const url of [WEB, `${API}/admin`]) {
    const [command, args] =
      process.platform === "win32" ? ["cmd", ["/c", "start", "", url]] : [process.platform === "darwin" ? "open" : "xdg-open", [url]];
    spawn(command, args, { stdio: "ignore", detached: true }).on("error", () => {}).unref();
  }
}

// Keep running even when the backend was already up and only the website is ours.
setInterval(() => {}, 1 << 30);
