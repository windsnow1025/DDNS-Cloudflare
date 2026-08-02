import {useEffect, useState} from "react";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Container from "@mui/material/Container";
import Snackbar from "@mui/material/Snackbar";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import {Temporal} from "@js-temporal/polyfill";
import AutoStartSwitch from "./components/AutoStartSwitch";
import DNSRecordForm from "./components/DNSRecordForm";
import GlobalConfigForm from "./components/GlobalConfigForm";
import IPQueryURLSelect from "./components/IPQueryURLSelect";
import {PassphraseDialogMode} from "./components/PassphraseDialogMode";
import SetPassphraseDialog from "./components/SetPassphraseDialog";
import ThemeSwitch from "./components/ThemeSwitch";
import UnlockPassphraseDialog from "./components/UnlockPassphraseDialog";
import {DefaultIPv4URLs, DefaultIPv6URLs, DefaultConfig} from "./lib/Config";
import {DDNS_Service, RecordStatus} from "./lib/DDNS_Service";
import {decryptAES, encryptAES} from "./lib/EncryptionService";

function SectionCard({title, children}: {title: string; children: React.ReactNode}) {
  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="subtitle2" color="text.secondary" sx={{mb: 1.5}}>
          {title}
        </Typography>
        {children}
      </CardContent>
    </Card>
  );
}

