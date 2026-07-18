"use client";

import React, { useState, useEffect } from 'react';
import { Play, Database, Code2, Activity, History, ChevronRight, CheckCircle2 } from 'lucide-react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster, toast } from 'react-hot-toast';
import Editor from '@monaco-editor/react';

// Prevent SSR issues
const VisualCanvas = dynamic(() => import('./components/VisualCanvas'), { ssr: false });
import DataSimulator from './components/DataSimulator';

interface SavedQuery {
  id: string;
  sql: string;
  schema: string;
  timestamp: number;
}

export default function DesignStudio() {
  const [sql, setSql] = useState("SELECT category, SUM(price) FROM products\nGROUP BY category;");
  const [schema, setSchema] = useState("CREATE TABLE products (\n  id INT,\n  category VARCHAR,\n  price DECIMAL\n);");
  const [loading, setLoading] = useState(false);
  const [graphData, setGraphData] = useState<{ mermaid_graph: string, nodes_metadata: any } | null>(null);
  const [history, setHistory] = useState<SavedQuery[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Hydrate history from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('query_optic_history');
    if (stored) {
      try {
        setHistory(JSON.parse(stored));
      } catch (e) { }
    }
  }, []);

  const saveToHistory = (s: string, sch: string) => {
    const newEntry: SavedQuery = {
      id: Math.random().toString(36).substring(7),
      sql: s,
      schema: sch,
      timestamp: Date.now()
    };
    const newHistory = [newEntry, ...history].slice(0, 10);
    setHistory(newHistory);
    localStorage.setItem('query_optic_history', JSON.stringify(newHistory));
  };

  const handleCompile = async () => {
    if (!sql.trim()) {
      toast.error("SQL query cannot be empty.");
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Analyzing Query Engine Flow...");

    try {
      const res = await fetch("http://127.0.0.1:8000/api/compile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sql, schema_str: schema })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || `Server error: ${res.status}`);
      }

      const data = await res.json();
      setGraphData(data);
      saveToHistory(sql, schema);
      toast.success("Analysis Complete!", { id: toastId });
    } catch (error: any) {
      toast.error(error.message || "An unexpected error occurred connecting to the API.", { id: toastId, duration: 5000 });
    } finally {
      setLoading(false);
    }
  };

  const loadHistoryQuery = (entry: SavedQuery) => {
    setSql(entry.sql);
    setSchema(entry.schema);
    setIsHistoryOpen(false);
    toast.success("Loaded query from history");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 font-sans selection:bg-indigo-500/30 flex flex-col relative overflow-hidden">
      <Toaster position="top-center" toastOptions={{
        style: {
          background: '#1e293b',
          color: '#f8fafc',
          border: '1px solid rgba(255,255,255,0.1)',
        }
      }} />

      <header className="border-b border-white/5 bg-slate-900/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-screen-2xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/50 flex items-center justify-center">
              <Activity className="w-5 h-5 text-indigo-400" />
            </div>
            <h1 className="text-xl font-semibold tracking-tight">Query Optic</h1>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsHistoryOpen(true)}
              className="p-2.5 rounded-lg border border-white/10 hover:bg-white/10 text-slate-300 transition-colors"
              title="Query History"
            >
              <History className="w-5 h-5" />
            </button>

            <button
              onClick={handleCompile}
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-80 disabled:hover:bg-indigo-600 text-white rounded-lg font-medium transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_25px_rgba(79,70,229,0.5)] active:scale-95"
            >
              {loading ? (
                <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
              ) : (
                <Play className="w-4 h-4" />
              )}
              {loading ? "Analyzing..." : "Analyze Options"}
            </button>
          </div>
        </div>
      </header>

      {/* History Sidebar Overlay */}
      <AnimatePresence>
        {isHistoryOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsHistoryOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-96 bg-slate-900 border-l border-white/10 shadow-2xl z-50 flex flex-col"
            >
              <div className="p-5 border-b border-white/5 flex items-center justify-between">
                <h3 className="flex items-center gap-2 font-semibold text-slate-100">
                  <History className="w-5 h-5 text-indigo-400" />
                  Query History
                </h3>
                <button onClick={() => setIsHistoryOpen(false)} className="p-1 hover:bg-white/10 rounded-lg text-slate-400 transition-colors">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {history.length === 0 ? (
                  <p className="text-center text-sm text-slate-500 mt-10">No history yet. Run a successful query!</p>
                ) : (
                  history.map(entry => (
                    <div
                      key={entry.id}
                      onClick={() => loadHistoryQuery(entry)}
                      className="p-4 rounded-xl border border-white/5 bg-slate-800/30 hover:bg-slate-800/80 hover:border-indigo-500/30 cursor-pointer transition-all group"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1.5 text-xs text-green-400">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Success
                        </div>
                        <div className="text-xs text-slate-500">
                          {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                      <div className="text-sm font-mono text-slate-300 line-clamp-2 leading-relaxed">
                        {entry.sql}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <main className="flex-1 max-w-[1800px] w-full mx-auto p-6 grid grid-cols-1 lg:grid-cols-[400px_1fr] xl:grid-cols-[480px_1fr] gap-6">

        {/* Left Panel: Inputs & Simulator */}
        <div className="flex flex-col gap-6 h-[calc(100vh-8rem)]">
          <div className="flex-[0.6] flex flex-col bg-slate-900/50 rounded-2xl border border-white/5 overflow-hidden backdrop-blur-sm shadow-xl relative group">
            <div className="px-4 py-3 border-b border-white/5 flex items-center gap-2 bg-slate-900" >
              <Code2 className="w-4 h-4 text-slate-400 group-focus-within:text-indigo-400 transition-colors" />
              <h2 className="text-sm font-medium text-slate-300 group-focus-within:text-slate-100 transition-colors">Target SQL Block</h2>
            </div>
            <div className="flex-1 pt-2">
              <Editor
                height="100%"
                defaultLanguage="sql"
                theme="vs-dark"
                value={sql}
                onChange={(val) => setSql(val || "")}
                options={{ minimap: { enabled: false }, padding: { top: 16 } }}
              />
            </div>
          </div>

          <div className="flex-[0.4] flex flex-col bg-slate-900/50 rounded-2xl border border-white/5 overflow-hidden backdrop-blur-sm shadow-xl relative group">
            <div className="px-4 py-3 border-b border-white/5 flex items-center gap-2 bg-slate-900">
              <Database className="w-4 h-4 text-slate-400 group-focus-within:text-indigo-400 transition-colors" />
              <h2 className="text-sm font-medium text-slate-300 group-focus-within:text-slate-100 transition-colors">Database Schema (Optional)</h2>
            </div>
            <div className="flex-1 pt-2">
              <Editor
                height="100%"
                defaultLanguage="sql"
                theme="vs-dark"
                value={schema}
                onChange={(val) => setSchema(val || "")}
                options={{ minimap: { enabled: false }, padding: { top: 16 } }}
              />
            </div>
          </div>
        </div>

        {/* Right Panel: Visualization Grid & Simulator Component */}
        <div className="flex flex-col gap-6 h-[calc(100vh-8rem)] overflow-y-auto pr-2 pb-6 custom-scrollbar">
          <div className="relative bg-slate-900/30 rounded-2xl border border-white/5 overflow-hidden backdrop-blur-sm shadow-2xl min-h-[600px] shrink-0 flex flex-col">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_500px_at_50%_50%,#4f46e510,transparent)]"></div>
            <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#8080801a_1px,transparent_1px),linear-gradient(to_bottom,#8080801a_1px,transparent_1px)] bg-[size:40px_40px]"></div>

            <div className="absolute inset-0 z-0 p-8 overflow-auto">
              {!graphData && !loading && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  className="h-full flex flex-col items-center justify-center text-slate-500"
                >
                  <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-6">
                    <Activity className="w-8 h-8 text-indigo-400/50" />
                  </div>
                  <p className="text-sm font-medium">Enter SQL and click Analyze to map the Engine topology.</p>
                </motion.div>
              )}

              {loading && (
                <div className="absolute inset-0 z-10 bg-slate-900/40 backdrop-blur-[2px] flex items-center justify-center">
                  <div className="flex flex-col items-center gap-4">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full border-2 border-indigo-500/20"></div>
                      <div className="w-12 h-12 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin absolute inset-0"></div>
                    </div>
                    <div className="text-xs font-medium text-indigo-300 animate-pulse uppercase tracking-widest">
                      Synthesizing Logic
                    </div>
                  </div>
                </div>
              )}

              {graphData && !loading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full">
                  <VisualCanvas
                    graphDefinition={graphData.mermaid_graph}
                    metadata={graphData.nodes_metadata}
                  />
                </motion.div>
              )}
            </div>
          </div>

          {/* Bottom Right: DataSimulator Scaffold */}
          <div className="shrink-0 mt-4">
            <DataSimulator data={graphData} schema={schema} />
          </div>
        </div>
      </main>
    </div>
  );
}
