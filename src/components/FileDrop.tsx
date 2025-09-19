import { useCallback, useState } from 'react';

interface FileDropProps {
  label: string;
  accept: string;
  maxSize: number;
  onFileSelect: (file: File | null) => void;
  selectedFile: File | null;
}

export function FileDrop({ label, accept, maxSize, onFileSelect, selectedFile }: FileDropProps) {
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string>('');

  const validateFile = useCallback((file: File): string | null => {
    if (file.size > maxSize) {
      return `File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`;
    }

    if (!file.type.startsWith('image/')) {
      return 'Only image files are allowed';
    }

    return null;
  }, [maxSize]);

  const handleFileSelect = useCallback((file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError('');
    onFileSelect(file);
  }, [validateFile, onFileSelect]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleRemoveFile = useCallback(() => {
    onFileSelect(null);
    setError('');
  }, [onFileSelect]);

  return (
    <div>
      <label className="label">{label}</label>

      <div
        className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
          dragOver
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
            : 'border-gray-300 dark:border-gray-600'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {selectedFile ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {selectedFile.name}
              </span>
              <span className="text-xs text-gray-500">
                ({Math.round(selectedFile.size / 1024)}KB)
              </span>
            </div>
            <button
              type="button"
              onClick={handleRemoveFile}
              className="text-red-600 hover:text-red-800 text-sm"
            >
              Remove
            </button>
          </div>
        ) : (
          <>
            <div className="text-gray-600 dark:text-gray-400">
              <p>Drag and drop an image here, or</p>
              <label className="cursor-pointer text-blue-600 hover:text-blue-700">
                browse files
                <input
                  type="file"
                  accept={accept}
                  onChange={handleFileInputChange}
                  className="hidden"
                />
              </label>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Max size: {Math.round(maxSize / 1024 / 1024)}MB
            </p>
          </>
        )}
      </div>

      {error && (
        <p className="text-red-600 text-sm mt-1">{error}</p>
      )}
    </div>
  );
}