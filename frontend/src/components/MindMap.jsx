import { useEffect, useState, useCallback } from 'react';
import ReactFlow, {
  Controls,
  Background,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  useReactFlow,
  ReactFlowProvider,
  Handle,
  Position,
} from 'reactflow';
import 'reactflow/dist/style.css';



const baseStyle = {
  color: 'white',
  border: '1px solid',
  borderRadius: '8px',
  width: 250,
  minHeight: 80,
  textAlign: 'center',
  padding: 10,
  boxShadow: '4px 4px 10px rgba(0,0,0,0.4)',
  whiteSpace: 'normal',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '1rem',
};


const CustomNode = ({ data }) => (
  <div style={{ ...baseStyle, background: '#334155', borderColor: '#475569' }}>
    <Handle type="target" position={Position.Left} style={{ background: '#94a3b8' }} />
    <div className="font-semibold">{data.label}</div>
    <Handle type="source" position={Position.Right} style={{ background: '#94a3b8' }} />
  </div>
);


const DefinitionNode = ({ data }) => (
  <div style={{ 
    ...baseStyle, 
    background: '#16a34a', 
    borderColor: '#22c55e',
    fontSize: '0.9rem',
    minHeight: 'auto', 
  }}>
    <Handle type="target" position={Position.Left} style={{ background: '#94a3b8' }} />
    <div className="font-medium text-left">
      <span className="font-bold block mb-1">Definition:</span>
      {data.summary}
    </div>
  </div>
);


const nodeTypes = {
  custom: CustomNode,
  definition: DefinitionNode,
};

const NODE_WIDTH = 250;
const NODE_HEIGHT = 80; 
const X_SPACING = 300; 
const Y_SPACING = 100; 


function getSubtreeHeight(node) {
  
  let childrenForLayout = [...(node.layoutChildren || node.children || [])];
  
  if (childrenForLayout.length === 0) {
    
    return node.isDefinition ? 120 : NODE_HEIGHT; 
  }
  
  
  const childrenHeight = childrenForLayout.reduce((sum, child) => {
    return sum + getSubtreeHeight(child);
  }, 0);
  const totalSpacing = (childrenForLayout.length - 1) * Y_SPACING;

  return childrenHeight + totalSpacing;
}



const createLayout = (mindMapData) => {
  const initialNodes = [];
  const initialEdges = [];
  let nodeIdCounter = 1;

  
  function traverseAndLayout(node, parentId = null, x = 0, yOffset = 0) {
    if (!node || !node.topic) return { maxY: yOffset, minY: yOffset, id: null };

    
    let childrenForLayout = [...(node.children || [])];
    
    
    if (node.definition && typeof node.definition === 'string' && !node.isDefinition) {
        const definitionNode = {
            topic: node.topic, 
            summary: node.definition, 
            isDefinition: true,
            children: [] 
        };
        childrenForLayout.unshift(definitionNode);
    }
    node.layoutChildren = childrenForLayout;
    
    const id = `${nodeIdCounter++}`;
    const isRoot = parentId === null;
    const isDefinition = node.isDefinition || false;
    const subtreeHeight = getSubtreeHeight(node);
    
    let nodeY = yOffset;
    if (node.layoutChildren && node.layoutChildren.length > 0) {
        const childrenSpan = subtreeHeight - (isDefinition ? 120 : NODE_HEIGHT); // Use accurate height for node itself
        nodeY = yOffset + childrenSpan / 2;
    }

    
    let typeString = isRoot ? 'default' : (isDefinition ? 'definition' : 'custom');

    initialNodes.push({
      id,
      data: { 
        label: node.topic, 
        summary: node.summary, 
        definition: node.definition,
        isDefinition 
      },
      position: { x: x, y: nodeY },
      type: typeString, 
    });

    if (parentId) {
      initialEdges.push({
        id: `e${parentId}-${id}`,
        source: parentId,
        target: id,
        type: 'smoothstep',
        animated: true,
        style: { stroke: isRoot ? '#0ea5e9' : (isDefinition ? '#16a34a' : '#475569'), strokeWidth: 2 },
      });
    }

    let currentChildY = yOffset;
    
    
    const nextX = x + X_SPACING;

    if (node.layoutChildren && node.layoutChildren.length > 0) {
      
      const firstChildHeight = getSubtreeHeight(node.layoutChildren[0]);
      
      let totalChildrenHeight = node.layoutChildren.reduce((sum, child) => sum + getSubtreeHeight(child), 0);
      let totalVerticalSpace = totalChildrenHeight - Y_SPACING; 
      currentChildY = nodeY - (totalVerticalSpace / 2);
      
      
      node.layoutChildren.forEach((child) => {
        
        traverseAndLayout(child, id, nextX, currentChildY);
        const currentChildSubtreeHeight = getSubtreeHeight(child);
        currentChildY += currentChildSubtreeHeight + Y_SPACING;
      });
    }
    
    return { id };
  }

  let rootNode = null;
  
  if (mindMapData && typeof mindMapData === 'object') {
    if (mindMapData.root && typeof mindMapData.root === 'object') {
      rootNode = mindMapData.root;
    } else if (mindMapData.topic) {
      rootNode = mindMapData;
    }
  }
  
  if (rootNode) {
    traverseAndLayout(rootNode, null, 0, 0);
  } else {
    console.error("Could not find a valid root node in the provided data.", mindMapData);
  }

  return { nodes: initialNodes, edges: initialEdges };
};


