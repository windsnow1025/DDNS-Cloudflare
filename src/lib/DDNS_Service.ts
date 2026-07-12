import Cloudflare from 'cloudflare';

type DNSRecord = Cloudflare.DNS.Records.RecordResponse.ARecord | Cloudflare.DNS.Records.RecordResponse.AAAARecord;

interface RecordStatus {
  record: DNSRecord;
  updated: boolean;
}

export type {RecordStatus};

export class DDNS_Service {
  private readonly ipv4QueryUrl: string;
  private readonly ipv6QueryUrl: string;
  private cloudflare: Cloudflare;
  private readonly dnsRecordNames: string[];
  private zoneId: string;

  constructor(
    ipv4QueryUrl: string,
    ipv6QueryUrl: string,
    cloudflareEmail: string,
    cloudflareApiKey: string,
    dnsRecordNames: string[]
  ) {
    this.cloudflare = new Cloudflare({
      apiEmail: cloudflareEmail,
      apiKey: cloudflareApiKey,
    });
    this.ipv4QueryUrl = ipv4QueryUrl;
    this.ipv6QueryUrl = ipv6QueryUrl;
    this.dnsRecordNames = dnsRecordNames;
    this.zoneId = '';
  }

  async* processUpdates(): AsyncGenerator<RecordStatus[]> {
    if (this.zoneId === '') {
      await this.getZoneId();
    }
    for (const dnsRecordName of this.dnsRecordNames) {
      yield await this.processUpdate(dnsRecordName);
    }
  }

  private async processUpdate(dnsRecordName: string): Promise<RecordStatus[]> {
    const dnsRecords = await this.getDNSRecords(dnsRecordName);
    const results: RecordStatus[] = [];

    for (const dnsRecord of dnsRecords) {
      let ip: string;
      try {
        ip = await this.fetchCurrentIp(dnsRecord.type);
      } catch {
        const ipType = dnsRecord.type === "A" ? "IPv4" : "IPv6";
        throw new Error(`Failed to fetch current ${ipType}`);
      }

      if (ip !== dnsRecord.content) {
        results.push({record: await this.updateDNSRecord(dnsRecord, ip), updated: true});
      } else {
        results.push({record: dnsRecord, updated: false});
      }
    }

    return results;
  }

  private async getZoneId(): Promise<void> {
    const response = await this.cloudflare.zones.list();
    const zones = response.result;
    const zoneName = this.dnsRecordNames[0].split('.').slice(-2).join('.');
    const zone = zones.find(
      (zone) => zone.name === zoneName
    );
    this.zoneId = zone!.id;
  }

  private async getDNSRecords(
    dnsRecordName: string
  ): Promise<DNSRecord[]> {
    const records: Cloudflare.DNS.Records.Record[] = [];
    for await (const record of this.cloudflare.dns.records.list({zone_id: this.zoneId})) {
      records.push(record);
    }
    return records.filter(
      (record): record is DNSRecord =>
        record.name === dnsRecordName && (record.type === 'A' || record.type === 'AAAA')
    );
  }

  private async updateDNSRecord(
    dnsRecord: DNSRecord,
    ip: string
  ): Promise<DNSRecord> {
    return this.cloudflare.dns.records.update(
      dnsRecord.id,
      {
        zone_id: this.zoneId,
        content: ip,
        name: dnsRecord.name,
        type: dnsRecord.type,
        ttl: dnsRecord.ttl,
      }
    ) as Promise<DNSRecord>;
  }

  private async fetchCurrentIp(type: string): Promise<string> {
    let queryUrl = '';
    if (type === 'A') {
      queryUrl = this.ipv4QueryUrl;
    } else if (type === 'AAAA') {
      queryUrl = this.ipv6QueryUrl;
    }
    const response = await fetch(queryUrl);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} for ${queryUrl}`);
    }
    const ip = await response.text();
    return ip.trim();
  }
}
