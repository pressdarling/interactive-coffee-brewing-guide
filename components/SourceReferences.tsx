
import React, { useState } from 'react';
import { SOURCE_REFERENCES } from '../constants';

export function SourceReferences(): React.ReactNode {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mt-12 bg-gray-50 p-6 rounded-lg shadow">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center text-left text-lg font-semibold text-gray-700 hover:text-indigo-600 transition-colors"
        aria-expanded={isOpen}
        aria-controls="source-references-content"
      >
        Source References & Further Reading
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-6 h-6 transition-transform ${isOpen ? 'transform rotate-180' : ''}`}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>
      {isOpen && (
        <div id="source-references-content" className="mt-4">
          <p className="text-sm text-gray-600 mb-4">
            This guide synthesizes information from various expert sources. For deeper dives, please consult the original content:
          </p>
          <ul className="list-disc list-inside space-y-2">
            {SOURCE_REFERENCES.map((ref) => (
              <li key={ref.name} className="text-sm">
                <a
                  href={ref.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:text-indigo-800 hover:underline"
                >
                  {ref.name}
                </a>
              </li>
            ))}
          </ul>
          <p className="text-xs text-gray-500 mt-6">
            Note: Brewing is both an art and a science. These are guidelines; feel free to experiment and adjust to your taste!
          </p>
        </div>
      )}
    </div>
  );
}
    