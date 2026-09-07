import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const derive = promisify(scrypt);
export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const key = (await derive(password, salt, 64)) as Buffer;
  return `${salt}:${key.toString("hex")}`;
}
export async function verifyPassword(password: string, hash: string) {
  const [salt, stored] = hash.split(":");
  if (
    !/^[a-f0-9]{32}$/.test(salt ?? "") ||
    !/^[a-f0-9]{128}$/.test(stored ?? "")
  )
    return false;
  const key = (await derive(password, salt, 64)) as Buffer;
  return timingSafeEqual(Buffer.from(stored, "hex"), key);
}
