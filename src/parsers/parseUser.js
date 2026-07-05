// parsea la salida de "whoami", que normalmente es una sola linea

export function parseUser(rawText) {
  if (!rawText || !rawText.trim()) {
    return { username: "" };
  }

  const username = rawText.trim().split("\n")[0].trim();
  return { username };
}
