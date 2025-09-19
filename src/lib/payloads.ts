export interface WiFiData {
  ssid: string;
  password: string;
  encryption: 'WEP' | 'WPA' | 'WPA2' | 'nopass';
  hidden: boolean;
}

export interface VCardData {
  firstName: string;
  lastName: string;
  fullName: string;
  organization: string;
  title: string;
  phone: string;
  email: string;
  website: string;
}

export interface EmailData {
  to: string;
  subject: string;
  body: string;
}

export interface SMSData {
  number: string;
  message: string;
}

export function buildURLPayload(url: string): string {
  if (!url.trim()) {
    throw new Error('URL cannot be empty');
  }

  const trimmedUrl = url.trim();

  if (!trimmedUrl.match(/^https?:\/\//)) {
    return `http://${trimmedUrl}`;
  }

  return trimmedUrl;
}

export function buildWiFiPayload(data: WiFiData): string {
  if (!data.ssid.trim()) {
    throw new Error('SSID cannot be empty');
  }

  const encryption = data.encryption === 'nopass' ? '' : data.encryption;
  const password = data.encryption === 'nopass' ? '' : data.password;
  const hidden = data.hidden ? 'true' : 'false';

  return `WIFI:T:${encryption};S:${data.ssid};P:${password};H:${hidden};;`;
}

export function buildVCardPayload(data: VCardData): string {
  if (!data.fullName.trim()) {
    throw new Error('Full name cannot be empty');
  }

  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `N:${data.lastName};${data.firstName};;;`,
    `FN:${data.fullName}`,
  ];

  if (data.organization.trim()) {
    lines.push(`ORG:${data.organization}`);
  }

  if (data.title.trim()) {
    lines.push(`TITLE:${data.title}`);
  }

  if (data.phone.trim()) {
    lines.push(`TEL;TYPE=CELL:${data.phone}`);
  }

  if (data.email.trim()) {
    lines.push(`EMAIL;TYPE=INTERNET:${data.email}`);
  }

  if (data.website.trim()) {
    const website = data.website.startsWith('http') ? data.website : `http://${data.website}`;
    lines.push(`URL:${website}`);
  }

  lines.push('END:VCARD');

  return lines.join('\n');
}

export function buildEmailPayload(data: EmailData): string {
  if (!data.to.trim()) {
    throw new Error('Email address cannot be empty');
  }

  let url = `mailto:${data.to}`;
  const params = new URLSearchParams();

  if (data.subject.trim()) {
    params.append('subject', data.subject);
  }

  if (data.body.trim()) {
    params.append('body', data.body);
  }

  const paramString = params.toString();
  if (paramString) {
    url += `?${paramString}`;
  }

  return url;
}

export function buildSMSPayload(data: SMSData): string {
  if (!data.number.trim()) {
    throw new Error('Phone number cannot be empty');
  }

  return `SMSTO:${data.number}:${data.message}`;
}

export function buildTextPayload(text: string): string {
  if (!text.trim()) {
    throw new Error('Text cannot be empty');
  }

  return text;
}