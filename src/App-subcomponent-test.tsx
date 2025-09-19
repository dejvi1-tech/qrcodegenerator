import { useState } from 'react';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ToastContainer, useToast } from './components/Toast';

function App() {
  const [testStep, setTestStep] = useState(1);
  const { toasts, removeToast } = useToast();

  const tests = [
    { id: 1, name: 'Select Component', file: './components/Select' },
    { id: 2, name: 'NumberInput Component', file: './components/NumberInput' },
    { id: 3, name: 'ColorInput Component', file: './components/ColorInput' },
    { id: 4, name: 'Toggle Component', file: './components/Toggle' },
    { id: 5, name: 'FileDrop Component', file: './components/FileDrop' },
    { id: 6, name: 'Payloads Library', file: '../lib/payloads' },
  ];

  const currentTest = tests.find(t => t.id === testStep);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Sub-Component Test</h1>

        <div className="grid grid-cols-3 gap-2 mb-6">
          {tests.map((test) => (
            <button
              key={test.id}
              onClick={() => setTestStep(test.id)}
              className={`p-2 text-sm rounded ${
                testStep === test.id ? 'bg-blue-600 text-white' : 'bg-gray-200'
              }`}
            >
              {test.id}. {test.name}
            </button>
          ))}
        </div>

        <div className="card p-6">
          <h2 className="text-lg font-semibold mb-4">
            Testing: {currentTest?.name}
          </h2>

          <ErrorBoundary>
            {testStep === 1 && <TestSelect />}
            {testStep === 2 && <TestNumberInput />}
            {testStep === 3 && <TestColorInput />}
            {testStep === 4 && <TestToggle />}
            {testStep === 5 && <TestFileDrop />}
            {testStep === 6 && <TestPayloads />}
          </ErrorBoundary>
        </div>
      </div>

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}

// Individual component tests
function TestSelect() {
  const [value, setValue] = useState('option1');

  try {
    const { Select } = require('./components/Select');
    const options = [
      { value: 'option1', label: 'Option 1' },
      { value: 'option2', label: 'Option 2' },
    ];

    return (
      <div>
        <p className="text-green-600 mb-2">✅ Select component loaded successfully</p>
        <Select
          label="Test Select"
          value={value}
          onChange={setValue}
          options={options}
          id="test-select"
        />
      </div>
    );
  } catch (error: any) {
    return <p className="text-red-600">❌ Select failed: {error.message}</p>;
  }
}

function TestNumberInput() {
  const [value, setValue] = useState(5);

  try {
    const { NumberInput } = require('./components/NumberInput');

    return (
      <div>
        <p className="text-green-600 mb-2">✅ NumberInput component loaded successfully</p>
        <NumberInput
          label="Test Number"
          value={value}
          onChange={setValue}
          min={0}
          max={10}
          id="test-number"
        />
      </div>
    );
  } catch (error: any) {
    return <p className="text-red-600">❌ NumberInput failed: {error.message}</p>;
  }
}

function TestColorInput() {
  const [value, setValue] = useState('#ff0000');

  try {
    const { ColorInput } = require('./components/ColorInput');

    return (
      <div>
        <p className="text-green-600 mb-2">✅ ColorInput component loaded successfully</p>
        <ColorInput
          label="Test Color"
          value={value}
          onChange={setValue}
          id="test-color"
        />
      </div>
    );
  } catch (error: any) {
    return <p className="text-red-600">❌ ColorInput failed: {error.message}</p>;
  }
}

function TestToggle() {
  const [value, setValue] = useState(false);

  try {
    const { Toggle } = require('./components/Toggle');

    return (
      <div>
        <p className="text-green-600 mb-2">✅ Toggle component loaded successfully</p>
        <Toggle
          label="Test Toggle"
          checked={value}
          onChange={setValue}
          id="test-toggle"
        />
      </div>
    );
  } catch (error: any) {
    return <p className="text-red-600">❌ Toggle failed: {error.message}</p>;
  }
}

function TestFileDrop() {
  const [file, setFile] = useState<File | null>(null);

  try {
    const { FileDrop } = require('./components/FileDrop');

    return (
      <div>
        <p className="text-green-600 mb-2">✅ FileDrop component loaded successfully</p>
        <FileDrop
          label="Test File Drop"
          accept="image/*"
          maxSize={1024 * 1024}
          onFileSelect={setFile}
          selectedFile={file}
        />
      </div>
    );
  } catch (error: any) {
    return <p className="text-red-600">❌ FileDrop failed: {error.message}</p>;
  }
}

function TestPayloads() {
  try {
    const payloads = require('../lib/payloads');

    return (
      <div>
        <p className="text-green-600 mb-2">✅ Payloads library loaded successfully</p>
        <p className="text-sm text-gray-600">
          Available functions: {Object.keys(payloads).join(', ')}
        </p>
      </div>
    );
  } catch (error: any) {
    return <p className="text-red-600">❌ Payloads failed: {error.message}</p>;
  }
}

export default App;
