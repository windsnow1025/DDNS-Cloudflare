import {decryptAES, encryptAES, IVByteLength} from "./EncryptionService";
import {describe, expect, it} from "vitest";

const ZeroIVCiphertext = "AAAAAAAAAAAAAAAAtgS/Bkr30XAXPzpGsIlzewrvJIvP7P/0+8Hu";

describe("encryptAES / decryptAES", () => {
  it("should round-trip", async () => {
    const ciphertext = await encryptAES("Hello World", "1234567890");
    expect(await decryptAES(ciphertext, "1234567890")).toStrictEqual("Hello World");
  });

  it("should produce a different ciphertext each time", async () => {
    const first = await encryptAES("Hello World", "1234567890");
    const second = await encryptAES("Hello World", "1234567890");
    expect(first).not.toStrictEqual(second);
  });

  it("should encrypt to the pinned ciphertext with a fixed IV", async () => {
    const ciphertext = await encryptAES("Hello World", "1234567890", new Uint8Array(IVByteLength));
    expect(ciphertext).toStrictEqual(ZeroIVCiphertext);
  });

  it("should decrypt the pinned ciphertext", async () => {
    expect(await decryptAES(ZeroIVCiphertext, "1234567890")).toStrictEqual("Hello World");
  });

  it("should throw on a wrong key", async () => {
    const ciphertext = await encryptAES("Hello World", "1234567890");
    await expect(decryptAES(ciphertext, "1")).rejects.toThrow("Decryption failed");
  });
});
