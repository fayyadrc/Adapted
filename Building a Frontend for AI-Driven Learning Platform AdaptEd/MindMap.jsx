import React, { useCallback, useState } from 'react';
import Tree from 'react-d3-tree';
import { PlusIcon, MinusIcon } from 'lucide-react';

// Data transformation from user's format to react-d3-tree format
const transformData = (node) => {
  if (!node) return null;
  const { topic, children, ...rest } = node;
  return {
    name: topic,
    attributes: { ...rest },
    children: children ? children.map(transformData) : [],
  };
};

// Custom node style to match NotebookLM
const renderNode = ({ nodeDatum, toggleNode }) => (
  <g>
    <rect
      width="200"
      height="50"
      x="-100"
      y="-25"
      rx="25"
      fill="#F4F7FF"
      stroke="#D0D9FF"
      strokeWidth="1"
      onClick={toggleNode}
    />
    <text
      fill="black"
      strokeWidth="0"
      x="0"
      y="4" // Centered vertically
      textAnchor="middle"
      style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px' }}
    >
      {nodeDatum.name}
    </text>
    {nodeDatum.attributes?.summary && (
      <title>{nodeDatum.attributes.summary}</title> // Tooltip on hover
    )}
  </g>
);

const MindMap = ({ data }) => {
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(0.6);

  const containerRef = useCallback((containerElem) => {
    if (containerElem !== null) {
      const { width, height } = containerElem.getBoundingClientRect();
      setTranslate({ x: width / 4, y: height / 2 }); // Center the root node initially
    }
  }, []);

  const handleZoom = (direction) => {
    const zoomFactor = 1.2;
    if (direction === 'in') {
      setZoom((prevZoom) => prevZoom * zoomFactor);
    } else if (direction === 'out') {
      setZoom((prevZoom) => prevZoom / zoomFactor);
    }
  };

  const treeData = data && data.root ? transformData(data.root) : null;

  if (!treeData) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-500">
        Mind Map data is not available or is in the wrong format.
      </div>
    );
  }

  return (
    <div className="w-full h-[70vh] bg-white rounded-lg border shadow-sm relative" ref={containerRef}>
      <Tree
        data={treeData}
        orientation="horizontal"
        translate={translate}
        zoom={zoom}
        onZoom={(zoom) => setZoom(zoom.zoom)} // Allow zoom with mouse/trackpad
        separation={{ siblings: 1.5, nonSiblings: 2 }}
        depthFactor={300} // Horizontal spacing
        renderCustomNodeElement={renderNode}
        styles={{
          links: {
            stroke: '#d1d5db', // Light gray connectors
            strokeWidth: 2,
          },
        }}
      />
      <div className="absolute bottom-4 right-4 flex items-center space-x-2">
        <button
          onClick={() => handleZoom('in')}
          className="p-2 bg-white border rounded-full shadow-md hover:bg-gray-100 transition"
          aria-label="Zoom in"
        >
          <PlusIcon className="w-5 h-5 text-gray-600" />
        </button>
        <button
          onClick={() => handleZoom('out')}
          className="p-2 bg-white border rounded-full shadow-md hover:bg-gray-100 transition"
          aria-label="Zoom out"
        >
          <MinusIcon className="w-5 h-5 text-gray-600" />
        </button>
      </div>
    </div>
  );
};

export default MindMap;