function App() {
  const [loaded, setLoaded] = useState(false);

  // Config
  const [ipv4QueryUrl, setIpv4QueryUrl] = useState(DefaultConfig.ipv4QueryUrl);
  const [ipv6QueryUrl, setIpv6QueryUrl] = useState(DefaultConfig.ipv6QueryUrl);
  const [ipv4CustomOptions, setIpv4CustomOptions] = useState(DefaultConfig.ipv4CustomOptions);
  const [ipv6CustomOptions, setIpv6CustomOptions] = useState(DefaultConfig.ipv6CustomOptions);
  const [cloudflareEmail, setCloudflareEmail] = useState(DefaultConfig.cloudflareEmail);
  const [cloudflareApiKeyEncrypted, setCloudflareApiKeyEncrypted] = useState(DefaultConfig.cloudflareApiKeyEncrypted);
  const [dnsRecordNames, setDnsRecordNames] = useState(DefaultConfig.dnsRecordNames);
  const [autoStart, setAutoStart] = useState(DefaultConfig.autoStart);

  const [cloudflareApiKey, setCloudflareApiKey] = useState("");
  const [passphrase, setPassphrase] = useState("");

  const [passphraseDialogMode, setPassphraseDialogMode] = useState(PassphraseDialogMode.Setup);
  const [passphraseDialogOpen, setPassphraseDialogOpen] = useState(true);
  const [passphraseDialogMounted, setPassphraseDialogMounted] = useState(true);

  const [isUpdating, setIsUpdating] = useState(false);

  const openPassphraseDialog = () => {
    setPassphraseDialogMode(PassphraseDialogMode.Setup);
    setPassphraseDialogMounted(true);
    setPassphraseDialogOpen(true);
  };

  useEffect(() => {
    window.configAPI.loadConfig().then((config) => {
      setIpv4QueryUrl(config.ipv4QueryUrl);
      setIpv6QueryUrl(config.ipv6QueryUrl);
      setIpv4CustomOptions(config.ipv4CustomOptions);
      setIpv6CustomOptions(config.ipv6CustomOptions);
      setCloudflareEmail(config.cloudflareEmail);
      setCloudflareApiKeyEncrypted(config.cloudflareApiKeyEncrypted);
      setDnsRecordNames(config.dnsRecordNames);
      setAutoStart(config.autoStart);
      if (config.cloudflareApiKeyEncrypted) {
        setPassphraseDialogMode(PassphraseDialogMode.Unlock);
      }
      setLoaded(true);
    });
  }, []);
  const [statusEntries, setStatusEntries] = useState<RecordStatus[]>([]);
  const [hasError, setHasError] = useState(false);
  const [lastCheckTime, setLastCheckTime] = useState<Temporal.ZonedDateTime | null>(null);
  const [countdown, setCountdown] = useState(0);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const currentConfig = {
    ipv4QueryUrl,
    ipv6QueryUrl,
    ipv4CustomOptions,
    ipv6CustomOptions,
    cloudflareEmail,
    cloudflareApiKeyEncrypted,
    dnsRecordNames,
    autoStart,
  };

  const handleUnlock = async (enteredPassphrase: string) => {
    let apiKey: string;
    try {
      apiKey = await decryptAES(cloudflareApiKeyEncrypted, enteredPassphrase);
    } catch {
      return "Passphrase is incorrect";
    }
    setCloudflareApiKey(apiKey);
    setPassphrase(enteredPassphrase);
    setIsUpdating(autoStart);
    return null;
  };

  const updateLoop = async (cancelFlag: {current: boolean}) => {
    const ddnsService = new DDNS_Service(
      ipv4QueryUrl,
      ipv6QueryUrl,
      cloudflareEmail,
      cloudflareApiKey,
      dnsRecordNames,
    );
    while (!cancelFlag.current) {
      try {
        const entries: RecordStatus[] = [];
        for await (const statuses of ddnsService.processUpdates()) {
          entries.push(...statuses);
        }
        setStatusEntries(entries);
        setHasError(false);
        setLastCheckTime(Temporal.Now.zonedDateTimeISO());
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        setStatusEntries([]);
        setHasError(true);
        setLastCheckTime(Temporal.Now.zonedDateTimeISO());
        setAlertMessage(message);
        setAlertOpen(true);
      }
      setCountdown(10);
      for (let i = 9; i >= 0; i--) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        if (cancelFlag.current) return;
        setCountdown(i);
      }
    }
  };

  useEffect(() => {
    if (!loaded) return;
    void (async () => {
      const encrypted = cloudflareApiKey
        ? await encryptAES(cloudflareApiKey, passphrase)
        : cloudflareApiKeyEncrypted;
      setCloudflareApiKeyEncrypted(encrypted);
      await window.configAPI.saveConfig({...currentConfig, cloudflareApiKeyEncrypted: encrypted});
    })();
  }, [ipv4QueryUrl, ipv6QueryUrl, JSON.stringify(ipv4CustomOptions), JSON.stringify(ipv6CustomOptions), cloudflareEmail, cloudflareApiKey, passphrase, JSON.stringify(dnsRecordNames), autoStart]);

  useEffect(() => {
    if (!isUpdating) {
      setStatusEntries([]);
      setHasError(false);
      return;
    }
    const cancelFlag = {current: false};
    updateLoop(cancelFlag);
    return () => {
      cancelFlag.current = true;
    };
  }, [isUpdating, ipv4QueryUrl, ipv6QueryUrl, cloudflareEmail, cloudflareApiKey, JSON.stringify(dnsRecordNames)]);

  const handleToggleUpdate = () => {
    setIsUpdating(!isUpdating);
  };

  if (!loaded) return null;

  return (
    <Container maxWidth="md">
      <div className="flex-column gap-3 py-6">
        <div className="flex-between-nowrap">
          <Typography variant="h4" component="h1" sx={{fontWeight: 700}}>
            DDNS Cloudflare
          </Typography>
          <div className="flex-normal gap-1">
            <AutoStartSwitch
              autoStart={autoStart}
              setAutoStart={setAutoStart}
            />
            <Button
              variant="contained"
              color={isUpdating ? "error" : "primary"}
              onClick={handleToggleUpdate}
            >
              {isUpdating ? "Stop" : "Start"}
            </Button>
            <ThemeSwitch/>
          </div>
        </div>

        <SectionCard title="IP Service">
          <div className="flex-column gap-3">
            <IPQueryURLSelect
              label="IPv4 Query URL"
              defaultURLs={DefaultIPv4URLs}
              customOptions={ipv4CustomOptions}
              onCustomOptionsChange={setIpv4CustomOptions}
              value={ipv4QueryUrl}
              onChange={setIpv4QueryUrl}
            />
            <IPQueryURLSelect
              label="IPv6 Query URL"
              defaultURLs={DefaultIPv6URLs}
              customOptions={ipv6CustomOptions}
              onCustomOptionsChange={setIpv6CustomOptions}
              value={ipv6QueryUrl}
              onChange={setIpv6QueryUrl}
            />
          </div>
        </SectionCard>

        <SectionCard title="Cloudflare Credentials">
          <GlobalConfigForm
            cloudflareEmail={cloudflareEmail}
            setCloudflareEmail={setCloudflareEmail}
            cloudflareApiKey={cloudflareApiKey}
            setCloudflareApiKey={setCloudflareApiKey}
          />
          <div className="mt-3">
            <Button
              variant="outlined"
              size="small"
              disabled={!cloudflareApiKey}
              onClick={openPassphraseDialog}
            >
              Change Passphrase
            </Button>
          </div>
        </SectionCard>

        {passphraseDialogMounted && passphraseDialogMode === PassphraseDialogMode.Setup && (
          <SetPassphraseDialog
            open={passphraseDialogOpen}
            onClose={() => setPassphraseDialogOpen(false)}
            onExited={() => setPassphraseDialogMounted(false)}
            setPassphrase={setPassphrase}
          />
        )}
        {passphraseDialogMounted && passphraseDialogMode === PassphraseDialogMode.Unlock && (
          <UnlockPassphraseDialog
            open={passphraseDialogOpen}
            onClose={() => setPassphraseDialogOpen(false)}
            onExited={() => setPassphraseDialogMounted(false)}
            unlock={handleUnlock}
            reset={() => setPassphraseDialogMode(PassphraseDialogMode.Setup)}
          />
        )}

        <SectionCard title="DNS Records">
          <DNSRecordForm
            dnsRecordNames={dnsRecordNames}
            setDnsRecordNames={setDnsRecordNames}
          />
        </SectionCard>

        {(isUpdating || statusEntries.length > 0 || hasError) && (
          <Card variant="outlined">
            <CardContent>
              <div className="flex-between-nowrap mb-2">
                <div className="flex-normal gap-1">
                  <Typography variant="subtitle2" color="text.secondary">
                    Status
                  </Typography>
                  <Chip
                    label={isUpdating ? (hasError ? "Error" : "Running") : "Stopped"}
                    color={isUpdating ? (hasError ? "error" : "success") : "default"}
                    size="small"
                  />
                </div>
                {lastCheckTime && (
                  <Typography variant="caption" color="text.secondary">
                    Last check: {lastCheckTime.toPlainTime().toLocaleString()}
                    {isUpdating && ` · Next in ${countdown}s`}
                  </Typography>
                )}
              </div>
              {hasError && (
                <Alert severity="error" variant="outlined">
                  {alertMessage}
                </Alert>
              )}
              {statusEntries.length > 0 && (
                <Table size="small">
                  <TableBody>
                    {statusEntries.map((s) => (
                      <TableRow key={`${s.record.name}-${s.record.type}`}>
                        <TableCell>{s.record.name}</TableCell>
                        <TableCell>{s.record.type}</TableCell>
                        <TableCell>{s.record.content}</TableCell>
                        <TableCell>
                          <Chip
                            label={s.error ? "failed" : s.updated ? "updated" : "up to date"}
                            color={s.error ? "error" : s.updated ? "primary" : "default"}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        )}
      </div>
      <Snackbar
        open={alertOpen}
        autoHideDuration={6000}
        onClose={() => setAlertOpen(false)}
        message={alertMessage}
      />
    </Container>
  );
}

export default App;
