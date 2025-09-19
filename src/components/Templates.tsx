import { useState } from 'react';
import { QRTemplate, getQRTemplates, saveQRTemplate, deleteQRTemplate } from '../lib/storage';
import { QRSettings } from './Controls';

interface TemplatesProps {
  onApplyTemplate: (template: QRTemplate) => void;
  currentSettings: QRSettings;
  onSaveAsTemplate?: () => void;
}

export function Templates({ onApplyTemplate, currentSettings }: TemplatesProps) {
  const [templates, setTemplates] = useState<QRTemplate[]>(getQRTemplates());
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');

  const handleApplyTemplate = (template: QRTemplate) => {
    onApplyTemplate(template);
  };

  const handleSaveTemplate = () => {
    if (!templateName.trim()) return;

    const newTemplate = {
      name: templateName,
      description: templateDescription,
      type: currentSettings.type,
      defaultData: {},
      settings: {
        size: currentSettings.size,
        margin: currentSettings.margin,
        errorCorrection: currentSettings.errorCorrection,
        foregroundColor: currentSettings.foregroundColor,
        backgroundColor: currentSettings.backgroundColor,
      },
    };

    saveQRTemplate(newTemplate);
    setTemplates(getQRTemplates());
    setShowSaveDialog(false);
    setTemplateName('');
    setTemplateDescription('');
  };

  const handleDeleteTemplate = (id: string) => {
    if (confirm('Are you sure you want to delete this template?')) {
      deleteQRTemplate(id);
      setTemplates(getQRTemplates());
    }
  };

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Templates</h2>
        <button
          onClick={() => setShowSaveDialog(true)}
          className="btn-primary text-sm"
        >
          Save Current
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {templates.map((template) => (
          <div
            key={template.id}
            className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">
                  {template.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {template.description}
                </p>
              </div>
              <div className="flex space-x-1">
                <button
                  onClick={() => handleApplyTemplate(template)}
                  className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300"
                >
                  Apply
                </button>
                {!['business-card', 'wifi-guest', 'website-link', 'contact-email'].includes(template.id) && (
                  <button
                    onClick={() => handleDeleteTemplate(template.id)}
                    className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 dark:bg-red-900 dark:text-red-300"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <span className="capitalize">{template.type}</span>
              <span>•</span>
              <span>{template.settings.size}px</span>
              <span>•</span>
              <div
                className="w-3 h-3 rounded border"
                style={{ backgroundColor: template.settings.foregroundColor }}
              />
            </div>
          </div>
        ))}
      </div>

      {showSaveDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Save Template
            </h3>

            <div className="space-y-4">
              <div>
                <label className="label">Template Name</label>
                <input
                  type="text"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  className="input-field"
                  placeholder="My Custom Template"
                />
              </div>

              <div>
                <label className="label">Description</label>
                <textarea
                  value={templateDescription}
                  onChange={(e) => setTemplateDescription(e.target.value)}
                  className="input-field"
                  rows={3}
                  placeholder="Describe when to use this template..."
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowSaveDialog(false)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveTemplate}
                disabled={!templateName.trim()}
                className="btn-primary flex-1 disabled:opacity-50"
              >
                Save Template
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}