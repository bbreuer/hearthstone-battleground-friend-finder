import { getDb, hasDatabase } from "@/lib/db";
import { getSession } from "@/lib/session";

function mapUser(row) {
  if (!row) {
    return null;
  }

  return {
    id: Number(row.id),
    battleNetId: row.battle_net_id,
    battletag: row.battletag,
    displayName: row.display_name,
    region: row.region,
    bgRank: row.bg_rank,
    favoriteHero: row.favorite_hero,
    lookingForGroup: row.looking_for_group,
    bio: row.bio,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export async function getCurrentUser() {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return null;
    }

    const db = await getDb();
    if (!db) {
      return null;
    }

    const [user] = await db`SELECT * FROM users WHERE id = ${session.userId}`;
    return mapUser(user);
  } catch {
    return null;
  }
}

export async function getCommunityMembers(limit = 6) {
  try {
    const db = await getDb();
    if (!db) {
      return [];
    }

    const rows = await db`
      SELECT * FROM users
      ORDER BY COALESCE(bg_rank, 0) DESC, updated_at DESC
      LIMIT ${limit}
    `;

    return rows.map(mapUser);
  } catch {
    return [];
  }
}

export async function getRecentPosts(limit = 12) {
  try {
    const db = await getDb();
    if (!db) {
      return [];
    }

    return db`
      SELECT
        posts.id,
        posts.caption,
        posts.placement,
        posts.mmr,
        posts.image_path,
        posts.created_at,
        users.display_name,
        users.battletag,
        users.favorite_hero,
        users.bg_rank
      FROM posts
      JOIN users ON users.id = posts.user_id
      ORDER BY posts.created_at DESC
      LIMIT ${limit}
    `;
  } catch {
    return [];
  }
}

export async function getRecentPostsByUser(userId, limit = 12) {
  try {
    const db = await getDb();
    if (!db) {
      return [];
    }

    return db`
      SELECT
        posts.id,
        posts.caption,
        posts.placement,
        posts.mmr,
        posts.image_path,
        posts.created_at,
        users.display_name,
        users.battletag,
        users.favorite_hero,
        users.bg_rank
      FROM posts
      JOIN users ON users.id = posts.user_id
      WHERE posts.user_id = ${userId}
      ORDER BY posts.created_at DESC
      LIMIT ${limit}
    `;
  } catch {
    return [];
  }
}

export async function upsertBattleNetUser({ externalId, battletag, region }) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database is not configured.");
  }

  const [user] = await db`
    INSERT INTO users (battle_net_id, battletag, display_name, region)
    VALUES (${externalId}, ${battletag || ""}, ${battletag || "New Battler"}, ${region})
    ON CONFLICT (battle_net_id)
    DO UPDATE SET
      battletag = EXCLUDED.battletag,
      region = EXCLUDED.region,
      updated_at = NOW()
    RETURNING id
  `;

  return Number(user.id);
}

export async function updateCurrentUserProfile(userId, profile) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database is not configured.");
  }

  await db`
    UPDATE users
    SET
      display_name = ${profile.displayName || null},
      bg_rank = ${profile.bgRank},
      favorite_hero = ${profile.favoriteHero || null},
      looking_for_group = ${profile.lookingForGroup || null},
      bio = ${profile.bio || null},
      updated_at = NOW()
    WHERE id = ${userId}
  `;
}

export async function createPostForUser(userId, post) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database is not configured.");
  }

  await db`
    INSERT INTO posts (user_id, caption, placement, mmr, image_path)
    VALUES (${userId}, ${post.caption || null}, ${post.placement}, ${post.mmr}, ${post.imagePath})
  `;
}

export function isStorageConfigured() {
  return hasDatabase() && Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}
