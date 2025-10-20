import { useEffect, useState, useCallback } from 'react';
import ReactFlow, {
  Controls,
  Background,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
} from 'reactflow';
import 'reactflow/dist/style.css';

// FIX for #002: Define nodeTypes outside the component to prevent re-renders
const nodeTypes = {};

const position = { x: 0, y: 0 };
const edgeType = 'smoothstep';

// Function to create nodes and edges from the mind map data
const createLayout = (mindMapData) => {
  const initialNodes = [];
  const initialEdges = [];
  let nodeId = 1;
  const nodeWidth = 150;
  const nodeHeight = 40;
  const verticalGap = 50;
  const horizontalGap = 50;

  function traverse(node, parentId = null, x = 0, y = 0, level = 0) {
    const id = `${nodeId++}`;
    initialNodes.push({
      id,
      data: { label: node.topic },
      position: { x, y },
      style: {
        width: nodeWidth,
        textAlign: 'center',
        backgroundColor: level === 0 ? '#2563eb' : '#374151',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
      },
    });

    if (parentId) {
      initialEdges.push({
        id: `e${parentId}-${id}`,
        source: parentId,
        target: id,
        type: edgeType,
      });
    }

    if (node.children && node.children.length > 0) {
      const childrenCount = node.children.length;
      const totalWidth = childrenCount * (nodeWidth + horizontalGap) - horizontalGap;
      let currentX = x - totalWidth / 2 + nodeWidth / 2;

      node.children.forEach((child) => {
        traverse(child, id, currentX, y + nodeHeight + verticalGap, level + 1);
        currentX += nodeWidth + horizontalGap;
      });
    }
  }

  if (mindMapData && mindMapData.root) {
    traverse(mindMapData.root);
  }

  return { nodes: initialNodes, edges: initialEdges };
};

function MindMap({ mindMapData }) {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);

  useEffect(() => {
    if (mindMapData) {
      const { nodes: newNodes, edges: newEdges } = createLayout(mindMapData);
      setNodes(newNodes);
      setEdges(newEdges);
    }
  }, [mindMapData]);

  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [setNodes]
  );
  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [setEdges]
  );
  const onConnect = useCallback(
    (connection) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges]
  );

  return (
    // FIX for #004: Add a wrapper with explicit height
    <div style={{ height: '100%' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes} // Pass the memoized nodeTypes
        fitView
        className="bg-gray-900"
      >
        <Background color="#4b5563" />
        <Controls />
      </ReactFlow>
    </div>
  );
}

export default MindMap;

