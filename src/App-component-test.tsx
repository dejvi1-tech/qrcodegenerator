import { useState } from 'react';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ToastContainer, useToast } from './components/Toast';

// Import all the Controls sub-components
import { Select } from './components/Select';
import { NumberInput } from './components/NumberInput';
import { ColorInput } from './components/ColorInput';
import { Toggle } from './components/Toggle';
import { FileDrop } from './components/FileDrop';

function App() {
  const [testStep, setTestStep] = useState(1);
  const { toasts, addToast, removeToast } = useToast();

  const tests = [
    { id: 1, name: 'Select Component' },
    { id: 2, name: 'NumberInput Component' },
    { id: 3, name: 'ColorInput Component' },
    { id: 4, name: 'Toggle Component' },
    { id: 5, name: 'FileDrop Component' },
  ];

  const currentTest = tests.find(t => t.id === testStep);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Component Test</h1>

        <div className="grid grid-cols-5 gap-2 mb-6">
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
}

function TestNumberInput() {
  const [value, setValue] = useState(5);

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
}

function TestColorInput() {
  const [value, setValue] = useState('#ff0000');

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
}

function TestToggle() {
  const [value, setValue] = useState(false);

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
}

function TestFileDrop() {
  const [file, setFile] = useState<File | null>(null);

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
}

export default App;