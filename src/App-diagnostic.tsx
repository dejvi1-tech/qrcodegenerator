import { useState } from 'react';
import { ErrorBoundary } from './components/ErrorBoundary';

// Import components one by one to test
import { ToastContainer, useToast } from './components/Toast';
import { Controls, QRSettings } from './components/Controls';

function App() {
  const [testStep, setTestStep] = useState(1);
  const { toasts, addToast, removeToast } = useToast();

  // Test settings for Controls component
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

  const testComponents = [
    { id: 1, name: 'Basic Layout', description: 'Testing basic app structure' },
    { id: 2, name: 'Toast System', description: 'Testing toast notifications' },
    { id: 3, name: 'Controls Component', description: 'Testing form controls' },
    { id: 4, name: 'Preview Component', description: 'Testing QR preview' },
    { id: 5, name: 'Templates Component', description: 'Testing templates' },
    { id: 6, name: 'History Component', description: 'Testing history' },
    { id: 7, name: 'Batch Component', description: 'Testing batch processing' },
  ];

  const currentTest = testComponents.find(t => t.id === testStep);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            QR Generator - Diagnostic Mode
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Testing: {currentTest?.name} - {currentTest?.description}
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="card p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Component Test Steps</h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-6">
            {testComponents.map((test) => (
              <button
                key={test.id}
                onClick={() => setTestStep(test.id)}
                className={`p-2 text-sm rounded ${
                  testStep === test.id
                    ? 'bg-blue-600 text-white'
                    : testStep < test.id
                    ? 'bg-gray-200 text-gray-600'
                    : 'bg-green-200 text-green-800'
                }`}
              >
                {test.id}. {test.name}
              </button>
            ))}
          </div>

          <div className="border-t pt-4">
            <h3 className="font-semibold mb-2">Current Test: {currentTest?.name}</h3>
            <p className="text-gray-600 mb-4">{currentTest?.description}</p>

            {testStep === 1 && (
              <div className="bg-green-50 p-4 rounded">
                <p className="text-green-800">✅ Basic layout is working!</p>
                <p className="text-sm text-gray-600 mt-2">
                  You can see this page, which means React, Tailwind CSS, and basic components are working.
                </p>
              </div>
            )}

            {testStep === 2 && (
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded">
                  <p className="text-blue-800 mb-2">Testing Toast System</p>
                  <div className="space-x-2">
                    <button
                      onClick={() => addToast('Success message!', 'success')}
                      className="btn-primary text-sm"
                    >
                      Test Success Toast
                    </button>
                    <button
                      onClick={() => addToast('Error message!', 'error')}
                      className="btn-secondary text-sm"
                    >
                      Test Error Toast
                    </button>
                    <button
                      onClick={() => addToast('Info message!', 'info')}
                      className="bg-blue-600 text-white px-3 py-1 rounded text-sm"
                    >
                      Test Info Toast
                    </button>
                  </div>
                </div>
              </div>
            )}

            {testStep >= 3 && (
              <ErrorBoundary>
                <div className="bg-yellow-50 p-4 rounded">
                  <p className="text-yellow-800">🚧 Testing advanced components...</p>
                  <p className="text-sm text-gray-600 mt-2">
                    This step will test complex components that might be causing issues.
                  </p>

                  {testStep === 3 && (
                    <div className="mt-4">
                      <p className="font-semibold mb-2">Controls Component Test</p>
                      <div className="border border-gray-300 rounded p-4">
                        <Controls
                          settings={settings}
                          onSettingsChange={setSettings}
                          onGenerate={(payload) => addToast(`Generated QR: ${payload.substring(0, 50)}...`, 'success')}
                          isGenerating={false}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </ErrorBoundary>
            )}
          </div>
        </div>
      </main>

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}

export default App;