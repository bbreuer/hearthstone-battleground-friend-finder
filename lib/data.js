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
    isOnline: row.is_online,
    bgRank: row.bg_rank,
    favoriteHero: row.favorite_hero,
    lookingForGroup: row.looking_for_group,
    bio: row.bio,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapConversation(row) {
  if (!row) {
    return null;
  }

  return {
    id: Number(row.id),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    otherUserId: Number(row.other_user_id),
    otherDisplayName: row.other_display_name,
    otherBattletag: row.other_battletag,
    otherBgRank: row.other_bg_rank,
    lastMessage: row.last_message,
    lastMessageAt: row.last_message_at
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

export async function getPendingInviteCount(userId) {
  try {
    const db = await getDb();
    if (!db) {
      return 0;
    }

    const [result] = await db`
      SELECT COUNT(*)::int AS count
      FROM message_invites
      WHERE receiver_id = ${userId} AND status = 'pending'
    `;

    return Number(result?.count || 0);
  } catch {
    return 0;
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
      WHERE is_online = TRUE
      ORDER BY COALESCE(bg_rank, 0) DESC, updated_at DESC
      LIMIT ${limit}
    `;

    return rows.map(mapUser);
  } catch {
    return [];
  }
}

export async function getMemberMessagingState(userId, memberIds) {
  try {
    if (!memberIds.length) {
      return {};
    }

    const db = await getDb();
    if (!db) {
      return {};
    }

    const rows = await db`
      SELECT
        other_user_id,
        conversation_id,
        invite_direction,
        invite_status
      FROM (
        SELECT
          cm_other.user_id AS other_user_id,
          c.id AS conversation_id,
          NULL::TEXT AS invite_direction,
          'accepted'::TEXT AS invite_status,
          1 AS priority
        FROM conversations c
        JOIN conversation_members cm_self ON cm_self.conversation_id = c.id
        JOIN conversation_members cm_other ON cm_other.conversation_id = c.id
        WHERE cm_self.user_id = ${userId}
          AND cm_other.user_id != ${userId}
          AND cm_other.user_id = ANY(${memberIds})

        UNION ALL

        SELECT
          CASE
            WHEN mi.sender_id = ${userId} THEN mi.receiver_id
            ELSE mi.sender_id
          END AS other_user_id,
          NULL::BIGINT AS conversation_id,
          CASE
            WHEN mi.sender_id = ${userId} THEN 'outgoing'
            ELSE 'incoming'
          END AS invite_direction,
          mi.status AS invite_status,
          2 AS priority
        FROM message_invites mi
        WHERE (mi.sender_id = ${userId} OR mi.receiver_id = ${userId})
          AND mi.status = 'pending'
          AND (
            CASE
              WHEN mi.sender_id = ${userId} THEN mi.receiver_id
              ELSE mi.sender_id
            END
          ) = ANY(${memberIds})
      ) states
      ORDER BY other_user_id, priority
    `;

    const mapping = {};
    for (const row of rows) {
      const key = Number(row.other_user_id);
      if (!mapping[key]) {
        mapping[key] = {
          conversationId: row.conversation_id ? Number(row.conversation_id) : null,
          inviteDirection: row.invite_direction,
          inviteStatus: row.invite_status
        };
      }
    }

    return mapping;
  } catch {
    return {};
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

export async function getInboxData(userId) {
  try {
    const db = await getDb();
    if (!db) {
      return {
        receivedInvites: [],
        sentInvites: [],
        conversations: []
      };
    }

    const [receivedInvites, sentInvites, conversations] = await Promise.all([
      db`
        SELECT
          mi.id,
          mi.opener_message,
          mi.created_at,
          u.id AS other_user_id,
          u.display_name AS other_display_name,
          u.battletag AS other_battletag,
          u.bg_rank AS other_bg_rank
        FROM message_invites mi
        JOIN users u ON u.id = mi.sender_id
        WHERE mi.receiver_id = ${userId} AND mi.status = 'pending'
        ORDER BY mi.created_at DESC
      `,
      db`
        SELECT
          mi.id,
          mi.opener_message,
          mi.created_at,
          u.id AS other_user_id,
          u.display_name AS other_display_name,
          u.battletag AS other_battletag,
          u.bg_rank AS other_bg_rank
        FROM message_invites mi
        JOIN users u ON u.id = mi.receiver_id
        WHERE mi.sender_id = ${userId} AND mi.status = 'pending'
        ORDER BY mi.created_at DESC
      `,
      db`
        SELECT
          c.id,
          c.created_at,
          c.updated_at,
          u.id AS other_user_id,
          u.display_name AS other_display_name,
          u.battletag AS other_battletag,
          u.bg_rank AS other_bg_rank,
          m.body AS last_message,
          m.created_at AS last_message_at
        FROM conversations c
        JOIN conversation_members cm_self ON cm_self.conversation_id = c.id
        JOIN conversation_members cm_other ON cm_other.conversation_id = c.id
        JOIN users u ON u.id = cm_other.user_id
        LEFT JOIN LATERAL (
          SELECT body, created_at
          FROM messages
          WHERE conversation_id = c.id
          ORDER BY created_at DESC
          LIMIT 1
        ) m ON TRUE
        WHERE cm_self.user_id = ${userId}
          AND cm_other.user_id != ${userId}
        ORDER BY COALESCE(m.created_at, c.updated_at) DESC
      `
    ]);

    return {
      receivedInvites: receivedInvites.map((row) => ({
        id: Number(row.id),
        openerMessage: row.opener_message,
        createdAt: row.created_at,
        otherUserId: Number(row.other_user_id),
        otherDisplayName: row.other_display_name,
        otherBattletag: row.other_battletag,
        otherBgRank: row.other_bg_rank
      })),
      sentInvites: sentInvites.map((row) => ({
        id: Number(row.id),
        openerMessage: row.opener_message,
        createdAt: row.created_at,
        otherUserId: Number(row.other_user_id),
        otherDisplayName: row.other_display_name,
        otherBattletag: row.other_battletag,
        otherBgRank: row.other_bg_rank
      })),
      conversations: conversations.map(mapConversation)
    };
  } catch {
    return {
      receivedInvites: [],
      sentInvites: [],
      conversations: []
    };
  }
}

export async function createMessageInvite(senderId, receiverId, openerMessage) {
  if (senderId === receiverId) {
    throw new Error("You cannot invite yourself.");
  }

  const db = await getDb();
  if (!db) {
    throw new Error("Database is not configured.");
  }

  await db.begin(async (sql) => {
    const [existingConversation] = await sql`
      SELECT c.id
      FROM conversations c
      JOIN conversation_members cm1 ON cm1.conversation_id = c.id AND cm1.user_id = ${senderId}
      JOIN conversation_members cm2 ON cm2.conversation_id = c.id AND cm2.user_id = ${receiverId}
      LIMIT 1
    `;

    if (existingConversation) {
      throw new Error("Conversation already exists.");
    }

    const [existingInvite] = await sql`
      SELECT id
      FROM message_invites
      WHERE status = 'pending'
        AND (
          (sender_id = ${senderId} AND receiver_id = ${receiverId})
          OR
          (sender_id = ${receiverId} AND receiver_id = ${senderId})
        )
      LIMIT 1
    `;

    if (existingInvite) {
      throw new Error("A pending invite already exists.");
    }

    await sql`
      INSERT INTO message_invites (sender_id, receiver_id, opener_message)
      VALUES (${senderId}, ${receiverId}, ${openerMessage || null})
    `;
  });
}

export async function respondToMessageInvite(userId, inviteId, response) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database is not configured.");
  }

  if (!["accepted", "declined"].includes(response)) {
    throw new Error("Invalid invite response.");
  }

  return db.begin(async (sql) => {
    const [invite] = await sql`
      SELECT *
      FROM message_invites
      WHERE id = ${inviteId} AND receiver_id = ${userId}
      FOR UPDATE
    `;

    if (!invite || invite.status !== "pending") {
      throw new Error("Invite is no longer available.");
    }

    await sql`
      UPDATE message_invites
      SET status = ${response}, responded_at = NOW()
      WHERE id = ${inviteId}
    `;

    if (response === "declined") {
      return null;
    }

    const [conversation] = await sql`
      INSERT INTO conversations (invite_id, updated_at)
      VALUES (${inviteId}, NOW())
      RETURNING id
    `;

    await sql`
      INSERT INTO conversation_members (conversation_id, user_id)
      VALUES (${conversation.id}, ${invite.sender_id}), (${conversation.id}, ${invite.receiver_id})
    `;

    if (invite.opener_message) {
      await sql`
        INSERT INTO messages (conversation_id, sender_id, body)
        VALUES (${conversation.id}, ${invite.sender_id}, ${invite.opener_message})
      `;
    }

    return Number(conversation.id);
  });
}

export async function getConversationForUser(conversationId, userId) {
  try {
    const db = await getDb();
    if (!db) {
      return null;
    }

    const [membership] = await db`
      SELECT 1
      FROM conversation_members
      WHERE conversation_id = ${conversationId} AND user_id = ${userId}
      LIMIT 1
    `;

    if (!membership) {
      return null;
    }

    const [conversationRow] = await db`
      SELECT
        c.id,
        c.created_at,
        c.updated_at,
        u.id AS other_user_id,
        u.display_name AS other_display_name,
        u.battletag AS other_battletag,
        u.bg_rank AS other_bg_rank
      FROM conversations c
      JOIN conversation_members cm_self ON cm_self.conversation_id = c.id
      JOIN conversation_members cm_other ON cm_other.conversation_id = c.id
      JOIN users u ON u.id = cm_other.user_id
      WHERE c.id = ${conversationId}
        AND cm_self.user_id = ${userId}
        AND cm_other.user_id != ${userId}
      LIMIT 1
    `;

    if (!conversationRow) {
      return null;
    }

    const messages = await db`
      SELECT
        m.id,
        m.body,
        m.created_at,
        u.id AS sender_id,
        u.display_name AS sender_display_name,
        u.battletag AS sender_battletag
      FROM messages m
      JOIN users u ON u.id = m.sender_id
      WHERE m.conversation_id = ${conversationId}
      ORDER BY m.created_at ASC
    `;

    return {
      id: Number(conversationRow.id),
      otherUserId: Number(conversationRow.other_user_id),
      otherDisplayName: conversationRow.other_display_name,
      otherBattletag: conversationRow.other_battletag,
      otherBgRank: conversationRow.other_bg_rank,
      createdAt: conversationRow.created_at,
      messages: messages.map((row) => ({
        id: Number(row.id),
        body: row.body,
        createdAt: row.created_at,
        senderId: Number(row.sender_id),
        senderDisplayName: row.sender_display_name,
        senderBattletag: row.sender_battletag
      }))
    };
  } catch {
    return null;
  }
}

export async function addMessageToConversation(conversationId, userId, body) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database is not configured.");
  }

  const trimmedBody = String(body || "").trim().slice(0, 1000);
  if (!trimmedBody) {
    throw new Error("Message cannot be empty.");
  }

  const [membership] = await db`
    SELECT 1
    FROM conversation_members
    WHERE conversation_id = ${conversationId} AND user_id = ${userId}
    LIMIT 1
  `;

  if (!membership) {
    throw new Error("Conversation not found.");
  }

  await db.begin(async (sql) => {
    await sql`
      INSERT INTO messages (conversation_id, sender_id, body)
      VALUES (${conversationId}, ${userId}, ${trimmedBody})
    `;

    await sql`
      UPDATE conversations
      SET updated_at = NOW()
      WHERE id = ${conversationId}
    `;
  });
}

export async function upsertBattleNetUser({ externalId, battletag, region }) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database is not configured.");
  }

  const [user] = await db`
    INSERT INTO users (battle_net_id, battletag, display_name, region, is_online)
    VALUES (${externalId}, ${battletag || ""}, ${battletag || "New Battler"}, ${region}, TRUE)
    ON CONFLICT (battle_net_id)
    DO UPDATE SET
      battletag = EXCLUDED.battletag,
      region = EXCLUDED.region,
      is_online = TRUE,
      updated_at = NOW()
    RETURNING id
  `;

  return Number(user.id);
}

export async function setUserOnlineStatus(userId, isOnline) {
  const db = await getDb();
  if (!db) {
    return;
  }

  await db`
    UPDATE users
    SET
      is_online = ${isOnline},
      updated_at = NOW()
    WHERE id = ${userId}
  `;
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

export async function deletePostForUser(userId, postId) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database is not configured.");
  }

  const [post] = await db`
    DELETE FROM posts
    WHERE id = ${postId} AND user_id = ${userId}
    RETURNING image_path
  `;

  return post ? post.image_path : null;
}

export function isStorageConfigured() {
  return hasDatabase() && Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}
