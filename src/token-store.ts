import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { homedir } from "os";
import { join } from "path";

export interface TokenData {
  access_token: string;
  refresh_token?: string;
  token_type?: string;
  expires_at?: number; // epoch ms
  scope?: string;
}

function storePath(): string {
  const dir = join(homedir(), ".teamviewer-mcp");
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true, mode: 0o700 });
  return join(dir, "tokens.json");
}

export function loadTokens(): TokenData | null {
  const path = storePath();
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(readFileSync(path, "utf-8")) as TokenData;
  } catch {
    return null;
  }
}

export function saveTokens(data: TokenData): void {
  writeFileSync(storePath(), JSON.stringify(data, null, 2), { mode: 0o600 });
}

export function clearTokens(): void {
  const path = storePath();
  if (existsSync(path)) writeFileSync(path, "", { mode: 0o600 });
}

export function isExpired(data: TokenData): boolean {
  if (!data.expires_at) return false;
  // 60-second buffer
  return Date.now() >= data.expires_at - 60_000;
}
