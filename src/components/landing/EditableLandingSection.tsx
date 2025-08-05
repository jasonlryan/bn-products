import React, { useState } from 'react';
import { Pencil, Check, X } from 'lucide-react';

interface EditableLandingSectionProps {
  value: string | string[];
  onSave: (value: string | string[]) => void;
  className?: string;
  placeholder?: string;
  multiline?: boolean;
  isList?: boolean;
  children?: React.ReactNode;
}

export function EditableLandingSection({
  value,
  onSave,
  className = '',
  placeholder = 'Click to edit...',
  multiline = false,
  isList = false,
  children,
}: EditableLandingSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(
    Array.isArray(value) ? value.join('\n') : value
  );

  const handleSave = () => {
    if (isList) {
      const listItems = editValue
        .split('\n')
        .map((item) => item.trim())
        .filter((item) => item.length > 0);
      onSave(listItems);
    } else {
      onSave(editValue);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(Array.isArray(value) ? value.join('\n') : value);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className={`relative group ${className}`}>
        {multiline || isList ? (
          <textarea
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            placeholder={placeholder}
            rows={isList ? Math.max(3, editValue.split('\n').length) : 3}
            className="w-full p-3 border-2 border-blue-300 rounded-lg focus:border-blue-500 focus:outline-none resize-none"
            autoFocus
          />
        ) : (
          <input
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            placeholder={placeholder}
            className="w-full p-3 border-2 border-blue-300 rounded-lg focus:border-blue-500 focus:outline-none"
            autoFocus
          />
        )}

        <div className="flex gap-2 mt-2">
          <button
            onClick={handleSave}
            className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
          >
            <Check size={14} />
            Save
          </button>
          <button
            onClick={handleCancel}
            className="flex items-center gap-1 px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
          >
            <X size={14} />
            Cancel
          </button>
        </div>

        {isList && (
          <p className="text-sm text-gray-500 mt-1">
            Enter each item on a new line
          </p>
        )}
      </div>
    );
  }

  return (
    <div
      className={`relative group cursor-pointer hover:bg-gray-50 rounded-lg transition-colors ${className}`}
      onClick={() => setIsEditing(true)}
    >
      {children || (
        <div className="p-2">
          {isList && Array.isArray(value) ? (
            <ul className="space-y-1">
              {value.map((item, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          ) : (
            <span className={value ? '' : 'text-gray-400'}>
              {value || placeholder}
            </span>
          )}
        </div>
      )}

      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Pencil size={16} className="text-gray-400" />
      </div>
    </div>
  );
}
