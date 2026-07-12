# DDNS Cloudflare CLI

A CLI tool for automatic DDNS management on Cloudflare.

## Usage

```bash
npx ddns-cloudflare-cli
```

or

```bash
npm install -g ddns-cloudflare-cli@latest
ddns-cloudflare
```

If no config exists at `~/.ddns-cloudflare/config.json`, the CLI will prompt for setup (Cloudflare credentials, DNS records, IP service URLs). Then it starts polling and updating DNS records every 10 seconds.
