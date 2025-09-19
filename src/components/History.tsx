import { useState } from 'react';
import { QRHistory, getQRHistory, deleteQRFromHistory, clearQRHistory, exportQRHistory, importQRHistory } from '../lib/storage';

interface HistoryProps {
  onRestoreQR: (historyItem: QRHistory) => void;
}

export function History({ onRestoreQR }: HistoryProps) {
  const [history, setHistory] = useState<QRHistory[]>(getQRHistory());
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [importText, setImportText] = useState('');

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this QR code from history?')) {
      deleteQRFromHistory(id);
      setHistory(getQRHistory());
    }
  };

  const handleClearAll = () => {
    if (confirm('Are you sure you want to clear all QR code history? This cannot be undone.')) {
      clearQRHistory();
      setHistory([]);
    }
  };

  const handleExport = () => {
    const data = exportQRHistory();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `qr-history-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    try {
      if (importQRHistory(importText)) {
        setHistory(getQRHistory());
        setShowImportDialog(false);
        setImportText('');
        alert('History imported successfully!');
      } else {
        alert('Invalid JSON format. Please check your data.');
      }
    } catch (error) {
      alert('Failed to import history. Please check your data format.');
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const truncatePayload = (payload: string, maxLength: number = 50) => {
    return payload.length > maxLength ? payload.substring(0, maxLength) + '...' : payload;
  };

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          History ({history.length})
        </h2>
        <div className="flex space-x-2">
          <button
            onClick={handleExport}
            className="btn-secondary text-sm"
            disabled={history.length === 0}
          >
            Export
          </button>
          <button
            onClick={() => setShowImportDialog(true)}
            className="btn-secondary text-sm"
          >
            Import
          </button>
          <button
            onClick={handleClearAll}
            className="btn-secondary text-sm text-red-600"
            disabled={history.length === 0}
          >
            Clear All
          </button>
        </div>
      </div>

      {history.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          <div className="text-4xl mb-2">📜</div>
          <p>No QR codes in history yet</p>
          <p className="text-sm">Generated QR codes will appear here</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {history.map((item) => (
            <div
              key={item.id}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      {item.type}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatDate(item.timestamp)}
                    </span>
                  </div>

                  <p className="text-sm text-gray-900 dark:text-white font-mono break-all">
                    {truncatePayload(item.payload)}
                  </p>

                  <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                    <span>{item.settings.size}px</span>
                    <span>ECC: {item.settings.errorCorrection}</span>
                    <div className="flex items-center space-x-1">
                      <div
                        className="w-3 h-3 rounded border"
                        style={{ backgroundColor: item.settings.foregroundColor }}
                      />
                      <div
                        className="w-3 h-3 rounded border"
                        style={{ backgroundColor: item.settings.backgroundColor }}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  {item.preview && (
                    <img
                      src={item.preview}
                      alt="QR Preview"
                      className="w-12 h-12 border border-gray-200 dark:border-gray-600 rounded"
                    />
                  )}
                  <div className="flex flex-col space-y-1">
                    <button
                      onClick={() => onRestoreQR(item)}
                      className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300"
                    >
                      Restore
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 dark:bg-red-900 dark:text-red-300"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showImportDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Import History
            </h3>

            <div className="space-y-4">
              <div>
                <label className="label">JSON Data</label>
                <textarea
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  className="input-field h-32"
                  placeholder="Paste your exported JSON data here..."
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowImportDialog(false);
                  setImportText('');
                }}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={handleImport}
                disabled={!importText.trim()}
                className="btn-primary flex-1 disabled:opacity-50"
              >
                Import
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}