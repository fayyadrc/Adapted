import React, {
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
  forwardRef,
} from 'react';
import ReactFlow, {
  addEdge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
} from 'reactflow';
import 'reactflow/dist/style.css';
import dagre from 'dagre';
import { Download, Maximize2, Minimize2, RefreshCw, Save } from 'lucide-react';
import { toPng } from 'html-to-image';

// --- Custom MindMapNode ---
const MindMapNode = ({ data }) => {
  let nodeClasses = 'px-6 py-4 shadow-md rounded-lg border-2 max-w-xs ';
  let topicClasses = 'font-semibold text-base ';
  let textClasses = 'text-sm mt-1 ';

  if (data.isDefinition) {
    nodeClasses += 'bg-gray-50 border-gray-300';
    topicClasses += 'text-gray-700 italic font-normal';
  } else if (data.level === 0) {
    nodeClasses += 'bg-purple-50 border-purple-300';
    topicClasses += 'text-purple-700';
    textClasses += 'text-purple-600';
  } else if (data.level === 1) {
    nodeClasses += 'bg-blue-50 border-blue-300';
    topicClasses += 'text-blue-700';
    textClasses += 'text-blue-600';
  } else {
    nodeClasses += 'bg-cyan-50 border-cyan-300';
    topicClasses += 'text-cyan-700';
    textClasses += 'text-cyan-600';
  }

  return (
    <>
      {data.level > 0 && (
        <Handle
          type="target"
          position={Position.Left}
          style={{ background: '#cbd5e1', border: 'none', width: '8px', height: '8px' }}
        />
      )}
      <div className={nodeClasses}>
        <div className={topicClasses}>{data.topic}</div>
        {data.summary && !data.isDefinition && (
          <div className={`${textClasses} opacity-80`}>{data.summary}</div>
        )}
      </div>
      {!data.isDefinition && (
        <Handle
          type="source"
          position={Position.Right}
          style={{ background: '#cbd5e1', border: 'none', width: '8px', height: '8px' }}
        />
      )}
    </>
  );
};

const nodeTypes = {
  mindMapNode: MindMapNode,
};

// --- Dagre Auto-Layout Logic ---
const nodeWidth = 350;
const nodeHeight = 100;

const getLayoutedElements = (nodes, edges, direction = 'LR') => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: direction, nodesep: 10, ranksep: 100 });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  nodes.forEach((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    node.targetPosition = Position.Left;
    node.sourcePosition = Position.Right;

    node.position = {
      x: nodeWithPosition.x - nodeWidth / 2,
      y: nodeWithPosition.y - nodeHeight / 2,
    };

    return node;
  });

  return { nodes, edges };
};

