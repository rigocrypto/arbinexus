const LOCALHOST_ORIGINS = new Set(['http://localhost:3000', 'http://127.0.0.1:3000']);

const PRIVATE_NETWORK_ORIGIN =
  /^http:\/\/(192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[0-1])\.)\d+\.\d+:3000$/i;

function configuredOrigins(): Set<string> {
  const raw = process.env.ALLOWED_ORIGINS ?? '';
  return new Set(
    raw
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean)
  );
}

export function isAllowedOrigin(origin: string): boolean {
  if (LOCALHOST_ORIGINS.has(origin)) {
    return true;
  }

  if (PRIVATE_NETWORK_ORIGIN.test(origin)) {
    return true;
  }

  return configuredOrigins().has(origin);
}
