import { useRef, useEffect, useState } from 'react';
import { downloadImageFromUrl, downloadCanvasAsPNG, downloadCanvasAsJPEG, downloadCanvasAsWebP, downloadSVG, ImageFormat, createCanvasFromDataUrl } from '../lib/download';
import { drawQRWithLogo } from '../lib/canvas';

interface PreviewProps {
  qrImageUrl: string | null;
  qrDataUrl: string | null;
  qrSvgString: string | null;
  useLocalGenerator: boolean;
  logoFile: File | null;
  size: number;
  onDownloadError: (error: string) => void;
  onDownloadSuccess: (message: string) => void;
}

export function Preview({
  qrImageUrl,
  qrDataUrl,
  qrSvgString,
  useLocalGenerator,
  logoFile,
  size,
  onDownloadError,
  onDownloadSuccess,
}: PreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedFormat, setSelectedFormat] = useState<ImageFormat>('png');
  const [jpegQuality, setJpegQuality] = useState(0.9);
  const [webpQuality, setWebpQuality] = useState(0.9);

  useEffect(() => {
    if (qrDataUrl && logoFile && canvasRef.current) {
      drawQRWithLogo(qrDataUrl, logoFile, size, (canvas) => {
        const ctx = canvasRef.current?.getContext('2d');
        if (ctx && canvasRef.current) {
          canvasRef.current.width = canvas.width;
          canvasRef.current.height = canvas.height;
          ctx.drawImage(canvas, 0, 0);
        }
      });
    }
  }, [qrDataUrl, logoFile, size]);

  const getDownloadCanvas = async (): Promise<HTMLCanvasElement | null> => {
    if (logoFile && canvasRef.current) {
      return canvasRef.current;
    } else if (qrDataUrl) {
      try {
        return await createCanvasFromDataUrl(qrDataUrl);
      } catch (error) {
        throw new Error('Failed to create canvas from QR data');
      }
    }
    return null;
  };

  const handleDownload = async (format: ImageFormat) => {
    try {
      if (useLocalGenerator) {
        const canvas = await getDownloadCanvas();
        if (canvas) {
          const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-');
          const filename = `qr-code-${timestamp}.${format === 'jpeg' ? 'jpg' : format}`;

          switch (format) {
            case 'png':
              downloadCanvasAsPNG(canvas, filename);
              break;
            case 'jpeg':
              downloadCanvasAsJPEG(canvas, filename, jpegQuality);
              break;
            case 'webp':
              downloadCanvasAsWebP(canvas, filename, webpQuality);
              break;
          }
          onDownloadSuccess(`QR code downloaded as ${format.toUpperCase()}!`);
        }
      } else if (qrImageUrl) {
        // For API mode, only PNG is supported directly
        if (format === 'png') {
          await downloadImageFromUrl(qrImageUrl, 'qr-code.png');
          onDownloadSuccess('QR code downloaded successfully!');
        } else {
          // Convert API image to other formats
          const canvas = await createCanvasFromDataUrl(qrImageUrl);
          const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-');
          const filename = `qr-code-${timestamp}.${format === 'jpeg' ? 'jpg' : format}`;

          switch (format) {
            case 'jpeg':
              downloadCanvasAsJPEG(canvas, filename, jpegQuality);
              break;
            case 'webp':
              downloadCanvasAsWebP(canvas, filename, webpQuality);
              break;
          }
          onDownloadSuccess(`QR code converted and downloaded as ${format.toUpperCase()}!`);
        }
      }
    } catch (error) {
      onDownloadError(error instanceof Error ? error.message : `Failed to download ${format.toUpperCase()}`);
    }
  };


  const handleDownloadSVG = () => {
    if (!useLocalGenerator) {
      onDownloadError('SVG download is only available in local generator mode');
      return;
    }

    if (!qrSvgString) {
      onDownloadError('No SVG data available');
      return;
    }

    try {
      downloadSVG(qrSvgString, 'qr-code.svg');
      onDownloadSuccess('QR code SVG downloaded successfully!');
    } catch (error) {
      onDownloadError(error instanceof Error ? error.message : 'Failed to download SVG');
    }
  };

  const hasQR = qrImageUrl || qrDataUrl;

  if (!hasQR) {
    return (
      <div className="card p-8">
        <div className="text-center text-gray-500">
          <div className="w-32 h-32 mx-auto mb-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center">
            <span className="text-4xl">📱</span>
          </div>
          <p>Generate a QR code to see preview</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Preview</h2>

      <div className="text-center mb-6">
        {useLocalGenerator ? (
          <div className="space-y-4">
            {logoFile && qrDataUrl ? (
              <canvas
                ref={canvasRef}
                className="mx-auto border border-gray-200 dark:border-gray-700 rounded-lg"
                style={{ maxWidth: '100%', height: 'auto' }}
              />
            ) : qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt="Generated QR Code"
                className="mx-auto border border-gray-200 dark:border-gray-700 rounded-lg"
                style={{ maxWidth: '100%', height: 'auto' }}
              />
            ) : null}
          </div>
        ) : qrImageUrl ? (
          <img
            src={qrImageUrl}
            alt="Generated QR Code"
            className="mx-auto border border-gray-200 dark:border-gray-700 rounded-lg"
            style={{ maxWidth: '100%', height: 'auto' }}
          />
        ) : null}
      </div>

      <div className="space-y-4">
        {/* Format Selection */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Download Format:
          </span>
          <div className="flex space-x-2">
            {(['png', 'jpeg', 'webp'] as ImageFormat[]).map((format) => (
              <button
                key={format}
                onClick={() => setSelectedFormat(format)}
                className={`px-3 py-1 text-xs rounded-md transition-colors ${
                  selectedFormat === format
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600'
                }`}
              >
                {format.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Quality Settings */}
        {(selectedFormat === 'jpeg' || selectedFormat === 'webp') && (
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Quality: {Math.round((selectedFormat === 'jpeg' ? jpegQuality : webpQuality) * 100)}%
            </label>
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.1"
              value={selectedFormat === 'jpeg' ? jpegQuality : webpQuality}
              onChange={(e) => {
                const value = Number(e.target.value);
                if (selectedFormat === 'jpeg') {
                  setJpegQuality(value);
                } else {
                  setWebpQuality(value);
                }
              }}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Lower size</span>
              <span>Higher quality</span>
            </div>
          </div>
        )}

        {/* Download Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => handleDownload(selectedFormat)}
            className="btn-primary flex-1"
          >
            Download {selectedFormat.toUpperCase()}
          </button>

          {useLocalGenerator && (
            <button
              onClick={handleDownloadSVG}
              className="btn-secondary flex-1"
            >
              Download SVG
            </button>
          )}
        </div>
      </div>

      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
        <p className="text-sm text-blue-800 dark:text-blue-200">
          <strong>Generator:</strong> {useLocalGenerator ? 'Local (offline)' : 'API (online)'}
        </p>
        {useLocalGenerator && logoFile && (
          <p className="text-sm text-blue-800 dark:text-blue-200 mt-1">
            <strong>Logo:</strong> {logoFile.name}
          </p>
        )}
      </div>
    </div>
  );
}