export function drawQRWithLogo(
  qrDataUrl: string,
  logoFile: File | null,
  size: number,
  onComplete: (canvas: HTMLCanvasElement) => void
): void {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Unable to get canvas context');
  }

  canvas.width = size;
  canvas.height = size;

  const qrImage = new Image();

  qrImage.onload = () => {
    ctx.drawImage(qrImage, 0, 0, size, size);

    if (logoFile) {
      const logoReader = new FileReader();
      logoReader.onload = (e) => {
        const logoImage = new Image();
        logoImage.onload = () => {
          const logoSize = Math.floor(size * 0.2);
          const logoX = (size - logoSize) / 2;
          const logoY = (size - logoSize) / 2;

          const backgroundSize = logoSize + 20;
          const backgroundX = (size - backgroundSize) / 2;
          const backgroundY = (size - backgroundSize) / 2;

          ctx.fillStyle = 'white';
          ctx.beginPath();

          // Fallback for browsers that don't support roundRect
          if (typeof ctx.roundRect === 'function') {
            ctx.roundRect(backgroundX, backgroundY, backgroundSize, backgroundSize, 8);
          } else {
            ctx.rect(backgroundX, backgroundY, backgroundSize, backgroundSize);
          }
          ctx.fill();

          ctx.strokeStyle = '#e5e7eb';
          ctx.lineWidth = 2;
          ctx.stroke();

          const aspectRatio = logoImage.width / logoImage.height;
          let drawWidth = logoSize;
          let drawHeight = logoSize;
          let drawX = logoX;
          let drawY = logoY;

          if (aspectRatio > 1) {
            drawHeight = logoSize / aspectRatio;
            drawY = logoY + (logoSize - drawHeight) / 2;
          } else {
            drawWidth = logoSize * aspectRatio;
            drawX = logoX + (logoSize - drawWidth) / 2;
          }

          ctx.drawImage(logoImage, drawX, drawY, drawWidth, drawHeight);
          onComplete(canvas);
        };
        logoImage.src = e.target?.result as string;
      };
      logoReader.readAsDataURL(logoFile);
    } else {
      onComplete(canvas);
    }
  };

  qrImage.src = qrDataUrl;
}

export function cropImageToSquare(file: File, onComplete: (croppedFile: File) => void): void {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Unable to get canvas context');
  }

  const image = new Image();
  const reader = new FileReader();

  reader.onload = (e) => {
    image.onload = () => {
      const size = Math.min(image.width, image.height);
      canvas.width = size;
      canvas.height = size;

      const sourceX = (image.width - size) / 2;
      const sourceY = (image.height - size) / 2;

      ctx.drawImage(image, sourceX, sourceY, size, size, 0, 0, size, size);

      canvas.toBlob((blob) => {
        if (blob) {
          const croppedFile = new File([blob], file.name, { type: file.type });
          onComplete(croppedFile);
        }
      }, file.type);
    };
    image.src = e.target?.result as string;
  };

  reader.readAsDataURL(file);
}