import React, { useState, useCallback } from 'react';
import ReactFlow, {
  addEdge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
} from 'reactflow';
import 'reactflow/dist/style.css';

// Custom node component for mind map nodes
const MindMapNode = ({ data }) => {
  return (
    <div className={`px-4 py-2 shadow-md rounded-lg bg-white border-2 ${
      data.level === 0 
        ? 'border-purple-500 bg-purple-50' 
        : data.level === 1 
        ? 'border-blue-500 bg-blue-50'
        : 'border-gray-300 bg-gray-50'
    }`}>
      <div className="font-semibold text-sm">{data.topic}</div>
      {data.summary && (
        <div className="text-xs text-gray-600 mt-1 max-w-32">{data.summary}</div>
      )}
      {data.definition && (
        <div className="text-xs text-purple-600 mt-1 max-w-32 italic">{data.definition}</div>
      )}
    </div>
  );
};

const nodeTypes = {
  mindMapNode: MindMapNode,
};

const MindMapViewer = ({ mindMapData }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Convert mind map data to ReactFlow format
  React.useEffect(() => {
    if (!mindMapData || !mindMapData.root) return;

    const convertToNodes = (node, level = 0, parentId = null, x = 0, y = 0) => {
      const nodes = [];
      const edges = [];
      
      const nodeId = `${node.topic}-${level}-${x}-${y}`;
      
      // Create the node
      nodes.push({
        id: nodeId,
        type: 'mindMapNode',
        position: { x, y },
        data: {
          topic: node.topic,
          summary: node.summary,
          definition: node.definition,
          level: level
        },
        draggable: true,
      });

      // Create edge from parent if this isn't the root
      if (parentId) {
        edges.push({
          id: `${parentId}-${nodeId}`,
          source: parentId,
          target: nodeId,
          type: 'smoothstep',
          style: { stroke: level === 1 ? '#8b5cf6' : '#6b7280' },
        });
      }

      // Process children
      if (node.children && node.children.length > 0) {
        const childSpacing = 200;
        const startY = y - ((node.children.length - 1) * childSpacing) / 2;
        
        node.children.forEach((child, index) => {
          const childX = x + 300;
          const childY = startY + (index * childSpacing);
          
          const { nodes: childNodes, edges: childEdges } = convertToNodes(
            child, 
            level + 1, 
            nodeId, 
            childX, 
            childY
          );
          
          nodes.push(...childNodes);
          edges.push(...childEdges);
        });
      }

      return { nodes, edges };
    };

    const { nodes: flowNodes, edges: flowEdges } = convertToNodes(mindMapData.root, 0, null, 0, 0);
    setNodes(flowNodes);
    setEdges(flowEdges);
  }, [mindMapData, setNodes, setEdges]);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  if (!mindMapData || !mindMapData.root) {
    return (
      <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-6 h-48 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-3">🗺️</div>
          <p className="text-gray-700 font-semibold mb-2">Mind Map Preview</p>
          <p className="text-gray-600 text-sm">No mind map data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-96 border border-gray-200 rounded-lg bg-white">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-left"
      >
        <Background color="#f1f5f9" gap={16} />
        <Controls />
        <MiniMap 
          nodeColor={(node) => {
            switch (node.data?.level) {
              case 0: return '#8b5cf6';
              case 1: return '#3b82f6';
              default: return '#6b7280';
            }
          }}
          className="!bg-white !border-gray-300"
        />
      </ReactFlow>
    </div>
  );
};

export default MindMapViewer;