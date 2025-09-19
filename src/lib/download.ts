export type ImageFormat = 'png' | 'jpeg' | 'webp';

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function downloadCanvasAsImage(
  canvas: HTMLCanvasElement,
  filename: string,
  format: ImageFormat = 'png',
  quality: number = 1.0
): void {
  const mimeType = format === 'jpeg' ? 'image/jpeg' : format === 'webp' ? 'image/webp' : 'image/png';

  canvas.toBlob((blob) => {
    if (blob) {
      downloadBlob(blob, filename);
    }
  }, mimeType, quality);
}

export function downloadCanvasAsPNG(canvas: HTMLCanvasElement, filename: string): void {
  downloadCanvasAsImage(canvas, filename, 'png');
}

export function downloadCanvasAsJPEG(canvas: HTMLCanvasElement, filename: string, quality: number = 0.9): void {
  downloadCanvasAsImage(canvas, filename, 'jpeg', quality);
}

export function downloadCanvasAsWebP(canvas: HTMLCanvasElement, filename: string, quality: number = 0.9): void {
  downloadCanvasAsImage(canvas, filename, 'webp', quality);
}

export function downloadSVG(svgString: string, filename: string): void {
  const blob = new Blob([svgString], { type: 'image/svg+xml' });
  downloadBlob(blob, filename);
}

export async function downloadImageFromUrl(url: string, filename: string): Promise<void> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch image');
    }
    const blob = await response.blob();
    downloadBlob(blob, filename);
  } catch (error) {
    console.error('Failed to download image:', error);
    throw new Error('Failed to download image. Try right-clicking the image and selecting "Save as"');
  }
}

export function convertImageFormat(
  sourceCanvas: HTMLCanvasElement,
  targetFormat: ImageFormat,
  quality: number = 1.0
): Promise<Blob | null> {
  return new Promise((resolve) => {
    const mimeType = targetFormat === 'jpeg' ? 'image/jpeg' :
                    targetFormat === 'webp' ? 'image/webp' : 'image/png';

    sourceCanvas.toBlob((blob) => {
      resolve(blob);
    }, mimeType, quality);
  });
}

export function createCanvasFromDataUrl(dataUrl: string): Promise<HTMLCanvasElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      resolve(canvas);
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = dataUrl;
  });
}