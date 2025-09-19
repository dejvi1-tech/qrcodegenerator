import { useState } from 'react';
import { ToastContainer, useToast } from './components/Toast';
import { Controls, QRSettings } from './components/Controls';

function App() {
  const [message, setMessage] = useState('App is working!');
  const { toasts, addToast, removeToast } = useToast();

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

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">QR Code Generator - Minimal Test</h1>
        <p className="text-lg mb-4">{message}</p>
        <div className="space-x-2">
          <button
            onClick={() => setMessage('Button clicked! React state is working.')}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Test State Update
          </button>
          <button
            onClick={() => addToast('Toast is working!', 'success')}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Test Toast
          </button>
        </div>
        <div className="mt-8 p-4 bg-green-100 rounded">
          <p className="text-green-800">✅ React is working</p>
          <p className="text-green-800">✅ Tailwind CSS is working</p>
          <p className="text-green-800">✅ State management is working</p>
          <p className="text-green-800">✅ Toast system is working</p>
        </div>

        <div className="mt-8 p-6 bg-white rounded shadow">
          <h2 className="text-xl font-bold mb-4">Testing Controls Component</h2>
          <Controls
            settings={settings}
            onSettingsChange={setSettings}
            onGenerate={(payload) => addToast(`Generated QR: ${payload.substring(0, 50)}...`, 'success')}
            isGenerating={false}
          />
        </div>
      </div>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}

export default App;
