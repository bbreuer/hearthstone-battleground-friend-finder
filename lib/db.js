import postgres from "postgres";

let sqlClient = null;
let schemaPromise = null;

function getConnectionString() {
  return process.env.POSTGRES_URL || process.env.POSTGRES_PRISMA_URL || "";
}

function createClient() {
  const connectionString = getConnectionString();
  if (!connectionString) {
    return null;
  }

  return postgres(connectionString, {
    max: 1
  });
}

function getClient() {
  if (!sqlClient) {
    sqlClient = createClient();
  }

  return sqlClient;
}

async function initializeSchema(client) {
  await client`
    CREATE TABLE IF NOT EXISTS users (
      id BIGSERIAL PRIMARY KEY,
      battle_net_id TEXT NOT NULL UNIQUE,
      battletag TEXT,
      display_name TEXT,
      region TEXT NOT NULL DEFAULT 'us',
      bg_rank INTEGER,
      favorite_hero TEXT,
      looking_for_group TEXT,
      bio TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await client`
    CREATE TABLE IF NOT EXISTS posts (
      id BIGSERIAL PRIMARY KEY,
      user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      caption TEXT,
      placement INTEGER,
      mmr INTEGER,
      image_path TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
}

export function hasDatabase() {
  return Boolean(getConnectionString());
}

export async function getDb() {
  const client = getClient();
  if (!client) {
    return null;
  }

  if (!schemaPromise) {
    schemaPromise = initializeSchema(client);
  }

  await schemaPromise;
  return client;
}
