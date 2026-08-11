import React, { useMemo, useCallback } from 'react';
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  Background,
  Controls,
  Panel,
  Handle,
  Position,
  useReactFlow,
  ReactFlowProvider,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import dagre from 'dagre';
import { Maximize, ZoomIn, ZoomOut, MousePointer2 } from 'lucide-react';
import { Avatar, PersonStatusBadge } from '@/components/forja/ui-kit';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2 } from 'lucide-react';
import { Responsible } from '@/lib/forja-data';
import { cn } from '@/lib/utils';

// --- Dagre Layout Logic ---
const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const nodeWidth = 280;
const nodeHeight = 160;

const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'TB') => {
  dagreGraph.setGraph({ rankdir: direction, nodesep: 70, ranksep: 100 });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  nodes.forEach((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    node.targetPosition = Position.Top;
    node.sourcePosition = Position.Bottom;
    // We are shifting the dagre node position (which is center) to top-left
    node.position = {
      x: nodeWithPosition.x - nodeWidth / 2,
      y: nodeWithPosition.y - nodeHeight / 2,
    };
  });

  return { nodes, edges };
};

// --- Custom Node Component ---
function ResponsibleNode({ data }: { data: { responsible: Responsible; onEdit: (r: Responsible) => void; onDelete: (r: Responsible) => void } }) {
  const { responsible, onEdit, onDelete } = data;
  
  return (
    <div className="surface-card border-primary/20 p-4 shadow-xl min-w-[260px] relative group animate-fade-in ring-1 ring-primary/5">
      <Handle type="target" position={Position.Top} className="!bg-primary !w-3 !h-3 !border-2 !border-background" />
      
      <div className="flex items-start gap-3">
        <Avatar name={responsible.name} size="md" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-col">
            <p className="text-[10px] font-bold uppercase tracking-widest text-primary/70">{responsible.sector || 'Geral'}</p>
            <h4 className="font-display text-sm font-bold text-foreground leading-tight mt-0.5">{responsible.area}</h4>
            {responsible.description && (
              <p className="text-[9px] text-muted-foreground/80 leading-tight italic mt-1 line-clamp-2">
                {responsible.description}
              </p>
            )}
          </div>
          
          <div className="mt-3">
            {responsible.name ? (
              <div className="space-y-1">
                <p className="text-xs font-medium text-foreground truncate">{responsible.name}</p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[10px] text-muted-foreground truncate max-w-[100px]">{responsible.role}</span>
                  <PersonStatusBadge status={responsible.status} className="scale-[0.7] origin-right" />
                </div>
              </div>
            ) : (
              <p className="text-[10px] font-bold text-destructive uppercase">Sem responsável</p>
            )}
          </div>
        </div>
      </div>

      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-surface/80 p-1 rounded-md backdrop-blur-sm">
        <button 
          onClick={(e) => { e.stopPropagation(); onEdit(responsible); }}
          className="p-1 hover:bg-primary-soft rounded text-muted-foreground hover:text-primary transition-colors"
        >
          <Pencil className="size-3" />
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); onDelete(responsible); }}
          className="p-1 hover:bg-destructive/10 rounded text-muted-foreground hover:text-destructive transition-colors"
        >
          <Trash2 className="size-3" />
        </button>
      </div>

      <Handle type="source" position={Position.Bottom} className="!bg-primary !w-3 !h-3 !border-2 !border-background" />
    </div>
  );
}

const nodeTypes = {
  responsible: ResponsibleNode,
};

// --- Flow Internal Component ---
function Flow({ 
  responsibles, 
  onEdit, 
  onDelete 
}: { 
  responsibles: Responsible[];
  onEdit: (r: Responsible) => void;
  onDelete: (r: Responsible) => void;
}) {
  const { fitView, zoomIn, zoomOut, setViewport } = useReactFlow();

  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
    const nodes: Node[] = responsibles.map((r) => ({
      id: r.id,
      type: 'responsible',
      data: { responsible: r, onEdit, onDelete },
      position: { x: 0, y: 0 },
    }));

    const edges: Edge[] = responsibles
      .filter((r) => r.parentId)
      .map((r) => ({
        id: `e-${r.parentId}-${r.id}`,
        source: r.parentId!,
        target: r.id,
        type: 'smoothstep',
        animated: true,
        style: { stroke: 'var(--primary)', strokeWidth: 2, opacity: 0.6 },
      }));

    return getLayoutedElements(nodes, edges);
  }, [responsibles, onEdit, onDelete]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Re-layout if count changes
  React.useEffect(() => {
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      responsibles.map((r) => ({
        id: r.id,
        type: 'responsible',
        data: { responsible: r, onEdit, onDelete },
        position: { x: 0, y: 0 },
      })),
      responsibles
        .filter((r) => r.parentId)
        .map((r) => ({
          id: `e-${r.parentId}-${r.id}`,
          source: r.parentId!,
          target: r.id,
          type: 'smoothstep',
          animated: true,
          style: { stroke: 'var(--primary)', strokeWidth: 2, opacity: 0.6 },
        }))
    );
    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
  }, [responsibles, setNodes, setEdges, onEdit, onDelete]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  return (
    <div className="w-full h-[70vh] relative border border-border bg-black/40 rounded-xl overflow-hidden backdrop-blur-sm shadow-inner group cursor-grab active:cursor-grabbing">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        minZoom={0.2}
        maxZoom={2}
        className="forja-flow"
      >
        <Background color="#E6BC63" opacity={0.05} gap={20} size={1} />
        
        <Panel position="bottom-right" className="flex gap-2 p-4 animate-fade-up">
          <div className="flex bg-surface/90 backdrop-blur-md border border-border p-1 rounded-lg shadow-2xl items-center gap-1">
            <Button variant="ghost" size="icon" onClick={() => zoomOut()} className="size-8 text-muted-foreground hover:text-primary">
              <ZoomOut className="size-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => fitView({ duration: 800 })} className="h-8 text-[10px] font-bold uppercase tracking-tighter text-muted-foreground hover:text-primary px-2">
              Ajustar
            </Button>
            <Button variant="ghost" size="icon" onClick={() => zoomIn()} className="size-8 text-muted-foreground hover:text-primary">
              <ZoomIn className="size-4" />
            </Button>
            <div className="w-px h-4 bg-border mx-1" />
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setViewport({ x: 0, y: 0, zoom: 1 }, { duration: 800 })}
              className="size-8 text-muted-foreground hover:text-primary"
            >
              <Maximize className="size-4" />
            </Button>
          </div>
        </Panel>

        <Panel position="top-left" className="p-4">
          <div className="bg-primary-soft text-primary px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 border border-primary/20 shadow-lg">
            <MousePointer2 className="size-3" />
            Arraste para navegar • Use scroll para zoom
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
}

export function OrganogramaTree(props: { 
  responsibles: Responsible[];
  onEdit: (r: Responsible) => void;
  onDelete: (r: Responsible) => void;
}) {
  return (
    <ReactFlowProvider>
      <Flow {...props} />
    </ReactFlowProvider>
  );
}
