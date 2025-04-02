'use client';

import { useState } from 'react';
import MermaidRenderer from './components/MermaidRenderer';
import ReactMarkdown from 'react-markdown';

type Architecture = {
  summary: string;
  diagram: string;
  pros: string;
  cons: string;
};

export default function Home() {
  const [description, setDescription] = useState('');
  const [constraints, setConstraints] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/generate-architecture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ system_description: description, constraints }),
      });
      const data = await response.json();
      setResult(data.result);
    } catch (err) {
      setResult('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const extractArchitectures = (markdown: string): Architecture[] => {
    const blocks = markdown.split(/###?\s*Architecture (Solution|Option) \d+:?/i).filter(Boolean);

    return blocks.map((block) => {
      let diagram = '';

      // Try proper ```mermaid``` block
      const diagramMatch = block.match(/```mermaid\s*([\s\S]*?)```/);

      if (diagramMatch) {
        diagram = diagramMatch[1].trim();
      } else {
        // Fallback: try to find raw diagram lines
        const rawLines = block.match(/graph\s+\w+;[\s\S]*?(?=(\n\n|Pros:|Cons:|$))/i);
        if (rawLines) {
          diagram = rawLines[0].trim();
        }
      }

      const prosMatch = block.match(/(?:Pros|✅\s*\*\*Pros\*\*):\s*([\s\S]*?)(?=\n+(?:Cons|❌\s*\*\*Cons\*\*)|```|graph|$)/i);
const consMatch = block.match(/(?:Cons|❌\s*\*\*Cons\*\*):\s*([\s\S]*?)(?=\n+```|graph|$)/i);
      return {
        summary: block.trim().split('\n').slice(0, 5).join('\n'),
        diagram,
        pros: prosMatch ? prosMatch[1].trim() : 'N/A',
        cons: consMatch ? consMatch[1].trim() : 'N/A',
      };
    });
  };

  const architectures = extractArchitectures(result);

  return (
    <main className="min-h-screen p-6 bg-gray-100 text-black">
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">AI System Architecture Generator</h1>

        <textarea
          className="w-full p-3 border rounded text-black"
          rows={3}
          placeholder="Describe your system..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <input
          className="w-full p-3 border rounded text-black"
          placeholder="Constraints (e.g. scalable, cost-sensitive)"
          value={constraints}
          onChange={(e) => setConstraints(e.target.value)}
        />

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {loading ? 'Generating...' : 'Generate Architecture'}
        </button>

        {result && (
          <div className="mt-8 space-y-6 text-black">
            {architectures.length === 0 && <p>No architecture sections found.</p>}

            {architectures.map((arch, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow"
              >
                <h2 className="text-2xl font-bold text-blue-700 mb-4">
                  Architecture Option {index + 1}
                </h2>

                <div className="mb-4">
                  <h3 className="font-semibold text-gray-800 mb-1">🧠 Summary</h3>
                  <p className="text-gray-700 whitespace-pre-line">{arch.summary}</p>
                </div>

                {arch.diagram && (
                  <div className="my-4">
                    <h3 className="font-semibold text-gray-800 mb-2">📈 Diagram</h3>
                    <MermaidRenderer chart={arch.diagram} rawArchitecture={arch.diagram} />
                  </div>
                )}

                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-green-700">✅ Pros</h3>
                    {arch.pros ? (
                      <ReactMarkdown
                        components={{
                          p: ({ ...props }) => (
                            <p className="text-green-800 whitespace-pre-line" {...props} />
                          ),
                          li: ({ ...props }) => (
                            <li className="ml-4 list-disc text-green-800" {...props} />
                          ),
                        }}
                      >
                        {arch.pros}
                      </ReactMarkdown>
                    ) : (
                      <p className="text-sm italic text-gray-400">No pros listed by the AI.</p>
                    )}
                  </div>

                  <div>
                    <h3 className="font-semibold text-red-700">❌ Cons</h3>
                    {arch.cons ? (
                      <ReactMarkdown
                        components={{
                          p: ({ ...props }) => (
                            <p className="text-red-800 whitespace-pre-line" {...props} />
                          ),
                          li: ({ ...props }) => (
                            <li className="ml-4 list-disc text-red-800" {...props} />
                          ),
                        }}
                      >
                        {arch.cons}
                      </ReactMarkdown>
                    ) : (
                      <p className="text-sm italic text-gray-400">No cons listed by the AI.</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}