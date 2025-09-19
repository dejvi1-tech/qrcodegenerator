import { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { SimpleControls, QRSettings } from './components/SimpleControls';
import { ToastContainer, useToast } from './components/Toast';
import { hexToRgb, hexToRgbObject } from './lib/color';

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
  const [isGenerating, setIsGenerating] = useState(false);

  const { toasts, addToast, removeToast } = useToast();

  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDarkMode(prefersDark);
    document.documentElement.classList.toggle('dark', prefersDark);
  }, []);

  const toggleTheme = () => {
    const newIsDark = !isDarkMode;
    setIsDarkMode(newIsDark);
    document.documentElement.classList.toggle('dark', newIsDark);
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
      addToast('QR code generated successfully!', 'success');
    } catch (error) {
      addToast('Failed to generate QR code with API', 'error');
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

      const dataUrl = await QRCode.toDataURL(payload, options);
      setQrDataUrl(dataUrl);
      setQrImageUrl(null);
      addToast('QR code generated successfully!', 'success');
    } catch (error) {
      addToast('Failed to generate QR code locally', 'error');
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
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                QR Code Generator - With Controls
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Testing with full Controls component
              </p>
            </div>

            <button
              onClick={toggleTheme}
              className="p-2 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              {isDarkMode ? '🌞' : '🌙'}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <SimpleControls
              settings={settings}
              onSettingsChange={setSettings}
              onGenerate={handleGenerate}
              isGenerating={isGenerating}
            />
          </div>

          <div className="card p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Preview</h2>

            <div className="text-center mb-6">
              {qrImageUrl && (
                <img
                  src={qrImageUrl}
                  alt="Generated QR Code"
                  className="mx-auto border border-gray-200 dark:border-gray-700 rounded-lg"
                  style={{ maxWidth: '100%', height: 'auto' }}
                />
              )}

              {qrDataUrl && (
                <img
                  src={qrDataUrl}
                  alt="Generated QR Code"
                  className="mx-auto border border-gray-200 dark:border-gray-700 rounded-lg"
                  style={{ maxWidth: '100%', height: 'auto' }}
                />
              )}

              {!qrImageUrl && !qrDataUrl && (
                <div className="text-center text-gray-500">
                  <div className="w-32 h-32 mx-auto mb-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center">
                    <span className="text-4xl">📱</span>
                  </div>
                  <p>Generate a QR code to see preview</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}

export default App;