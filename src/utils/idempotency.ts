const recent = new Map<string, { key: string; createdAt: number }>();
export function idempotencyKey(scope: string, payload: unknown) {
  const signature = `${scope}:${JSON.stringify(payload ?? {})}`;
  const current = recent.get(signature);
  if (current && Date.now() - current.createdAt < 60_000) return current.key;
  const key = `${scope}:${crypto.randomUUID()}`;
  recent.set(signature, { key, createdAt: Date.now() });
  if (recent.size > 100) for (const [entry, value] of recent) if (Date.now() - value.createdAt > 60_000) recent.delete(entry);
  return key;
}
