#!/usr/bin/env node
import readline from "node:readline/promises";
import {setTimeout} from "node:timers/promises";
import {Temporal} from "@js-temporal/polyfill";
import {Config, DefaultIPv4URLs, DefaultIPv6URLs, loadConfig, saveConfig} from "../src/lib/ConfigService";
import {DDNS_Service} from "../src/lib/DDNS_Service";

async function prompt(rl: readline.Interface, question: string): Promise<string> {
  return (await rl.question(question)).trim();
}

async function interactiveConfig(): Promise<void> {
  const rl = readline.createInterface({input: process.stdin, output: process.stdout});
  const config = loadConfig();

  console.log("\nIP Service URLs:");
  console.log("  IPv4 options:");
  DefaultIPv4URLs.forEach((url, i) => console.log(`    ${i + 1}. ${url}`));
  const ipv4Choice = await prompt(rl, `IPv4 Query URL [${config.ipv4QueryUrl}]: `);
  if (ipv4Choice) config.ipv4QueryUrl = ipv4Choice;

  console.log("  IPv6 options:");
  DefaultIPv6URLs.forEach((url, i) => console.log(`    ${i + 1}. ${url}`));
  const ipv6Choice = await prompt(rl, `IPv6 Query URL [${config.ipv6QueryUrl}]: `);
  if (ipv6Choice) config.ipv6QueryUrl = ipv6Choice;

  const email = await prompt(rl, `Cloudflare Email [${config.cloudflareEmail}]: `);
  if (email) config.cloudflareEmail = email;

  const apiKey = await prompt(rl, `Cloudflare API Key [${config.cloudflareApiKey ? "****" : ""}]: `);
  if (apiKey) config.cloudflareApiKey = apiKey;

  const records = await prompt(rl, `DNS Record Names (comma-separated) [${config.dnsRecordNames.join(", ")}]: `);
  if (records) config.dnsRecordNames = records.split(",").map((s) => s.trim()).filter((s) => s !== "");

  rl.close();

  saveConfig(config);
  console.log("\nConfig saved.");
}

function timestamp(): string {
  return Temporal.Now.instant().toString();
}

async function poll(config: Config): Promise<void> {
  const ddnsService = new DDNS_Service(
    config.ipv4QueryUrl,
    config.ipv6QueryUrl,
    config.cloudflareEmail,
    config.cloudflareApiKey,
    config.dnsRecordNames,
  );

  let running = true;
  process.on("SIGINT", () => {
    console.log(`\n[${timestamp()}] Shutting down...`);
    running = false;
  });
  process.on("SIGTERM", () => {
    console.log(`\n[${timestamp()}] Shutting down...`);
    running = false;
  });

  while (running) {
    console.log(`[${timestamp()}] Checking DNS records...`);
    try {
      for await (const statuses of ddnsService.processUpdates()) {
        for (const {record, updated, error} of statuses) {
          const status = error ? `FAILED: ${error}` : updated ? "UPDATED" : "OK";
          console.log(`  ${record.name} (${record.type}): ${record.content} [${status}]`);
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`[${timestamp()}] Error: ${message}`);
    }

    for (let i = 0; i < 10; i++) {
      if (!running) break;
      await setTimeout(1000);
    }
  }
}

function isConfigEmpty(config: Config): boolean {
  return !config.cloudflareEmail || !config.cloudflareApiKey || config.dnsRecordNames.length === 0;
}

async function main(): Promise<void> {
  let config = loadConfig();

  while (isConfigEmpty(config)) {
    console.log("Config incomplete. Starting interactive setup...");
    await interactiveConfig();
    config = loadConfig();
  }

  console.log(`[${timestamp()}] Starting DDNS Cloudflare CLI`);
  console.log(`  IPv4 URL: ${config.ipv4QueryUrl}`);
  console.log(`  IPv6 URL: ${config.ipv6QueryUrl}`);
  console.log(`  Records: ${config.dnsRecordNames.join(", ")}`);
  console.log();

  await poll(config);
}

main();
