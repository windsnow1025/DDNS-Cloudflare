const DefaultIPv4URLs = [
  "https://ipv4.icanhazip.com/",
  "https://ip.3322.net/",
];

const DefaultIPv6URLs = [
  "https://ipv6.icanhazip.com/",
  "https://speed.neu6.edu.cn/getIP.php",
];

interface Config {
  ipv4QueryUrl: string;
  ipv6QueryUrl: string;
  ipv4CustomOptions: string[];
  ipv6CustomOptions: string[];
  cloudflareEmail: string;
  cloudflareApiKeyEncrypted: string;
  dnsRecordNames: string[];
  autoStart: boolean;
}

const DefaultConfig: Config = {
  ipv4QueryUrl: DefaultIPv4URLs[0],
  ipv6QueryUrl: DefaultIPv6URLs[0],
  ipv4CustomOptions: [],
  ipv6CustomOptions: [],
  cloudflareEmail: "",
  cloudflareApiKeyEncrypted: "",
  dnsRecordNames: [],
  autoStart: false,
};

export type {Config};
export {DefaultIPv4URLs, DefaultIPv6URLs, DefaultConfig};
