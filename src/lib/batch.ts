import QRCode from 'qrcode';
import { hexToRgbObject } from './color';
import { downloadBlob, ImageFormat } from './download';

export interface BatchQRItem {
  id: string;
  name: string;
  payload: string;
  type: string;
}

export interface BatchSettings {
  size: number;
  margin: number;
  errorCorrection: 'L' | 'M' | 'Q' | 'H';
  foregroundColor: string;
  backgroundColor: string;
  format: ImageFormat;
  quality: number;
}

export interface BatchProgress {
  current: number;
  total: number;
  status: 'processing' | 'completed' | 'error';
  currentItem?: string;
}

export async function generateBatchQRCodes(
  items: BatchQRItem[],
  settings: BatchSettings,
  onProgress?: (progress: BatchProgress) => void
): Promise<{ success: BatchQRItem[]; failed: { item: BatchQRItem; error: string }[] }> {
  const success: BatchQRItem[] = [];
  const failed: { item: BatchQRItem; error: string }[] = [];

  // Dynamic import of JSZip to avoid issues
  const JSZip = (await import('jszip')).default;
  const zip = new JSZip();

  for (let i = 0; i < items.length; i++) {
    const item = items[i];

    onProgress?.({
      current: i + 1,
      total: items.length,
      status: 'processing',
      currentItem: item.name,
    });

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
        errorCorrectionLevel: settings.errorCorrection,
      };

      const dataUrl = await QRCode.toDataURL(item.payload, options);

      // Convert to desired format
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get canvas context');

      const img = new Image();
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = dataUrl;
      });

      canvas.width = settings.size;
      canvas.height = settings.size;
      ctx.drawImage(img, 0, 0);

      const blob = await new Promise<Blob | null>((resolve) => {
        const mimeType = settings.format === 'jpeg' ? 'image/jpeg' :
                        settings.format === 'webp' ? 'image/webp' : 'image/png';
        canvas.toBlob(resolve, mimeType, settings.quality);
      });

      if (blob) {
        const extension = settings.format === 'jpeg' ? 'jpg' : settings.format;
        const filename = `${item.name.replace(/[^a-z0-9]/gi, '_')}.${extension}`;
        zip.file(filename, blob);
        success.push(item);
      } else {
        throw new Error('Failed to generate image blob');
      }
    } catch (error) {
      failed.push({
        item,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  onProgress?.({
    current: items.length,
    total: items.length,
    status: 'completed',
  });

  // Download as zip
  if (success.length > 0) {
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-');
    downloadBlob(zipBlob, `qr-codes-batch-${timestamp}.zip`);
  }

  return { success, failed };
}

export function parseCsvData(csvText: string): BatchQRItem[] {
  const lines = csvText.trim().split('\n');
  const items: BatchQRItem[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Simple CSV parsing (handles basic cases)
    const columns = line.split(',').map(col => col.trim().replace(/^"|"$/g, ''));

    if (columns.length >= 2) {
      items.push({
        id: Math.random().toString(36).substr(2, 9),
        name: columns[0] || `Item ${i + 1}`,
        payload: columns[1],
        type: columns[2] || 'text',
      });
    }
  }

  return items;
}

export function generateSampleCsv(): string {
  return [
    'Name,Data,Type',
    'Google,https://google.com,url',
    'Contact Card,"BEGIN:VCARD\nVERSION:3.0\nFN:John Doe\nORG:Company\nEND:VCARD",vcard',
    'WiFi Network,"WIFI:T:WPA2;S:MyNetwork;P:password123;H:false;;",wifi',
    'Phone Number,+1234567890,text',
    'Email Contact,"mailto:contact@example.com?subject=Hello",email',
  ].join('\n');
}