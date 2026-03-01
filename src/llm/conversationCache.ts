export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface CacheEntry {
  messages: ChatMessage[];
  lastActive: number;
}

const MAX_EXCHANGES = 3; // 3 user + 3 assistant = 6 messages
const TTL_MS = 5 * 60 * 1000; // 5 minutes
const CLEANUP_INTERVAL_MS = 60 * 1000; // 1 minute

const cache = new Map<string, CacheEntry>();

function cacheKey(guildId: string, userId: string): string {
  return `${guildId}:${userId}`;
}

export function getHistory(guildId: string, userId: string): ChatMessage[] {
  const entry = cache.get(cacheKey(guildId, userId));
  if (!entry) return [];
  if (Date.now() - entry.lastActive > TTL_MS) {
    cache.delete(cacheKey(guildId, userId));
    return [];
  }
  return entry.messages;
}

export function pushExchange(guildId: string, userId: string, userMsg: string, assistantMsg: string): void {
  const key = cacheKey(guildId, userId);
  const entry = cache.get(key) ?? { messages: [], lastActive: 0 };

  entry.messages.push(
    { role: "user", content: userMsg },
    { role: "assistant", content: assistantMsg },
  );

  // Keep only last N exchanges (2 messages per exchange)
  while (entry.messages.length > MAX_EXCHANGES * 2) {
    entry.messages.shift();
    entry.messages.shift();
  }

  entry.lastActive = Date.now();
  cache.set(key, entry);
}

// Cleanup expired entries
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of cache) {
    if (now - entry.lastActive > TTL_MS) {
      cache.delete(key);
    }
  }
}, CLEANUP_INTERVAL_MS);
