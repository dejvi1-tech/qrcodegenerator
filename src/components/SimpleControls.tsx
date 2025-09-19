import { useState } from 'react';
import { Select } from './Select';
import { NumberInput } from './NumberInput';
import { ColorInput } from './ColorInput';
import { Toggle } from './Toggle';

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

interface SimpleControlsProps {
  settings: QRSettings;
  onSettingsChange: (settings: QRSettings) => void;
  onGenerate: (payload: string) => void;
  isGenerating: boolean;
}

export function SimpleControls({ settings, onSettingsChange, onGenerate, isGenerating }: SimpleControlsProps) {
  const [textData, setTextData] = useState('');
  const [urlData, setUrlData] = useState('');

  const updateSettings = (updates: Partial<QRSettings>) => {
    onSettingsChange({ ...settings, ...updates });
  };

  const handleGenerate = () => {
    let payload = '';

    switch (settings.type) {
      case 'text':
        payload = textData;
        break;
      case 'url':
        payload = urlData.startsWith('http') ? urlData : `http://${urlData}`;
        break;
      default:
        payload = textData;
    }

    if (payload.trim()) {
      onGenerate(payload);
    }
  };

  const typeOptions = [
    { value: 'text', label: 'Text' },
    { value: 'url', label: 'URL' },
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

  const isValid = () => {
    switch (settings.type) {
      case 'text':
        return textData.trim().length > 0;
      case 'url':
        return urlData.trim().length > 0;
      default:
        return false;
    }
  };

  return (
    <div className="card p-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        Simple Controls
      </h2>

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
        </div>

        <button
          onClick={handleGenerate}
          disabled={!isValid() || isGenerating}
          className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? 'Generating...' : 'Generate QR Code'}
        </button>
      </div>
    </div>
  );
}