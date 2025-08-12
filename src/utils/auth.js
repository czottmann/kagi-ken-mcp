import { readFileSync } from "fs";
import { join } from "path";
import { homedir } from "os";

/**
 * Read token from the default file location
 * @returns {string|null} Token string or null if file doesn't exist
 */
export function readTokenFromFile() {
  try {
    const tokenPath = join(homedir(), ".kagi_session_token");
    const token = readFileSync(tokenPath, "utf8").trim();
    return token || null;
  } catch (error) {
    if (error.code === "ENOENT") {
      return null;
    }
    throw new Error(`Failed to read token file: ${error.message}`);
  }
}

/**
 * Resolve token from multiple sources in priority order:
 * 1. Environment variable KAGI_SESSION_TOKEN
 * 2. Token file ~/.kagi_session_token
 *
 * @returns {string} The resolved token
 * @throws {Error} If no token is found or invalid
 */
export function resolveToken() {
  // First try environment variable (for compatibility)
  const envToken = process.env.KAGI_SESSION_TOKEN;
  if (envToken && isValidTokenFormat(envToken)) {
    return envToken.trim();
  }

  // Then try file
  const fileToken = readTokenFromFile();
  if (fileToken && isValidTokenFormat(fileToken)) {
    return fileToken;
  }

  throw new Error(
    "No valid Kagi session token found. Please either:\n" +
      "1. Set KAGI_SESSION_TOKEN environment variable, or\n" +
      "2. Save your token to ~/.kagi_session_token file\n\n" +
      "Get your token from: https://kagi.com/settings?p=api",
  );
}

/**
 * Validate token format
 * @param {string} token - Token to validate
 * @returns {boolean} True if token format is valid
 */
export function isValidTokenFormat(token) {
  return typeof token === "string" && token.trim().length > 0;
}
