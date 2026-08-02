import {sha256Bytes} from "./Hash";

// Ciphertext format: base64 (AES-256-GCM ciphertext + 12 bytes IV)
export const IVByteLength = 12;

async function importAESKey(key: string): Promise<CryptoKey> {
  const digest = await sha256Bytes(key);
  return crypto.subtle.importKey("raw", digest, "AES-GCM", false, ["encrypt", "decrypt"]);
}

export async function encryptAES(
  plaintext: string,
  key: string,
  iv: Uint8Array<ArrayBuffer> = crypto.getRandomValues(new Uint8Array(IVByteLength)),
): Promise<string> {
  if (!plaintext) return "";

  const aesKey = await importAESKey(key);
  const encrypted = await crypto.subtle.encrypt(
    {name: "AES-GCM", iv},
    aesKey,
    new TextEncoder().encode(plaintext),
  );

  const payload = new Uint8Array(IVByteLength + encrypted.byteLength);
  payload.set(iv);
  payload.set(new Uint8Array(encrypted), IVByteLength);
  return payload.toBase64();
}

export async function decryptAES(ciphertext: string, key: string): Promise<string> {
  if (!ciphertext) return "";

  try {
    const aesKey = await importAESKey(key);
    const payload = Uint8Array.fromBase64(ciphertext);
    const iv = payload.subarray(0, IVByteLength);
    const encrypted = payload.subarray(IVByteLength);
    const decrypted = await crypto.subtle.decrypt({name: "AES-GCM", iv}, aesKey, encrypted);
    return new TextDecoder().decode(decrypted);
  } catch {
    throw new Error("Decryption failed");
  }
}
