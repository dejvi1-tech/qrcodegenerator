export interface QRHistory {
  id: string;
  type: string;
  payload: string;
  settings: {
    size: number;
    margin: number;
    errorCorrection: string;
    foregroundColor: string;
    backgroundColor: string;
  };
  timestamp: number;
  preview?: string;
}

export interface QRTemplate {
  id: string;
  name: string;
  description: string;
  type: string;
  defaultData: Record<string, any>;
  settings: {
    size: number;
    margin: number;
    errorCorrection: string;
    foregroundColor: string;
    backgroundColor: string;
  };
}

const STORAGE_KEYS = {
  HISTORY: 'qr-history',
  TEMPLATES: 'qr-templates',
  SETTINGS: 'qr-settings',
} as const;

export function saveQRToHistory(qr: Omit<QRHistory, 'id' | 'timestamp'>): void {
  const history = getQRHistory();
  const newEntry: QRHistory = {
    ...qr,
    id: Math.random().toString(36).substr(2, 9),
    timestamp: Date.now(),
  };

  const updatedHistory = [newEntry, ...history.slice(0, 49)]; // Keep only last 50
  localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(updatedHistory));
}

export function getQRHistory(): QRHistory[] {
  try {
    const history = localStorage.getItem(STORAGE_KEYS.HISTORY);
    return history ? JSON.parse(history) : [];
  } catch {
    return [];
  }
}

export function deleteQRFromHistory(id: string): void {
  const history = getQRHistory();
  const updatedHistory = history.filter(item => item.id !== id);
  localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(updatedHistory));
}

export function clearQRHistory(): void {
  localStorage.removeItem(STORAGE_KEYS.HISTORY);
}

export function getQRTemplates(): QRTemplate[] {
  try {
    const templates = localStorage.getItem(STORAGE_KEYS.TEMPLATES);
    return templates ? JSON.parse(templates) : getDefaultTemplates();
  } catch {
    return getDefaultTemplates();
  }
}

export function saveQRTemplate(template: Omit<QRTemplate, 'id'>): void {
  const templates = getQRTemplates();
  const newTemplate: QRTemplate = {
    ...template,
    id: Math.random().toString(36).substr(2, 9),
  };

  const updatedTemplates = [...templates, newTemplate];
  localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(updatedTemplates));
}

export function deleteQRTemplate(id: string): void {
  const templates = getQRTemplates();
  const updatedTemplates = templates.filter(template => template.id !== id);
  localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(updatedTemplates));
}

function getDefaultTemplates(): QRTemplate[] {
  return [
    {
      id: 'business-card',
      name: 'Business Card',
      description: 'Professional vCard with company details',
      type: 'vcard',
      defaultData: {
        firstName: 'John',
        lastName: 'Doe',
        fullName: 'John Doe',
        organization: 'Company Inc.',
        title: 'Software Engineer',
        phone: '+1234567890',
        email: 'john@company.com',
        website: 'https://company.com',
      },
      settings: {
        size: 512,
        margin: 4,
        errorCorrection: 'M',
        foregroundColor: '#1f2937',
        backgroundColor: '#ffffff',
      },
    },
    {
      id: 'wifi-guest',
      name: 'Guest WiFi',
      description: 'Guest network access',
      type: 'wifi',
      defaultData: {
        ssid: 'Guest Network',
        password: '',
        encryption: 'nopass',
        hidden: false,
      },
      settings: {
        size: 256,
        margin: 4,
        errorCorrection: 'L',
        foregroundColor: '#059669',
        backgroundColor: '#ffffff',
      },
    },
    {
      id: 'website-link',
      name: 'Website Link',
      description: 'Company or personal website',
      type: 'url',
      defaultData: {
        url: 'https://example.com',
      },
      settings: {
        size: 320,
        margin: 4,
        errorCorrection: 'M',
        foregroundColor: '#2563eb',
        backgroundColor: '#ffffff',
      },
    },
    {
      id: 'contact-email',
      name: 'Contact Email',
      description: 'Pre-filled email with subject',
      type: 'email',
      defaultData: {
        to: 'contact@company.com',
        subject: 'Contact Request',
        body: 'Hello, I would like to get in touch...',
      },
      settings: {
        size: 320,
        margin: 4,
        errorCorrection: 'M',
        foregroundColor: '#dc2626',
        backgroundColor: '#ffffff',
      },
    },
  ];
}

export function exportQRHistory(): string {
  const history = getQRHistory();
  return JSON.stringify(history, null, 2);
}

export function importQRHistory(jsonData: string): boolean {
  try {
    const history = JSON.parse(jsonData);
    if (Array.isArray(history)) {
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
      return true;
    }
    return false;
  } catch {
    return false;
  }
}