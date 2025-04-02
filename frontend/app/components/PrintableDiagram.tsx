'use client';

import { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

interface Props {
  chart: string;
}

export default function PrintableDiagram({ chart }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
  
    mermaid.initialize({ startOnLoad: false });
  
    const id = 'diagram-' + Math.random().toString(36).substring(2, 10);
  
    // Clean up any leading ">" or markdown junk
    const cleanedChart = chart
      .split('\n')
      .map(line => line.replace(/^>\s*/, ''))
      .join('\n')
      .trim();
  
    // ✅ Check if it looks like a real diagram
    if (!/^graph\s+[A-Z]+;/.test(cleanedChart)) {
      console.warn('⚠️ Skipping render — no valid diagram found:', cleanedChart);
      return;
    }
  
    mermaid
      .render(id, cleanedChart)
      .then(({ svg }) => {
        ref.current!.innerHTML = svg;
      })
      .catch((err) => {
        console.error('Mermaid render error:', err);
      });
  }, [chart]);

  return (
    <div ref={ref} className="p-4 bg-white" />
  );
}