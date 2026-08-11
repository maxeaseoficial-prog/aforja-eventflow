import React, { useMemo, useCallback, useState, useEffect } from 'react';
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  Background,
  Panel,
  Handle,
  Position,
  useReactFlow,
  ReactFlowProvider,
  MarkerType,
  OnNodesChange,
  OnEdgesChange,
  applyNodeChanges,
  applyEdgeChanges,
  OnConnect,
  OnReconnect,
  reconnectEdge,
  SelectionMode,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import dagre from 'dagre';
import { 
  Maximize, 
  ZoomIn, 
  ZoomOut, 
  MousePointer2, 
  Hand, 
  MousePointer, 
  Trash2,
  RefreshCw,
  Info
} from 'lucide-react';
import { Avatar, PersonStatusBadge } from '@/components/forja/ui-kit';
import { Button } from '@/components/ui/button';
import { Pencil } from 'lucide-react';
import { Responsible } from '@/lib/forja-data';
import { cn } from '@/lib/utils';
import { useForja } from './store';
import { toast } from 'sonner';
import { ConfirmDeleteDialog } from './ConfirmDeleteDialog';

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

  return nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      targetPosition: Position.Top,
      sourcePosition: Position.Bottom,
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      },
    };
  });
};

// --- Custom Node Component ---
function ResponsibleNode({ data, selected }: { data: { responsible: Responsible; onEdit: (r: Responsible) => void; onDelete: (r: Responsible) => void }; selected?: boolean }) {
  const { responsible, onEdit, onDelete } = data;
  
  return (
    <div className={cn(
      "surface-card border-primary/20 p-4 shadow-xl min-w-[260px] relative group animate-fade-in transition-all duration-200",
      selected ? "ring-2 ring-primary ring-offset-2 ring-offset-background scale-[1.02] shadow-[0_0_20px_rgba(230,188,99,0.3)]" : "ring-1 ring-primary/5"
    )}>
      <Handle 
        type="target" 
        position={Position.Top} 
        className="!bg-primary !w-3 !h-3 !border-2 !border-background hover:scale-150 transition-transform" 
      />
      
      <div className="flex items-start gap-3">
        <Avatar name={responsible.name || ''} size="md" />
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

      <Handle 
        type="source" 
        position={Position.Bottom} 
        className="!bg-primary !w-3 !h-3 !border-2 !border-background hover:scale-150 transition-transform" 
      />
    </div>
  );
}

const nodeTypes = {
  responsible: ResponsibleNode,
};

