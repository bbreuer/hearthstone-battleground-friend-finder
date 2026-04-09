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
  await client.begin(async (sql) => {
    await sql`SELECT pg_advisory_xact_lock(482193761)`;

    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id BIGSERIAL PRIMARY KEY,
        battle_net_id TEXT NOT NULL UNIQUE,
        battletag TEXT,
        display_name TEXT,
        region TEXT NOT NULL DEFAULT 'us',
        is_online BOOLEAN NOT NULL DEFAULT FALSE,
        bg_rank INTEGER,
        favorite_hero TEXT,
        looking_for_group TEXT,
        bio TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;

    await sql`
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

    await sql`
      CREATE TABLE IF NOT EXISTS message_invites (
        id BIGSERIAL PRIMARY KEY,
        sender_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        receiver_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        opener_message TEXT,
        status TEXT NOT NULL DEFAULT 'pending',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        responded_at TIMESTAMPTZ
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS conversations (
        id BIGSERIAL PRIMARY KEY,
        invite_id BIGINT UNIQUE REFERENCES message_invites(id) ON DELETE SET NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS conversation_members (
        conversation_id BIGINT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
        user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        PRIMARY KEY (conversation_id, user_id)
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS messages (
        id BIGSERIAL PRIMARY KEY,
        conversation_id BIGINT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
        sender_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        body TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;

    await sql`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS is_online BOOLEAN NOT NULL DEFAULT FALSE
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_message_invites_receiver_status
      ON message_invites (receiver_id, status, created_at DESC)
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_message_invites_sender_status
      ON message_invites (sender_id, status, created_at DESC)
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_messages_conversation_created
      ON messages (conversation_id, created_at ASC)
    `;
  });
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
