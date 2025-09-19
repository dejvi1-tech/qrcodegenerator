import { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { Controls, QRSettings } from './components/Controls';
import { Preview } from './components/Preview';
import { Templates } from './components/Templates';
import { History } from './components/History';
import { BatchProcessor } from './components/BatchProcessor';
import { ToastContainer, useToast } from './components/Toast';
import { hexToRgb, hexToRgbObject } from './lib/color';
import { saveQRToHistory, QRHistory, QRTemplate } from './lib/storage';

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [settings, setSettings] = useState<QRSettings>({
    type: 'text',
    size: 256,
    margin: 4,
    errorCorrection: 'M',
    foregroundColor: '#000000',
    backgroundColor: '#ffffff',
    useLocalGenerator: false,
    logoFile: null,
  });

  const [qrImageUrl, setQrImageUrl] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [qrSvgString, setQrSvgString] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<'generate' | 'batch' | 'templates' | 'history'>('generate');

  const { toasts, addToast, removeToast } = useToast();

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldUseDark = savedTheme === 'dark' || (!savedTheme && prefersDark);

    setIsDarkMode(shouldUseDark);
    document.documentElement.classList.toggle('dark', shouldUseDark);

    // Load saved QR settings
    const savedSettings = localStorage.getItem('qr-settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error('Failed to parse saved settings:', error);
      }
    }
  }, []);

  // Save settings to localStorage when they change
  useEffect(() => {
    const settingsToSave = {
      type: settings.type,
      size: settings.size,
      margin: settings.margin,
      errorCorrection: settings.errorCorrection,
      foregroundColor: settings.foregroundColor,
      backgroundColor: settings.backgroundColor,
      useLocalGenerator: settings.useLocalGenerator,
    };
    localStorage.setItem('qr-settings', JSON.stringify(settingsToSave));
  }, [settings.type, settings.size, settings.margin, settings.errorCorrection, settings.foregroundColor, settings.backgroundColor, settings.useLocalGenerator]);

  const toggleTheme = () => {
    const newIsDark = !isDarkMode;
    setIsDarkMode(newIsDark);
    document.documentElement.classList.toggle('dark', newIsDark);
    localStorage.setItem('theme', newIsDark ? 'dark' : 'light');
  };

  const generateQRWithAPI = async (payload: string) => {
    try {
      const params = new URLSearchParams({
        data: payload,
        size: `${settings.size}x${settings.size}`,
        margin: settings.margin.toString(),
        ecc: settings.errorCorrection,
        color: hexToRgb(settings.foregroundColor),
        bgcolor: hexToRgb(settings.backgroundColor),
      });

      const url = `https://api.qrserver.com/v1/create-qr-code/?${params.toString()}`;
      setQrImageUrl(url);
      setQrDataUrl(null);
      setQrSvgString(null);

      addToast('QR code generated successfully!', 'success');
    } catch (error) {
      addToast('Failed to generate QR code with API', 'error');
      console.error('API generation error:', error);
    }
  };

  const generateQRWithLocal = async (payload: string) => {
    try {
      const fgColor = hexToRgbObject(settings.foregroundColor);
      const bgColor = hexToRgbObject(settings.backgroundColor);

      const options = {
        width: settings.size,
        margin: settings.margin,
        color: {
          dark: `rgb(${fgColor.r}, ${fgColor.g}, ${fgColor.b})`,
          light: `rgb(${bgColor.r}, ${bgColor.g}, ${bgColor.b})`,
        },
        errorCorrectionLevel: settings.errorCorrection as 'L' | 'M' | 'Q' | 'H',
      };

      const [dataUrl, svgString] = await Promise.all([
        QRCode.toDataURL(payload, options),
        QRCode.toString(payload, { ...options, type: 'svg' }),
      ]);

      setQrDataUrl(dataUrl);
      setQrSvgString(svgString);
      setQrImageUrl(null);

      addToast('QR code generated successfully!', 'success');
    } catch (error) {
      addToast('Failed to generate QR code locally', 'error');
      console.error('Local generation error:', error);
    }
  };

  const handleGenerate = async (payload: string) => {
    setIsGenerating(true);

    try {
      if (settings.useLocalGenerator) {
        await generateQRWithLocal(payload);
      } else {
        await generateQRWithAPI(payload);
      }

      // Save to history
      saveQRToHistory({
        type: settings.type,
        payload,
        settings: {
          size: settings.size,
          margin: settings.margin,
          errorCorrection: settings.errorCorrection,
          foregroundColor: settings.foregroundColor,
          backgroundColor: settings.backgroundColor,
        },
        preview: settings.useLocalGenerator ? qrDataUrl || undefined : qrImageUrl || undefined,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApplyTemplate = (template: QRTemplate) => {
    setSettings({
      ...settings,
      type: template.type as QRSettings['type'],
      size: template.settings.size,
      margin: template.settings.margin,
      errorCorrection: template.settings.errorCorrection as QRSettings['errorCorrection'],
      foregroundColor: template.settings.foregroundColor,
      backgroundColor: template.settings.backgroundColor,
    });
    setActiveTab('generate');
    addToast(`Applied template: ${template.name}`, 'success');
  };

  const handleRestoreFromHistory = (historyItem: QRHistory) => {
    setSettings({
      ...settings,
      type: historyItem.type as QRSettings['type'],
      size: historyItem.settings.size,
      margin: historyItem.settings.margin,
      errorCorrection: historyItem.settings.errorCorrection as QRSettings['errorCorrection'],
      foregroundColor: historyItem.settings.foregroundColor,
      backgroundColor: historyItem.settings.backgroundColor,
    });
    setActiveTab('generate');
    addToast('Restored QR code from history', 'success');
    // Note: We'd need to also restore the payload data, which would require
    // updating the Controls component to accept initial data
  };

  const handleDownloadError = (error: string) => {
    addToast(error, 'error');
  };

  const handleDownloadSuccess = (message: string) => {
    addToast(message, 'success');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                QR Code Generator
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Generate QR codes for URLs, Wi-Fi, vCards, and more
              </p>
            </div>

            <button
              onClick={toggleTheme}
              className="p-2 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              aria-label="Toggle theme"
            >
              {isDarkMode ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'generate', label: 'Generate QR', icon: '🔲' },
                { id: 'batch', label: 'Batch Processing', icon: '📦' },
                { id: 'templates', label: 'Templates', icon: '📋' },
                { id: 'history', label: 'History', icon: '📜' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'generate' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <Controls
                settings={settings}
                onSettingsChange={setSettings}
                onGenerate={handleGenerate}
                isGenerating={isGenerating}
              />
            </div>

            <div>
              <Preview
                qrImageUrl={qrImageUrl}
                qrDataUrl={qrDataUrl}
                qrSvgString={qrSvgString}
                useLocalGenerator={settings.useLocalGenerator}
                logoFile={settings.logoFile}
                size={settings.size}
                onDownloadError={handleDownloadError}
                onDownloadSuccess={handleDownloadSuccess}
              />
            </div>
          </div>
        )}

        {activeTab === 'batch' && (
          <BatchProcessor currentSettings={settings} />
        )}

        {activeTab === 'templates' && (
          <Templates
            onApplyTemplate={handleApplyTemplate}
            currentSettings={settings}
            onSaveAsTemplate={() => {}}
          />
        )}

        {activeTab === 'history' && (
          <History onRestoreQR={handleRestoreFromHistory} />
        )}
      </main>

      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-gray-600 dark:text-gray-400">
            <p className="mb-2">
              Built with React, TypeScript, and Tailwind CSS
            </p>
            <div className="flex items-center justify-center space-x-4">
              <span>API Mode: qrserver.com</span>
              <span>•</span>
              <span>Local Mode: qrcode library</span>
            </div>
          </div>
        </div>
      </footer>

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}

export default App;