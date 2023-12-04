export function isValidHttpURL(input: string) {
  try {
    new URL(input);
    return true;
  } catch (_) {
    return false;
  }
}

export function addHttpstoURL(input: string): string {
  if (!(input.startsWith("https://") || input.startsWith("http://"))) return "https://" + input;
  return input;
}
