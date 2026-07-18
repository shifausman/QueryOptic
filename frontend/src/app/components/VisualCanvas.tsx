"use client";

import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, AlertCircle } from 'lucide-react';

interface NodeMetadata {
    title: string;
    operation_type: string;
    impact: string;
    explanation: string;
    fix: string | null;
}

interface VisualCanvasProps {
    graphDefinition: string;
    metadata: Record<string, NodeMetadata>;
}

export default function VisualCanvas({ graphDefinition, metadata }: VisualCanvasProps) {
    const mermaidRef = useRef<HTMLDivElement>(null);
    const [selectedNode, setSelectedNode] = useState<NodeMetadata | null>(null);

    useEffect(() => {
        // Initialize Mermaid with normal typography constraints
        mermaid.initialize({
            startOnLoad: false,
            theme: 'dark',
            themeVariables: {
                fontFamily: 'Inter, sans-serif',
                fontSize: '14px',
                nodeTextColor: '#0f172a',
                lineColor: '#64748b'
            },
            securityLevel: 'loose'
        });

        const renderGraph = async () => {
            if (mermaidRef.current) {
                // Clear any existing graphs
                mermaidRef.current.innerHTML = '';

                try {
                    // Unique ID for the render
                    const id = `mermaid-graph-${Date.now()}`;
                    const { svg } = await mermaid.render(id, graphDefinition);
                    mermaidRef.current.innerHTML = svg;

                    // Attach click handlers to rendered SVG nodes manually since mermaid clicks can be finicky in React
                    const nodes = mermaidRef.current.querySelectorAll('.node');
                    nodes.forEach(node => {
                        if (node instanceof HTMLElement || node instanceof SVGElement) {
                            node.style.cursor = 'pointer';
                        }
                        node.addEventListener('click', () => {
                            // To be absolutely sure, we can check if metadata keys are in the node class or id
                            const matchedKey = Object.keys(metadata).find(k => node.id.includes(k));
                            if (matchedKey) {
                                setSelectedNode(metadata[matchedKey]);
                            }
                        });
                    });

                } catch (error) {
                    console.error("Mermaid Render Error", error);
                    mermaidRef.current.innerHTML = `<div class="text-red-400 p-4 bg-red-950/30 rounded border border-red-500/20">Failed to render topology tree. LLM produced malformed diagram.</div>`;
                }
            }
        };

        if (graphDefinition) {
            renderGraph();
        }
    }, [graphDefinition, metadata]);

    // Format impact colors
    const getImpactStyle = (impact: string) => {
        switch (impact.toLowerCase()) {
            case 'high': return 'bg-red-500/20 text-red-400 border-red-500/30';
            case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
            default: return 'bg-green-500/20 text-green-400 border-green-500/30';
        }
    };

    return (
        <div className="w-full h-full relative flex-1 min-h-0">
            <style>{`
                /* Ensure explicit parent overflow sliding */
                .mermaid-host {
                    overflow: auto;
                    padding: 40px;
                    text-align: center;
                }
                /* Let Mermaid handle sizing naturally; prevent flex stretching */
                .mermaid-host svg {
                    display: block;
                    margin: 0 auto;
                }
                /* Thick, massive text - let Mermaid handle sizing natively! */
                .node foreignObject div, .node text {
                    color: #0f172a !important;
                    fill: #0f172a !important;
                }
                /* Thickened block bounds */
                .node rect, .node polygon, .node circle {
                    stroke-width: 3px !important;
                    stroke: #475569 !important;
                }
                .edgePath path {
                    stroke: #64748b !important;
                    stroke-width: 3px !important;
                }
            `}</style>
            <div
                ref={mermaidRef}
                className="mermaid-host w-full h-full custom-scrollbar"
            />

            {/* Metadata overlay mapping */}
            <AnimatePresence>
                {selectedNode && (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="absolute right-0 top-0 bottom-0 w-80 bg-slate-900 border-l border-white/10 shadow-2xl flex flex-col rounded-r-2xl overflow-hidden"
                    >
                        <div className="p-4 border-b border-white/5 flex items-center justify-between bg-slate-800/50">
                            <h3 className="font-semibold text-slate-100 flex items-center gap-2">
                                <Zap className="w-4 h-4 text-indigo-400" />
                                Node Analysis
                            </h3>
                            <button
                                onClick={() => setSelectedNode(null)}
                                className="p-1.5 hover:bg-white/10 rounded-lg text-slate-400 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="p-5 flex-1 overflow-y-auto flex flex-col gap-6">
                            <div>
                                <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Operation</div>
                                <div className="text-lg font-medium text-slate-100">{selectedNode.title}</div>
                                <div className="text-xs font-mono text-indigo-400 mt-1">{selectedNode.operation_type}</div>
                            </div>

                            <div>
                                <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Computational Impact</div>
                                <span className={`text-xs font-medium px-2.5 py-1 rounded-md border ${getImpactStyle(selectedNode.impact)}`}>
                                    {selectedNode.impact} Impact
                                </span>
                            </div>

                            <div>
                                <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Engine Explanation</div>
                                <p className="text-sm text-slate-300 leading-relaxed">
                                    {selectedNode.explanation}
                                </p>
                            </div>

                            {selectedNode.fix && selectedNode.fix !== "null" && (
                                <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4 mt-2">
                                    <div className="flex items-center gap-2 mb-2 text-indigo-400">
                                        <AlertCircle className="w-4 h-4" />
                                        <span className="text-sm font-semibold">Optimization Tip</span>
                                    </div>
                                    <p className="text-sm text-indigo-200/80 leading-relaxed">
                                        {selectedNode.fix}
                                    </p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
