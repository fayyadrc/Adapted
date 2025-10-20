import { useEffect, useState, useCallback } from 'react';
import ReactFlow, {
  Controls,
  Background,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
} from 'reactflow';
import 'reactflow/dist/style.css';

const nodeTypes = {
  /* you can define custom node types here if needed */
};

// This function transforms your AI-generated data into nodes and edges for React Flow.
const createLayout = (mindMapData) => {
  const initialNodes = [];
  const initialEdges = [];
  let nodeId = 1;

  function traverse(node, parentId = null, x = 0, y = 0) {
    if (!node || !node.topic) return;

    const id = `${nodeId++}`;
    const isRoot = parentId === null;

    initialNodes.push({
      id,
      data: { label: node.topic },
      position: { x, y },
      style: {
        background: isRoot ? '#0ea5e9' : '#334155',
        color: 'white',
        border: '1px solid #475569',
        borderRadius: '8px',
        width: 180,
        textAlign: 'center',
        padding: 10,
      },
    });

    if (parentId) {
      initialEdges.push({
        id: `e${parentId}-${id}`,
        source: parentId,
        target: id,
        animated: true,
        style: { stroke: '#475569' },
      });
    }

    if (node.children && node.children.length > 0) {
      const childXOffset = x - (node.children.length - 1) * 125;
      node.children.forEach((child, index) => {
        traverse(child, id, childXOffset + index * 250, y + 120);
      });
    }
  }


  let rootNode = null;
  console.log("Received data for layout:", mindMapData); // Log the data to see its structure

  if (mindMapData) {
    if (mindMapData.root && typeof mindMapData.root === 'object') {
      rootNode = mindMapData.root;
    } else if (mindMapData.mindmap && typeof mindMapData.mindmap === 'object') {
      // Handle cases where the root key is "mindmap"
      rootNode = mindMapData.mindmap;
    } else if (mindMapData.topic) {
      // Handle cases where the data itself is the root node
      rootNode = mindMapData;
    } else if (Array.isArray(mindMapData) && mindMapData.length > 0 && mindMapData[0].topic) {
      // Handle cases where the AI wraps the object in an array
      rootNode = mindMapData[0];
    }
  }
  
  if (rootNode) {
    traverse(rootNode);
  } else {
    console.error("Could not find a valid root node in the provided data.", mindMapData);
  }

  return { nodes: initialNodes, edges: initialEdges };
};

function MindMap({ data }) {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);

  useEffect(() => {
    if (data) {
      const { nodes: newNodes, edges: newEdges } = createLayout(data);
      if (newNodes.length > 0) {
        setNodes(newNodes);
        setEdges(newEdges);
      }
    } else {
      // Clear the map if data is null
      setNodes([]);
      setEdges([]);
    }
  }, [data]);

  const onNodesChange = useCallback((changes) => setNodes((nds) => applyNodeChanges(changes, nds)), []);
  const onEdgesChange = useCallback((changes) => setEdges((eds) => applyEdgeChanges(changes, eds)), []);
  const onConnect = useCallback((connection) => setEdges((eds) => addEdge(connection, eds)), []);

  return (
    <div className="mt-8 rounded-lg overflow-hidden border border-gray-700" style={{ width: '100%', height: '600px' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        className="bg-gray-900"
      >
        <Background color="#4b5563" variant="dots" gap={12} size={1} />
        <Controls />
      </ReactFlow>
    </div>
  );
}

export default MindMap;

