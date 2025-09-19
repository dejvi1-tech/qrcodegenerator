import { useState, useCallback } from 'react';
import { BatchQRItem, BatchSettings, BatchProgress, generateBatchQRCodes, parseCsvData, generateSampleCsv } from '../lib/batch';
import { ImageFormat } from '../lib/download';
import { QRSettings } from './Controls';

interface BatchProcessorProps {
  currentSettings: QRSettings;
}

export function BatchProcessor({ currentSettings }: BatchProcessorProps) {
  const [items, setItems] = useState<BatchQRItem[]>([]);
  const [batchSettings, setBatchSettings] = useState<BatchSettings>({
    size: currentSettings.size,
    margin: currentSettings.margin,
    errorCorrection: currentSettings.errorCorrection,
    foregroundColor: currentSettings.foregroundColor,
    backgroundColor: currentSettings.backgroundColor,
    format: 'png',
    quality: 0.9,
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<BatchProgress | null>(null);
  const [results, setResults] = useState<{ success: BatchQRItem[]; failed: { item: BatchQRItem; error: string }[] } | null>(null);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const csvText = e.target?.result as string;
      try {
        const parsedItems = parseCsvData(csvText);
        setItems(parsedItems);
        setResults(null);
      } catch (error) {
        alert('Failed to parse CSV file. Please check the format.');
      }
    };
    reader.readAsText(file);
  }, []);

  const handleManualAdd = () => {
    const newItem: BatchQRItem = {
      id: Math.random().toString(36).substr(2, 9),
      name: `Item ${items.length + 1}`,
      payload: '',
      type: 'text',
    };
    setItems([...items, newItem]);
  };

  const handleItemChange = (id: string, field: keyof BatchQRItem, value: string) => {
    setItems(items.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const handleDownloadSample = () => {
    const csvContent = generateSampleCsv();
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'qr-batch-sample.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleGenerate = async () => {
    if (items.length === 0) {
      alert('Please add some items to generate QR codes for.');
      return;
    }

    setIsProcessing(true);
    setProgress(null);
    setResults(null);

    try {
      const result = await generateBatchQRCodes(items, batchSettings, setProgress);
      setResults(result);
    } catch (error) {
      alert('Failed to generate batch QR codes: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsProcessing(false);
    }
  };

  const formatOptions: { value: ImageFormat; label: string }[] = [
    { value: 'png', label: 'PNG' },
    { value: 'jpeg', label: 'JPEG' },
    { value: 'webp', label: 'WebP' },
  ];

  const eccOptions = [
    { value: 'L', label: 'L (7%)' },
    { value: 'M', label: 'M (15%)' },
    { value: 'Q', label: 'Q (25%)' },
    { value: 'H', label: 'H (30%)' },
  ];

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Batch QR Generator
        </h2>
        <div className="flex space-x-2">
          <button
            onClick={handleDownloadSample}
            className="btn-secondary text-sm"
          >
            Download Sample CSV
          </button>
        </div>
      </div>

      {/* Upload Section */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
          Import Data
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Upload CSV File</label>
            <input
              type="file"
              accept=".csv,.txt"
              onChange={handleFileUpload}
              className="input-field"
            />
            <p className="text-xs text-gray-500 mt-1">
              CSV format: Name, Data, Type (optional)
            </p>
          </div>
          <div className="flex items-end">
            <button
              onClick={handleManualAdd}
              className="btn-primary w-full"
            >
              Add Item Manually
            </button>
          </div>
        </div>
      </div>

      {/* Items List */}
      {items.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
            Items ({items.length})
          </h3>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {items.map((item) => (
              <div key={item.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => handleItemChange(item.id, 'name', e.target.value)}
                    className="input-field text-sm"
                    placeholder="Name"
                  />
                  <input
                    type="text"
                    value={item.payload}
                    onChange={(e) => handleItemChange(item.id, 'payload', e.target.value)}
                    className="input-field text-sm md:col-span-2"
                    placeholder="Data/URL/Text"
                  />
                  <div className="flex space-x-2">
                    <select
                      value={item.type}
                      onChange={(e) => handleItemChange(item.id, 'type', e.target.value)}
                      className="input-field text-sm flex-1"
                    >
                      <option value="text">Text</option>
                      <option value="url">URL</option>
                      <option value="email">Email</option>
                      <option value="wifi">WiFi</option>
                      <option value="vcard">vCard</option>
                      <option value="sms">SMS</option>
                    </select>
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="px-2 py-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-900 rounded text-sm"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Batch Settings */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
          Batch Settings
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="label">Size (px)</label>
            <input
              type="number"
              value={batchSettings.size}
              onChange={(e) => setBatchSettings({ ...batchSettings, size: Number(e.target.value) })}
              className="input-field"
              min="128"
              max="2048"
            />
          </div>
          <div>
            <label className="label">Margin</label>
            <input
              type="number"
              value={batchSettings.margin}
              onChange={(e) => setBatchSettings({ ...batchSettings, margin: Number(e.target.value) })}
              className="input-field"
              min="0"
              max="20"
            />
          </div>
          <div>
            <label className="label">Error Correction</label>
            <select
              value={batchSettings.errorCorrection}
              onChange={(e) => setBatchSettings({ ...batchSettings, errorCorrection: e.target.value as 'L' | 'M' | 'Q' | 'H' })}
              className="input-field"
            >
              {eccOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Format</label>
            <select
              value={batchSettings.format}
              onChange={(e) => setBatchSettings({ ...batchSettings, format: e.target.value as ImageFormat })}
              className="input-field"
            >
              {formatOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div>
            <label className="label">Foreground Color</label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={batchSettings.foregroundColor}
                onChange={(e) => setBatchSettings({ ...batchSettings, foregroundColor: e.target.value })}
                className="w-12 h-10 border border-gray-300 dark:border-gray-600 rounded cursor-pointer"
              />
              <input
                type="text"
                value={batchSettings.foregroundColor}
                onChange={(e) => setBatchSettings({ ...batchSettings, foregroundColor: e.target.value })}
                className="input-field text-sm font-mono"
              />
            </div>
          </div>
          <div>
            <label className="label">Background Color</label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={batchSettings.backgroundColor}
                onChange={(e) => setBatchSettings({ ...batchSettings, backgroundColor: e.target.value })}
                className="w-12 h-10 border border-gray-300 dark:border-gray-600 rounded cursor-pointer"
              />
              <input
                type="text"
                value={batchSettings.backgroundColor}
                onChange={(e) => setBatchSettings({ ...batchSettings, backgroundColor: e.target.value })}
                className="input-field text-sm font-mono"
              />
            </div>
          </div>
          {(batchSettings.format === 'jpeg' || batchSettings.format === 'webp') && (
            <div>
              <label className="label">Quality ({Math.round(batchSettings.quality * 100)}%)</label>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.1"
                value={batchSettings.quality}
                onChange={(e) => setBatchSettings({ ...batchSettings, quality: Number(e.target.value) })}
                className="w-full"
              />
            </div>
          )}
        </div>
      </div>

      {/* Generate Button */}
      <div className="mb-6">
        <button
          onClick={handleGenerate}
          disabled={items.length === 0 || isProcessing}
          className="btn-primary w-full disabled:opacity-50"
        >
          {isProcessing ? 'Generating...' : `Generate ${items.length} QR Codes`}
        </button>
      </div>

      {/* Progress */}
      {progress && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Processing: {progress.currentItem || 'Preparing...'}
            </span>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {progress.current} / {progress.total}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(progress.current / progress.total) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Results */}
      {results && (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
            Results
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">
                ✅ Successfully Generated: {results.success.length}
              </h4>
              {results.success.length > 0 && (
                <p className="text-sm text-green-700 dark:text-green-300">
                  ZIP file with all QR codes has been downloaded.
                </p>
              )}
            </div>
            {results.failed.length > 0 && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">
                  ❌ Failed: {results.failed.length}
                </h4>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {results.failed.map((failure, index) => (
                    <div key={index} className="text-xs text-red-700 dark:text-red-300">
                      <strong>{failure.item.name}:</strong> {failure.error}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}