// --- Helper to check for cycles ---
const wouldCreateCycle = (nodes: Node[], edges: Edge[], source: string, target: string): boolean => {
  if (source === target) return true;
  
  const visited = new Set<string>();
  const queue = [source];
  
  while (queue.length > 0) {
    const current = queue.shift()!;
    if (current === target) return true;
    
    // We are checking if adding source -> target creates a cycle.
    // This happens if there's already a path from target to source.
    const childrenEdges = edges.filter(e => e.source === current);
    for (const edge of childrenEdges) {
      if (!visited.has(edge.target)) {
        visited.add(edge.target);
        queue.push(edge.target);
      }
    }
  }
  
  return false;
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
  const { fitView, zoomIn, zoomOut } = useReactFlow();
  const { updateResponsiblePosition, addConnection, removeConnection, updateConnection } = useForja();
  
  const [mode, setMode] = useState<'view' | 'edit'>('view');
  const [edgeToDelete, setEdgeToDelete] = useState<Edge | null>(null);

  // Initial state setup
  const initialNodes: Node[] = responsibles.map((r) => ({
    id: r.id,
    type: 'responsible',
    data: { responsible: r, onEdit, onDelete },
    position: r.position || { x: 0, y: 0 },
  }));

  const initialEdges: Edge[] = responsibles.flatMap((r) => 
    (r.connections || []).map((c) => ({
      id: c.id,
      source: r.id,
      target: c.target,
      type: 'smoothstep',
      reconnectable: true,
      style: { stroke: 'var(--primary)', strokeWidth: 2, opacity: 0.6 },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: '#E6BC63',
        width: 15,
        height: 15,
      },
    }))
  );

  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);

  // Sync state when responsibles list changes (e.g. added/removed)
  useEffect(() => {
    setNodes(prevNodes => {
      const newNodes = responsibles.map(r => {
        const existing = prevNodes.find(n => n.id === r.id);
        return {
          id: r.id,
          type: 'responsible',
          data: { responsible: r, onEdit, onDelete },
          position: r.position || (existing ? existing.position : { x: 0, y: 0 }),
        };
      });
      return newNodes;
    });

    setEdges(responsibles.flatMap((r) => 
      (r.connections || []).map((c) => ({
        id: c.id,
        source: r.id,
        target: c.target,
        type: 'smoothstep',
        reconnectable: true,
        style: { stroke: 'var(--primary)', strokeWidth: 2, opacity: 0.6 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: '#E6BC63',
          width: 15,
          height: 15,
        },
      }))
    ));
  }, [responsibles, onEdit, onDelete]);

  const onNodesChange: OnNodesChange = useCallback(
    (changes) => {
      setNodes((nds) => {
        const nextNodes = applyNodeChanges(changes, nds);
        
        // Persist positions when dragging ends
        changes.forEach(change => {
          if (change.type === 'position' && change.dragging === false && change.position) {
            updateResponsiblePosition(change.id, change.position);
          }
        });
        
        return nextNodes;
      });
    },
    [updateResponsiblePosition]
  );

  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const onConnect: OnConnect = useCallback(
    (params) => {
      if (params.source === params.target) return;

      // Rule: No identical duplicates
      const exists = edges.some(e => e.source === params.source && e.target === params.target);
      if (exists) return;
      
      // Rule: No cycles
      if (wouldCreateCycle(nodes, edges, params.source!, params.target!)) {
        toast.error("Esta ligação criaria uma hierarquia circular.");
        return;
      }

      // Smart Align / Snap logic
      const sourceNode = nodes.find(n => n.id === params.source);
      const targetNode = nodes.find(n => n.id === params.target);
      
      if (sourceNode && targetNode) {
        const sourceCenter = sourceNode.position.x + nodeWidth / 2;
        const targetCenter = targetNode.position.x + nodeWidth / 2;
        const diff = Math.abs(sourceCenter - targetCenter);
        
        // Tolerance for vertical alignment (approx 80px as requested)
        if (diff < 80) {
          const newX = sourceCenter - nodeWidth / 2;
          updateResponsiblePosition(targetNode.id, { x: newX, y: targetNode.position.y });
          setNodes(nds => nds.map(n => n.id === targetNode.id ? { ...n, position: { x: newX, y: n.position.y } } : n));
        }
      }

      addConnection(params.source!, params.target!);
      toast.success("Conexão estabelecida");
    },
    [edges, nodes, addConnection, updateResponsiblePosition]
  );

  const onReconnect: OnReconnect = useCallback(
    (oldEdge, newConnection) => {
      if (newConnection.source === newConnection.target) return;
      
      if (wouldCreateCycle(nodes, edges, newConnection.source!, newConnection.target!)) {
        toast.error("Esta ligação criaria uma hierarquia circular.");
        return;
      }

      updateConnection(oldEdge.id, newConnection.source!, newConnection.target!);
      toast.success("Conexão alterada");
    },
    [nodes, edges, updateConnection]
  );

  const onEdgeDelete = useCallback(() => {
    if (edgeToDelete) {
      removeConnection(edgeToDelete.id);
      setEdgeToDelete(null);
      toast.success("Ligação removida");
    }
  }, [edgeToDelete, removeConnection]);

  const runAutoLayout = useCallback(() => {
    const layoutedNodes = getLayoutedElements(nodes, edges);
    setNodes(layoutedNodes);
    layoutedNodes.forEach(node => {
      updateResponsiblePosition(node.id, node.position);
    });
    setTimeout(() => fitView({ duration: 800 }), 50);
    toast.success("Layout organizado automaticamente");
  }, [nodes, edges, updateResponsiblePosition, fitView]);

  // Keyboard shortcuts
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (mode !== 'edit') return;
      
      if (e.key === 'Delete' || e.key === 'Backspace') {
        const selectedEdges = edges.filter(e => e.selected);
        if (selectedEdges.length > 0) {
          setEdgeToDelete(selectedEdges[0] ?? null);
        }
      }
      
      if (e.key === 'Escape') {
        setNodes(nds => nds.map(n => ({ ...n, selected: false })));
        setEdges(eds => eds.map(e => ({ ...e, selected: false })));
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [mode, edges]);

  return (
    <div className="w-full h-[75vh] relative border border-border bg-black/40 rounded-xl overflow-hidden backdrop-blur-sm shadow-inner group">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onReconnect={onReconnect}
        nodeTypes={nodeTypes}
        fitView
        minZoom={0.1}
        maxZoom={2}
        
        // Mode specific props
        panOnDrag={mode === 'view'}
        selectionOnDrag={mode === 'edit'}
        selectionMode={SelectionMode.Partial}
        panOnScroll={false}
        
        nodesDraggable={mode === 'edit'}
        nodesConnectable={mode === 'edit'}
        elementsSelectable={mode === 'edit'}
        edgesFocusable={mode === 'edit'}
        
        // Visuals
        snapToGrid={mode === 'edit'}
        snapGrid={[20, 20]}
        
        className={cn("forja-flow", mode === 'view' ? "cursor-grab active:cursor-grabbing" : "cursor-default")}
      >
        <Background color="#E6BC63" style={{ opacity: 0.05 }} gap={20} size={1} />
        
        {/* Main Control Panel (Bottom) */}
        <Panel position="bottom-center" className="mb-6 animate-fade-up">
          <div className="flex bg-surface/95 backdrop-blur-xl border border-primary/20 p-1.5 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] items-center gap-2 ring-1 ring-white/5">
            
            {/* Mode Switcher */}
            <div className="flex bg-black/40 p-1 rounded-xl border border-white/5 mr-2">
              <button
                onClick={() => setMode('view')}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all duration-300",
                  mode === 'view' 
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Hand className="size-4" /> Navegar
              </button>
              <button
                onClick={() => setMode('edit')}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all duration-300",
                  mode === 'edit' 
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <MousePointer className="size-4" /> Editar
              </button>
            </div>

            <div className="w-px h-8 bg-white/10 mx-1" />

            {/* View Controls */}
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" onClick={() => zoomOut()} className="size-9 rounded-xl hover:bg-white/5">
                <ZoomOut className="size-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => zoomIn()} className="size-9 rounded-xl hover:bg-white/5">
                <ZoomIn className="size-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => fitView({ duration: 800 })} 
                className="h-9 px-3 text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-white/5"
              >
                Ajustar
              </Button>
            </div>

            <div className="w-px h-8 bg-white/10 mx-1" />

            {/* Layout Controls */}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={runAutoLayout}
              className="h-9 px-3 text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-white/5 text-primary"
            >
              <RefreshCw className="size-3.5 mr-2" /> Organizar
            </Button>
          </div>
        </Panel>

        {/* Info Panel (Top Left) */}
        <Panel position="top-left" className="p-4">
          <div className={cn(
            "px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-3 border transition-all duration-500 shadow-xl backdrop-blur-md",
            mode === 'edit' 
              ? "bg-primary/20 border-primary/40 text-primary animate-pulse shadow-primary/10" 
              : "bg-surface/60 border-white/5 text-muted-foreground"
          )}>
            <div className={cn("size-2 rounded-full", mode === 'edit' ? "bg-primary shadow-[0_0_8px_var(--primary)]" : "bg-muted-foreground")} />
            {mode === 'edit' ? "Modo Edição Ativo" : "Visualização"}
            <span className="opacity-40">•</span>
            <span className="font-medium normal-case tracking-normal opacity-80">
              {mode === 'edit' ? "Arraste cards ou crie conexões" : "Clique e arraste para navegar"}
            </span>
          </div>
          
          {mode === 'edit' && (
            <div className="mt-2 bg-black/60 border border-white/5 p-3 rounded-xl backdrop-blur-md text-[10px] text-muted-foreground space-y-1.5 animate-fade-in">
              <div className="flex items-center gap-2"><Info className="size-3" /> <strong>Dicas de edição:</strong></div>
              <p>• Arraste o fundo para selecionar vários cards</p>
              <p>• Shift + Clique para seleção múltipla</p>
              <p>• Arraste os pontos para criar ou mudar hierarquia</p>
              <p>• Clique em uma linha e pressione Delete para remover</p>
            </div>
          )}
        </Panel>

        {/* Selected Edge Actions */}
        {mode === 'edit' && edges.some(e => e.selected) && (
          <Panel position="top-right" className="p-4">
            <Button 
              variant="destructive" 
              size="sm" 
              className="font-bold text-[10px] uppercase tracking-wider rounded-xl shadow-2xl animate-pop"
              onClick={() => {
                const selectedEdge = edges.find(e => e.selected);
                if (selectedEdge) setEdgeToDelete(selectedEdge);
              }}
            >
              <Trash2 className="size-3.5 mr-2" /> Remover Ligação
            </Button>
          </Panel>
        )}
      </ReactFlow>

      <ConfirmDeleteDialog
        open={!!edgeToDelete}
        onOpenChange={(open) => !open && setEdgeToDelete(null)}
        onConfirm={onEdgeDelete}
        title="Remover ligação?"
        description="Tem certeza que deseja remover esta conexão hierárquica? O responsável continuará existindo, apenas ficará sem um superior direto."
        confirmLabel="Remover"
      />
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