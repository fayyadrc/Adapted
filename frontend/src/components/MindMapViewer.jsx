import { useEffect, useMemo, useRef, useState } from 'react';
import mermaid from 'mermaid';

const escapeLabel = (value) => {
  if (!value) return '';
  return value
    .replace(/"/g, '\\"')
    .replace(/[\u0000-\u001F\u007F]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

const buildMermaidMindmap = (root) => {
  const lines = ['mindmap'];
  let counter = 0;

  const walk = (node, level = 0) => {
    if (!node) return;

    const indent = '  '.repeat(level + 1);
    const nodeId = `n_${counter++}`;

    const labelParts = [];
    if (node.topic) labelParts.push(node.topic);
    if (node.summary) labelParts.push(`Summary: ${node.summary}`);
    if (node.definition) labelParts.push(`Definition: ${node.definition}`);

    const label = labelParts.length > 0 ? labelParts.join(' - ') : 'Untitled';
    const className = level === 0 ? 'level0' : level === 1 ? 'level1' : level === 2 ? 'level2' : 'levelDefault';

    lines.push(`${indent}${nodeId}["${escapeLabel(label)}"]:::${className}`);

    if (node.children && node.children.length > 0) {
      node.children.forEach((child) => walk(child, level + 1));
    }
  };

  walk(root);

  lines.push(
    '',
    'classDef level0 fill:#ede9fe,stroke:#8b5cf6,stroke-width:3px,color:#1f2937,font-size:16px;',
    'classDef level1 fill:#eff6ff,stroke:#3b82f6,stroke-width:2px,color:#1f2937,font-size:14px;',
    'classDef level2 fill:#f3f4f6,stroke:#6b7280,stroke-width:1.5px,color:#1f2937,font-size:13px;',
    'classDef levelDefault fill:#f8fafc,stroke:#94a3b8,stroke-width:1px,color:#1f2937,font-size:12px;'
  );

  return lines.join('\n');
};

const MindMapViewer = ({ mindMapData }) => {
  const containerRef = useRef(null);
  const initializedRef = useRef(false);
  const [renderError, setRenderError] = useState(null);

  const diagramDefinition = useMemo(() => {
    if (!mindMapData || !mindMapData.root) {
      return null;
    }
    return buildMermaidMindmap(mindMapData.root);
  }, [mindMapData]);

  useEffect(() => {
    if (initializedRef.current) return;

    mermaid.initialize({
      startOnLoad: false,
      theme: 'base',
      securityLevel: 'loose',
      maxTextSize: 200000,
    });

    initializedRef.current = true;
  }, []);

  useEffect(() => {
    let isActive = true;

    const renderDiagram = async () => {
      if (!containerRef.current || !diagramDefinition) return;

      setRenderError(null);
      containerRef.current.innerHTML = '';

      try {
        const { svg } = await mermaid.render(`mindmap-${Date.now()}`, diagramDefinition);
        if (isActive && containerRef.current) {
          containerRef.current.innerHTML = svg;
        }
      } catch (error) {
        if (isActive) {
          setRenderError('We could not render this mind map. Please try again with a simpler structure.');
          console.error('Mermaid render failed', error);
        }
      }
    };

    renderDiagram();

    return () => {
      isActive = false;
    };
  }, [diagramDefinition]);

  if (!diagramDefinition) {
    return (
      <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-6 h-48 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-3">🧠</div>
          <p className="text-gray-700 font-semibold mb-2">Mind Map Preview</p>
          <p className="text-gray-600 text-sm">No mind map data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-96 border border-gray-200 rounded-lg bg-white overflow-auto">
      {renderError ? (
        <div className="h-full flex items-center justify-center text-sm text-red-500 px-6 text-center">
          {renderError}
        </div>
      ) : (
        <div ref={containerRef} className="min-h-full flex items-center justify-center p-6 text-gray-800" />
      )}
    </div>
  );
};

export default MindMapViewer;