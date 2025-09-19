import { useState } from 'react';
import { Select } from './Select';
import { NumberInput } from './NumberInput';
import { ColorInput } from './ColorInput';
import { Toggle } from './Toggle';
import { FileDrop } from './FileDrop';
import { buildTextPayload } from '../lib/payloads';

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

export function SimpleControls2({ settings, onSettingsChange, onGenerate, isGenerating }: SimpleControlsProps) {
  const [textData, setTextData] = useState('Hello World');
  const [validationError, setValidationError] = useState<string>('');

  const typeOptions = [
    { value: 'text', label: 'Text' },
    { value: 'url', label: 'URL' },
  ];

  const validateAndGetPayload = (): string | null => {
    try {
      setValidationError('');
      return buildTextPayload(textData);
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
    return validateAndGetPayload() !== null;
  };

  return (
    <div className="space-y-4">
      <Select
        label="Type"
        value={settings.type}
        onChange={(type) => onSettingsChange({ ...settings, type: type as QRSettings['type'] })}
        options={typeOptions}
        id="qr-type"
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Text Content
        </label>
        <textarea
          value={textData}
          onChange={(e) => setTextData(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md"
          placeholder="Enter your text here..."
          rows={3}
        />
      </div>

      <NumberInput
        label="Size"
        value={settings.size}
        onChange={(size) => onSettingsChange({ ...settings, size })}
        min={128}
        max={512}
        id="qr-size"
      />

      <ColorInput
        label="Foreground Color"
        value={settings.foregroundColor}
        onChange={(foregroundColor) => onSettingsChange({ ...settings, foregroundColor })}
        id="fg-color"
      />

      <Toggle
        label="Use local generator"
        checked={settings.useLocalGenerator}
        onChange={(useLocalGenerator) => onSettingsChange({ ...settings, useLocalGenerator })}
        id="use-local"
      />

      <FileDrop
        label="Logo Overlay (Optional)"
        accept="image/*"
        maxSize={1024 * 1024}
        onFileSelect={(logoFile) => onSettingsChange({ ...settings, logoFile })}
        selectedFile={settings.logoFile}
      />

      {validationError && (
        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
          {validationError}
        </div>
      )}

      <button
        onClick={handleGenerate}
        disabled={!isValid() || isGenerating}
        className="w-full bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:opacity-50"
      >
        {isGenerating ? 'Generating...' : 'Generate QR Code'}
      </button>
    </div>
  );
}
