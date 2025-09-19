import { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { hexToRgb, hexToRgbObject } from './lib/color';
import { ToastContainer, useToast } from './components/Toast';

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [qrText, setQrText] = useState('');
  const [qrImageUrl, setQrImageUrl] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [useLocalGenerator, setUseLocalGenerator] = useState(false);
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

  const generateQRWithAPI = async (text: string) => {
    try {
      const params = new URLSearchParams({
        data: text,
        size: '256x256',
        margin: '4',
        ecc: 'M',
        color: '0-0-0',
        bgcolor: '255-255-255',
      });

      const url = `https://api.qrserver.com/v1/create-qr-code/?${params.toString()}`;
      setQrImageUrl(url);
      setQrDataUrl(null);
      addToast('QR code generated successfully!', 'success');
    } catch (error) {
      addToast('Failed to generate QR code with API', 'error');
    }
  };

  const generateQRWithLocal = async (text: string) => {
    try {
      const options = {
        width: 256,
        margin: 4,
        color: {
          dark: 'rgb(0, 0, 0)',
          light: 'rgb(255, 255, 255)',
        },
        errorCorrectionLevel: 'M' as const,
      };

      const dataUrl = await QRCode.toDataURL(text, options);
      setQrDataUrl(dataUrl);
      setQrImageUrl(null);
      addToast('QR code generated successfully!', 'success');
    } catch (error) {
      addToast('Failed to generate QR code locally', 'error');
    }
  };

  const handleGenerate = async () => {
    if (!qrText.trim()) {
      addToast('Please enter some text', 'error');
      return;
    }

    setIsGenerating(true);
    try {
      if (useLocalGenerator) {
        await generateQRWithLocal(qrText);
      } else {
        await generateQRWithAPI(qrText);
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
                QR Code Generator
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Basic QR code generation test
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
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Generate QR Code
            </h2>

            <div className="space-y-4">
              <div>
                <label className="label">Text to encode</label>
                <textarea
                  value={qrText}
                  onChange={(e) => setQrText(e.target.value)}
                  className="input-field min-h-[100px]"
                  placeholder="Enter text, URL, or any data..."
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="use-local"
                  checked={useLocalGenerator}
                  onChange={(e) => setUseLocalGenerator(e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="use-local" className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Use local generator (offline)
                </label>
              </div>

              <button
                onClick={handleGenerate}
                disabled={!qrText.trim() || isGenerating}
                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? 'Generating...' : 'Generate QR Code'}
              </button>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Preview
            </h2>

            <div className="text-center">
              {qrImageUrl && (
                <img
                  src={qrImageUrl}
                  alt="Generated QR Code"
                  className="mx-auto border border-gray-200 dark:border-gray-700 rounded-lg"
                />
              )}

              {qrDataUrl && (
                <img
                  src={qrDataUrl}
                  alt="Generated QR Code"
                  className="mx-auto border border-gray-200 dark:border-gray-700 rounded-lg"
                />
              )}

              {!qrImageUrl && !qrDataUrl && (
                <div className="text-center text-gray-500 py-8">
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