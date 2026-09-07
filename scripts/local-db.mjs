import EmbeddedPostgres from "embedded-postgres";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { randomBytes } from "node:crypto";
import path from "node:path";

// A real, isolated PostgreSQL server for development. Never reads another project.
const root = process.cwd();
const localDir = path.join(root, ".local");
mkdirSync(localDir, { recursive: true });
const configFile = path.join(localDir, "postgres.json");
if (!existsSync(configFile))
  writeFileSync(
    configFile,
    JSON.stringify({
      user: "clicklens",
      password: randomBytes(24).toString("hex"),
      port: 55432,
    }),
    { flag: "wx", mode: 0o600 },
  );
const config = JSON.parse(readFileSync(configFile, "utf8"));
const databaseDir = path.join(localDir, "postgres");
const pg = new EmbeddedPostgres({
  ...config,
  databaseDir,
  persistent: true,
  authMethod: "scram-sha-256",
  postgresFlags: ["-h", "127.0.0.1"],
  onLog: () => {},
  onError: () => {},
});
if (!existsSync(path.join(databaseDir, "PG_VERSION"))) await pg.initialise();
await pg.start();
const client = pg.getPgClient();
await client.connect();
if (
  !(await client.query("SELECT 1 FROM pg_database WHERE datname = 'clicklens'"))
    .rowCount
)
  await pg.createDatabase("clicklens");
await client.end();
const envPath = path.join(root, ".env");
if (!existsSync(envPath)) {
  writeFileSync(
    envPath,
    `DATABASE_URL="postgresql://${config.user}:${config.password}@127.0.0.1:${config.port}/clicklens?schema=public"\nAUTH_SECRET="${randomBytes(32).toString("hex")}"\nAPP_URL="http://localhost:3000"\n`,
    { flag: "wx", mode: 0o600 },
  );
  console.log("Created .env with fresh ClickLens-only local credentials.");
}
console.log(
  `ClickLens PostgreSQL is listening on 127.0.0.1:${config.port}. Keep this terminal open. Ctrl+C stops it; data is preserved.`,
);
setInterval(() => {}, 60000);
