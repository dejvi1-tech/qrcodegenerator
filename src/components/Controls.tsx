import { useState } from 'react';
import { Select } from './Select';
import { NumberInput } from './NumberInput';
import { ColorInput } from './ColorInput';
import { Toggle } from './Toggle';
import { FileDrop } from './FileDrop';
import {
  buildURLPayload,
  buildWiFiPayload,
  buildVCardPayload,
  buildEmailPayload,
  buildSMSPayload,
  buildTextPayload,
  WiFiData,
  VCardData,
  EmailData,
  SMSData,
} from '../lib/payloads';

export interface QRSettings {
  type: 'text' | 'url' | 'wifi' | 'vcard' | 'email' | 'sms';
  size: number;
  margin: number;
  errorCorrection: 'L' | 'M' | 'Q' | 'H';
  foregroundColor: string;
  backgroundColor: string;
  useLocalGenerator: boolean;
  logoFile: File | null;
}

interface ControlsProps {
  settings: QRSettings;
  onSettingsChange: (settings: QRSettings) => void;
  onGenerate: (payload: string) => void;
  isGenerating: boolean;
}

export function Controls({ settings, onSettingsChange, onGenerate, isGenerating }: ControlsProps) {
  const [textData, setTextData] = useState('');
  const [urlData, setUrlData] = useState('');
  const [wifiData, setWifiData] = useState<WiFiData>({
    ssid: '',
    password: '',
    encryption: 'WPA2',
    hidden: false,
  });
  const [vcardData, setVCardData] = useState<VCardData>({
    firstName: '',
    lastName: '',
    fullName: '',
    organization: '',
    title: '',
    phone: '',
    email: '',
    website: '',
  });
  const [emailData, setEmailData] = useState<EmailData>({
    to: '',
    subject: '',
    body: '',
  });
  const [smsData, setSmsData] = useState<SMSData>({
    number: '',
    message: '',
  });

  const [validationError, setValidationError] = useState<string>('');


  const validateAndGetPayload = (): string | null => {
    try {
      setValidationError('');

      switch (settings.type) {
        case 'text':
          return buildTextPayload(textData);
        case 'url':
          return buildURLPayload(urlData);
        case 'wifi':
          return buildWiFiPayload(wifiData);
        case 'vcard':
          return buildVCardPayload(vcardData);
        case 'email':
          return buildEmailPayload(emailData);
        case 'sms':
          return buildSMSPayload(smsData);
        default:
          throw new Error('Unknown QR type');
      }
    } catch (error) {
      setValidationError(error instanceof Error ? error.message : 'Validation error');
      return null;
    }
  };

  const handleGenerate = () => {
    const payload = validateAndGetPayload();
    if (payload) {
      onGenerate(payload);
    }
  };

  const isValid = () => {
    try {
      switch (settings.type) {
        case 'text':
          return textData.trim().length > 0;
        case 'url':
          return urlData.trim().length > 0;
        case 'wifi':
          return wifiData.ssid.trim().length > 0;
        case 'vcard':
          return vcardData.firstName.trim().length > 0 || vcardData.lastName.trim().length > 0;
        case 'email':
          return emailData.to.trim().length > 0;
        case 'sms':
          return smsData.number.trim().length > 0;
        default:
          return false;
      }
    } catch {
      return false;
    }
  };

  const updateSettings = (updates: Partial<QRSettings>) => {
    onSettingsChange({ ...settings, ...updates });
  };

  const typeOptions = [
    { value: 'text', label: 'Text' },
    { value: 'url', label: 'URL' },
    { value: 'wifi', label: 'Wi-Fi' },
    { value: 'vcard', label: 'vCard' },
    { value: 'email', label: 'Email' },
    { value: 'sms', label: 'SMS' },
  ];

  const sizeOptions = [
    { value: '256', label: '256x256' },
    { value: '320', label: '320x320' },
    { value: '512', label: '512x512' },
  ];

  const eccOptions = [
    { value: 'L', label: 'L (7%)' },
    { value: 'M', label: 'M (15%)' },
    { value: 'Q', label: 'Q (25%)' },
    { value: 'H', label: 'H (30%)' },
  ];

  const encryptionOptions = [
    { value: 'nopass', label: 'None' },
    { value: 'WEP', label: 'WEP' },
    { value: 'WPA', label: 'WPA' },
    { value: 'WPA2', label: 'WPA2' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label="Type"
          value={settings.type}
          onChange={(type) => updateSettings({ type: type as QRSettings['type'] })}
          options={typeOptions}
          id="qr-type"
        />

        <Toggle
          label="Use local generator"
          checked={settings.useLocalGenerator}
          onChange={(useLocalGenerator) => updateSettings({ useLocalGenerator })}
          id="use-local"
        />
      </div>

      <div className="space-y-4">
        {settings.type === 'text' && (
          <div>
            <label htmlFor="text-data" className="label">
              Text Content
            </label>
            <textarea
              id="text-data"
              value={textData}
              onChange={(e) => setTextData(e.target.value)}
              className="input-field min-h-[100px]"
              placeholder="Enter your text here..."
            />
          </div>
        )}

        {settings.type === 'url' && (
          <div>
            <label htmlFor="url-data" className="label">
              URL
            </label>
            <input
              type="url"
              id="url-data"
              value={urlData}
              onChange={(e) => setUrlData(e.target.value)}
              className="input-field"
              placeholder="https://example.com"
            />
            <p className="text-xs text-gray-500 mt-1">
              URLs without protocol will be prefixed with http://
            </p>
          </div>
        )}

        {settings.type === 'wifi' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="wifi-ssid" className="label">
                  Network Name (SSID)
                </label>
                <input
                  type="text"
                  id="wifi-ssid"
                  value={wifiData.ssid}
                  onChange={(e) => setWifiData({ ...wifiData, ssid: e.target.value })}
                  className="input-field"
                  placeholder="MyWiFiNetwork"
                />
              </div>

              <Select
                label="Encryption"
                value={wifiData.encryption}
                onChange={(encryption) =>
                  setWifiData({ ...wifiData, encryption: encryption as WiFiData['encryption'] })
                }
                options={encryptionOptions}
                id="wifi-encryption"
              />
            </div>

            {wifiData.encryption !== 'nopass' && (
              <div>
                <label htmlFor="wifi-password" className="label">
                  Password
                </label>
                <input
                  type="password"
                  id="wifi-password"
                  value={wifiData.password}
                  onChange={(e) => setWifiData({ ...wifiData, password: e.target.value })}
                  className="input-field"
                  placeholder="Enter WiFi password"
                />
              </div>
            )}

            <Toggle
              label="Hidden network"
              checked={wifiData.hidden}
              onChange={(hidden) => setWifiData({ ...wifiData, hidden })}
              id="wifi-hidden"
            />
          </div>
        )}

        {settings.type === 'vcard' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="vcard-firstname" className="label">
                  First Name
                </label>
                <input
                  type="text"
                  id="vcard-firstname"
                  value={vcardData.firstName}
                  onChange={(e) => {
                    const firstName = e.target.value;
                    setVCardData({
                      ...vcardData,
                      firstName,
                      fullName: `${firstName} ${vcardData.lastName}`.trim(),
                    });
                  }}
                  className="input-field"
                  placeholder="John"
                />
              </div>

              <div>
                <label htmlFor="vcard-lastname" className="label">
                  Last Name
                </label>
                <input
                  type="text"
                  id="vcard-lastname"
                  value={vcardData.lastName}
                  onChange={(e) => {
                    const lastName = e.target.value;
                    setVCardData({
                      ...vcardData,
                      lastName,
                      fullName: `${vcardData.firstName} ${lastName}`.trim(),
                    });
                  }}
                  className="input-field"
                  placeholder="Doe"
                />
              </div>
            </div>

            <div>
              <label htmlFor="vcard-fullname" className="label">
                Full Name
              </label>
              <input
                type="text"
                id="vcard-fullname"
                value={vcardData.fullName}
                onChange={(e) => setVCardData({ ...vcardData, fullName: e.target.value })}
                className="input-field"
                placeholder="John Doe"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="vcard-org" className="label">
                  Organization
                </label>
                <input
                  type="text"
                  id="vcard-org"
                  value={vcardData.organization}
                  onChange={(e) => setVCardData({ ...vcardData, organization: e.target.value })}
                  className="input-field"
                  placeholder="Company Inc."
                />
              </div>

              <div>
                <label htmlFor="vcard-title" className="label">
                  Title
                </label>
                <input
                  type="text"
                  id="vcard-title"
                  value={vcardData.title}
                  onChange={(e) => setVCardData({ ...vcardData, title: e.target.value })}
                  className="input-field"
                  placeholder="Software Engineer"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="vcard-phone" className="label">
                  Phone
                </label>
                <input
                  type="tel"
                  id="vcard-phone"
                  value={vcardData.phone}
                  onChange={(e) => setVCardData({ ...vcardData, phone: e.target.value })}
                  className="input-field"
                  placeholder="+1234567890"
                />
              </div>

              <div>
                <label htmlFor="vcard-email" className="label">
                  Email
                </label>
                <input
                  type="email"
                  id="vcard-email"
                  value={vcardData.email}
                  onChange={(e) => setVCardData({ ...vcardData, email: e.target.value })}
                  className="input-field"
                  placeholder="john@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="vcard-website" className="label">
                Website
              </label>
              <input
                type="url"
                id="vcard-website"
                value={vcardData.website}
                onChange={(e) => setVCardData({ ...vcardData, website: e.target.value })}
                className="input-field"
                placeholder="https://example.com"
              />
            </div>
          </div>
        )}

        {settings.type === 'email' && (
          <div className="space-y-4">
            <div>
              <label htmlFor="email-to" className="label">
                To
              </label>
              <input
                type="email"
                id="email-to"
                value={emailData.to}
                onChange={(e) => setEmailData({ ...emailData, to: e.target.value })}
                className="input-field"
                placeholder="recipient@example.com"
              />
            </div>

            <div>
              <label htmlFor="email-subject" className="label">
                Subject
              </label>
              <input
                type="text"
                id="email-subject"
                value={emailData.subject}
                onChange={(e) => setEmailData({ ...emailData, subject: e.target.value })}
                className="input-field"
                placeholder="Email subject"
              />
            </div>

            <div>
              <label htmlFor="email-body" className="label">
                Message
              </label>
              <textarea
                id="email-body"
                value={emailData.body}
                onChange={(e) => setEmailData({ ...emailData, body: e.target.value })}
                className="input-field min-h-[100px]"
                placeholder="Email message..."
              />
            </div>
          </div>
        )}

        {settings.type === 'sms' && (
          <div className="space-y-4">
            <div>
              <label htmlFor="sms-number" className="label">
                Phone Number
              </label>
              <input
                type="tel"
                id="sms-number"
                value={smsData.number}
                onChange={(e) => setSmsData({ ...smsData, number: e.target.value })}
                className="input-field"
                placeholder="+1234567890"
              />
            </div>

            <div>
              <label htmlFor="sms-message" className="label">
                Message
              </label>
              <textarea
                id="sms-message"
                value={smsData.message}
                onChange={(e) => setSmsData({ ...smsData, message: e.target.value })}
                className="input-field min-h-[100px]"
                placeholder="SMS message..."
              />
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Settings</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <Select
            label="Size"
            value={settings.size.toString()}
            onChange={(size) => updateSettings({ size: Number(size) })}
            options={sizeOptions}
            id="qr-size"
          />

          <NumberInput
            label="Margin"
            value={settings.margin}
            onChange={(margin) => updateSettings({ margin })}
            min={0}
            max={20}
            id="qr-margin"
          />

          <Select
            label="Error Correction"
            value={settings.errorCorrection}
            onChange={(errorCorrection) =>
              updateSettings({ errorCorrection: errorCorrection as QRSettings['errorCorrection'] })
            }
            options={eccOptions}
            id="qr-ecc"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <ColorInput
            label="Foreground Color"
            value={settings.foregroundColor}
            onChange={(foregroundColor) => updateSettings({ foregroundColor })}
            id="fg-color"
          />

          <ColorInput
            label="Background Color"
            value={settings.backgroundColor}
            onChange={(backgroundColor) => updateSettings({ backgroundColor })}
            id="bg-color"
          />
        </div>

        {settings.useLocalGenerator && (
          <div className="mb-4">
            <FileDrop
              label="Logo Overlay (Optional)"
              accept="image/*"
              maxSize={1024 * 1024}
              onFileSelect={(logoFile) => updateSettings({ logoFile })}
              selectedFile={settings.logoFile}
            />
            <p className="text-xs text-gray-500 mt-1">
              Logo overlay is only available in local generator mode
            </p>
          </div>
        )}
      </div>

      {validationError && (
        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
          {validationError}
        </div>
      )}

      <button
        onClick={handleGenerate}
        disabled={!isValid() || isGenerating}
        className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isGenerating ? 'Generating...' : 'Generate QR Code'}
      </button>

      <div className="text-xs text-gray-500 space-y-1">
        <p><strong>Best Practices:</strong></p>
        <ul className="list-disc list-inside space-y-1">
          <li>Use high contrast between foreground and background colors</li>
          <li>Ensure adequate quiet zone (margin) around the QR code</li>
          <li>Test QR codes before sharing to ensure they scan correctly</li>
          <li>Higher error correction allows for better scanning with damage</li>
        </ul>
      </div>
    </div>
  );
}