const MindMapViewer = forwardRef(({ mindMapData }, ref) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const previousOverflowRef = useRef('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const reactFlowInstance = useRef(null);
  const [isSaving, setIsSaving] = useState(false);

  useLayoutEffect(() => {
    if (!mindMapData || !mindMapData.root) return;

    const initialNodes = [];
    const initialEdges = [];
    let nodeCounter = 0;

    const generateNodeId = () => {
      nodeCounter += 1;
      return `node-${nodeCounter}`;
    };

    const convertToNodes = (node, level = 0, parentId = null) => {
      if (!node || typeof node.topic !== 'string' || !node.topic.trim()) {
        return;
      }

      const nodeId = generateNodeId();

      initialNodes.push({
        id: nodeId,
        type: 'mindMapNode',
        position: { x: 0, y: 0 },
        data: {
          topic: node.topic,
          summary: node.summary,
          level,
          isDefinition: node.isDefinition || false,
        },
        draggable: true,
      });

      if (parentId) {
        initialEdges.push({
          id: `edge-${parentId}-${nodeId}`,
          source: parentId,
          target: nodeId,
          type: 'smoothstep',
          style: { stroke: '#cbd5e1', strokeWidth: 2 },
        });
      }

      const childBranches = Array.isArray(node.children) ? [...node.children] : [];
      if (node.definition) {
        const definitionNode = {
          topic: node.definition,
          isDefinition: true,
          children: [],
        };
        childBranches.unshift(definitionNode);
      }

      childBranches.forEach((child) => {
        convertToNodes(child, level + 1, nodeId);
      });
    };

    convertToNodes(mindMapData.root);

    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      initialNodes,
      initialEdges
    );

    setNodes(layoutedNodes);
    setEdges(layoutedEdges);

    if (reactFlowInstance.current) {
      reactFlowInstance.current.fitView({ padding: 0.2, duration: 400 });
    }
  }, [mindMapData, setNodes, setEdges]);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge({ ...params, type: 'smoothstep', style: { stroke: '#cbd5e1', strokeWidth: 2 } }, eds)),
    [setEdges]
  );

  useEffect(() => {
    if (typeof document === 'undefined') return undefined;

    if (isFullscreen) {
      previousOverflowRef.current = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = previousOverflowRef.current || '';
        previousOverflowRef.current = '';
      };
    }

    document.body.style.overflow = previousOverflowRef.current || '';
    previousOverflowRef.current = '';

    return undefined;
  }, [isFullscreen]);

  useEffect(() => {
    if (reactFlowInstance.current) {
      reactFlowInstance.current.fitView({ padding: 0.2, duration: 400 });
    }
  }, [isFullscreen, mindMapData]);

  const handleDownload = () => {
    if (!mindMapData) return;
    const blob = new Blob([JSON.stringify(mindMapData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${mindMapData?.root?.topic || 'mind-map'}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleSaveToDatabase = async () => {
    if (!reactFlowInstance.current) return;
    setIsSaving(true);
    try {
      const flowElement = document.querySelector('.react-flow');
      if (!flowElement) throw new Error("Flow element not found");

      const dataUrl = await toPng(flowElement, {
        backgroundColor: '#f1f5f9',
        width: flowElement.offsetWidth * 2,
        height: flowElement.offsetHeight * 2,
        style: {
          width: flowElement.offsetWidth + 'px',
          height: flowElement.offsetHeight + 'px',
          transform: 'scale(2)',
          transformOrigin: 'top left'
        }
      });

      const res = await fetch(dataUrl);
      const blob = await res.blob();

      const formData = new FormData();
      formData.append('file', blob, 'mindmap.png');

      const uploadRes = await fetch('http://localhost:5000/api/upload-image', {
        method: 'POST',
        body: formData,
      });

      if (!uploadRes.ok) throw new Error("Failed to upload image");

      const uploadData = await uploadRes.json();
      const publicUrl = uploadData.url;
      console.log("Mind map image uploaded to:", publicUrl);

      alert("Mind Map image saved successfully!");

    } catch (err) {
      console.error("Error saving mind map:", err);
      alert("Failed to save: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleFullscreen = () => {
    setIsFullscreen((prev) => !prev);
  };

  const handleResetView = () => {
    reactFlowInstance.current?.fitView({ padding: 0.2, duration: 400 });
  };

  useImperativeHandle(ref, () => ({
    openFullscreen: () => setIsFullscreen(true),
    exitFullscreen: () => setIsFullscreen(false),
    downloadMindMap: handleDownload,
    resetView: handleResetView,
  }));

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

  const containerClassName = isFullscreen
    ? 'fixed inset-0 z-50 bg-white flex flex-col shadow-xl'
    : 'relative h-[70vh] border border-gray-200 rounded-lg bg-white overflow-hidden shadow-sm';

  const flowContainerClassName = isFullscreen ? 'relative flex-1' : 'relative h-full';

  return (
    <div className={containerClassName}>
      {isFullscreen && (
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Mind Map</h2>
            <p className="text-sm text-gray-500">Drag to explore. Use zoom controls to adjust the view.</p>
          </div>
          <button
            onClick={handleToggleFullscreen}
            className="inline-flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition"
          >
            <Minimize2 className="w-4 h-4" />
            Minimize
          </button>
        </div>
      )}
      <div className={flowContainerClassName}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
          attributionPosition="bottom-left"
          onInit={(instance) => {
            reactFlowInstance.current = instance;
            instance.fitView({ padding: 0.2 });
          }}
          style={{ width: '100%', height: '100%' }}
        >
          <Background color="#f1f5f9" gap={16} />
          <Controls />
          <MiniMap
            nodeColor={(node) => {
              if (node.data?.isDefinition) return '#94a3b8';
              switch (node.data?.level) {
                case 0:
                  return '#a855f7';
                case 1:
                  return '#2563eb';
                default:
                  return '#06b6d4';
              }
            }}
            className="!bg-white !border-gray-300"
          />
        </ReactFlow>

        <div className="pointer-events-none absolute top-4 right-4 z-10 flex flex-col gap-2">
          <button
            onClick={handleSaveToDatabase}
            disabled={isSaving}
            className="pointer-events-auto p-2 bg-white border rounded-md shadow hover:bg-gray-100 transition disabled:opacity-50"
            title="Save to Database"
          >
            <Save className={`w-5 h-5 ${isSaving ? 'text-gray-400' : 'text-indigo-600'}`} />
          </button>
          <button
            onClick={handleDownload}
            className="pointer-events-auto p-2 bg-white border rounded-md shadow hover:bg-gray-100 transition"
            aria-label="Download mind map JSON"
          >
            <Download className="w-5 h-5 text-gray-600" />
          </button>
          <button
            onClick={handleToggleFullscreen}
            className="pointer-events-auto p-2 bg-white border rounded-md shadow hover:bg-gray-100 transition"
            aria-label={isFullscreen ? 'Exit full screen' : 'Enter full screen'}
          >
            {isFullscreen ? (
              <Minimize2 className="w-5 h-5 text-gray-600" />
            ) : (
              <Maximize2 className="w-5 h-5 text-gray-600" />
            )}
          </button>
          <button
            onClick={handleResetView}
            className="pointer-events-auto p-2 bg-white border rounded-md shadow hover:bg-gray-100 transition"
            aria-label="Re-center mind map"
          >
            <RefreshCw className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>
    </div>
  );
});

MindMapViewer.displayName = 'MindMapViewer';

export default MindMapViewer;