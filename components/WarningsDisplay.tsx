
import React from 'react';
import { WarningMessage } from '../types';

interface WarningsDisplayProps {
  warnings: WarningMessage[];
}

const AlertIcon: React.FC<{severity: 'critical' | 'info'}> = ({ severity }) => {
  const iconColor = severity === 'critical' ? "text-red-400" : "text-blue-400";
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-6 h-6 ${iconColor} mr-3 flex-shrink-0`}>
      {severity === 'critical' ? (
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
      ) : (
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
      )}
    </svg>
  );
};


export function WarningsDisplay({ warnings }: WarningsDisplayProps): React.ReactNode {
  if (warnings.length === 0) {
    return null;
  }

  return (
    <div className="mb-8 space-y-4">
      {warnings.map((warning) => (
        <div
          key={warning.id}
          className={`p-4 rounded-lg flex items-start ${
            warning.severity === 'critical' ? 'bg-red-50 border-l-4 border-red-500' : 'bg-blue-50 border-l-4 border-blue-500'
          }`}
        >
          <AlertIcon severity={warning.severity} />
          <div>
            <h3 className={`text-md font-semibold ${warning.severity === 'critical' ? 'text-red-800' : 'text-blue-800'}`}>
              {warning.severity === 'critical' ? 'Critical Warning' : 'Heads Up!'}
            </h3>
            <p className={`text-sm mt-1 ${warning.severity === 'critical' ? 'text-red-700' : 'text-blue-700'}`}>
              {warning.message}
            </p>
            {warning.recommendation && (
              <p className={`text-sm mt-1 ${warning.severity === 'critical' ? 'text-red-600' : 'text-blue-600'}`}>
                <strong>Recommendation:</strong> {warning.recommendation}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
    