function MindMap({ data }) {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [selectedNodeInfo, setSelectedNodeInfo] = useState(null); 
  const { setViewport } = useReactFlow();

  useEffect(() => {
    if (data && Object.keys(data).length > 0) {
      const { nodes: newNodes, edges: newEdges } = createLayout(data);
      if (newNodes.length > 0) {
        setNodes(newNodes);
        setEdges(newEdges);
        
        setTimeout(() => {
            setViewport({ x: 0, y: 0, zoom: 1 }, { duration: 800 });
        }, 50);
      }
    } else {
      setNodes([]);
      setEdges([]);
      setSelectedNodeInfo(null);
    }
  }, [data, setViewport]);

  const onNodesChange = useCallback((changes) => setNodes((nds) => applyNodeChanges(changes, nds)), []);
  const onEdgesChange = useCallback((changes) => setEdges((eds) => applyEdgeChanges(changes, eds)), []);
  const onConnect = useCallback((connection) => setEdges((eds) => addEdge(connection, eds)), []);

  
  const onNodeClick = useCallback((event, node) => {
    const topic = node.data.label;
    
    
    const summaryContent = node.data.summary || node.data.definition;
    
    if (node.data.isDefinition || !summaryContent) {
        setSelectedNodeInfo(null);
        return;
    }

    if (summaryContent) {
        setSelectedNodeInfo({
            topic: topic,
            content: summaryContent,
            source: 'AI-Generated Context', 
        });
        setViewport({ x: node.position.x - 100, y: node.position.y - 100, zoom: 1.2 }, { duration: 300 });

    } else {
        setSelectedNodeInfo(null); 
    }

  }, [setViewport]);


  return (
    <div className="mt-8 rounded-lg overflow-hidden border border-gray-700 shadow-xl relative" style={{ width: '100%', height: '600px' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick} 
        nodeTypes={nodeTypes} 
        fitView
        className="bg-gray-900"
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#4b5563" variant="dots" gap={12} size={1} />
        <Controls />
      </ReactFlow>

      
      {selectedNodeInfo && (
        <div 
          className="absolute right-4 top-4 w-72 h-[calc(100%-32px)] bg-gray-800 p-4 rounded-lg shadow-2xl z-10 
                     flex flex-col text-left border border-gray-700"
        >
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-bold text-blue-400 truncate">{selectedNodeInfo.topic}</h3>
            <button 
              onClick={() => setSelectedNodeInfo(null)}
              className="text-gray-400 hover:text-white"
            >
              &times;
            </button>
          </div>

          <div className="flex-grow overflow-y-auto text-gray-300 text-sm">
            <p className="mb-3 text-xs uppercase font-semibold text-gray-500">{selectedNodeInfo.source}</p>
            <p className="leading-relaxed">{selectedNodeInfo.content}</p>
            
            
            <div className="mt-4 pt-3 border-t border-gray-700 text-xs text-gray-500">
                Sources: (Grounded in your document)
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


const FlowWrapper = ({ data }) => (
    <ReactFlowProvider>
        <MindMap data={data} />
    </ReactFlowProvider>
);

export default FlowWrapper;
