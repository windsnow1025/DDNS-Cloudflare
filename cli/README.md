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

If the config at `~/.ddns-cloudflare/config.json` is missing or incomplete, the CLI will prompt for setup (Cloudflare credentials, DNS records, IP service URLs); the API key is stored encrypted with a passphrase set during setup. On each start, the CLI asks for the passphrase to unlock the API key, then starts polling and updating DNS records every 10 seconds.

`ddns-cloudflare --version` prints the version.
