'use client';

import { useRef, useState } from 'react';
import PrintableDiagram from './PrintableDiagram';
import { useReactToPrint } from 'react-to-print';

interface Props {
  chart: string;
  rawArchitecture?: string;
}

export default function MermaidRenderer({ chart, rawArchitecture = '' }: Props) {
  const printRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(chart);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleSave = () => {
    try {
      const timestamp = new Date().toISOString();
      const key = `diagram-${timestamp}`;
      localStorage.setItem(key, JSON.stringify({ diagram: chart, raw: rawArchitecture }));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error('Save failed:', err);
    }
  };

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `architecture-diagram-${Date.now()}`,
    onAfterPrint: () => console.log('🖨️ Printed diagram'),
  });

  return (
    <div className="my-6 border border-gray-200 rounded-xl p-4 bg-white shadow-sm space-y-4">
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-500 font-medium">📈 Diagram</span>
        <div className="space-x-2">
          <button
            onClick={handleCopy}
            className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 transition"
          >
            {copied ? '✅ Copied' : 'Copy Code'}
          </button>
          <button
            onClick={handleSave}
            className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200 transition"
          >
            {saved ? '✅ Saved' : 'Save JSON'}
          </button>
          <button
            onClick={() => handlePrint}
            className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded hover:bg-purple-200 transition"
          >
            Export PDF
          </button>
        </div>
      </div>

      <div ref={printRef}>
        <PrintableDiagram chart={chart} />
      </div>
    </div>
  );
}