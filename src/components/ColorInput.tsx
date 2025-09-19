
interface ColorInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  id: string;
}

export function ColorInput({ label, value, onChange, id }: ColorInputProps) {
  return (
    <div>
      <label htmlFor={id} className="label">
        {label}
      </label>
      <div className="flex items-center space-x-2">
        <input
          type="color"
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-12 h-10 border border-gray-300 dark:border-gray-600 rounded cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="input-field text-sm font-mono"
          placeholder="#000000"
          pattern="^#[0-9A-Fa-f]{6}$"
        />
      </div>
    </div>
  );
}