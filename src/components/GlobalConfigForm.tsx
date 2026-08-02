import TextField from "@mui/material/TextField";

function GlobalConfigForm({cloudflareEmail, setCloudflareEmail, cloudflareApiKey, setCloudflareApiKey}: {
  cloudflareEmail: string;
  setCloudflareEmail: (value: string) => void;
  cloudflareApiKey: string;
  setCloudflareApiKey: (value: string) => void;
}) {
  return (
    <div className="flex-column gap-3">
      <TextField
        label="Cloudflare Email"
        value={cloudflareEmail}
        onChange={(e) => setCloudflareEmail(e.target.value)}
        size="small"
        fullWidth
      />
      <TextField
        label="Cloudflare API Key"
        type="password"
        value={cloudflareApiKey}
        onChange={(e) => setCloudflareApiKey(e.target.value)}
        size="small"
        fullWidth
      />
    </div>
  );
}

export default GlobalConfigForm;
