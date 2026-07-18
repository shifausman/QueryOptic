"use client";

import React, { useState } from 'react';
import { Play, Database, Code2, AlertTriangle, Activity } from 'lucide-react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';

// Dynamically import VisualCanvas to prevent SSR issues with Mermaid
const VisualCanvas = dynamic(() => import('./components/VisualCanvas'), { ssr: false });
import Editor from '@monaco-editor/react';

export default function DesignStudio() {
  const [sql, setSql] = useState("SELECT category, SUM(price) FROM products\nGROUP BY category;");
  const [schema, setSchema] = useState("CREATE TABLE products (\n  id INT,\n  category VARCHAR,\n  price DECIMAL\n);");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [graphData, setGraphData] = useState<{ mermaid_graph: string, nodes_metadata: any } | null>(null);

  const handleCompile = async () => {
    setLoading(true);
    setErrorMsg(null);
    setGraphData(null);

    try {
      const res = await fetch("http://localhost:8000/api/compile", {
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
    } catch (error: any) {
      setErrorMsg(error.message || "An unexpected error occurred connecting to the Query Optic API.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 font-sans selection:bg-indigo-500/30 flex flex-col">
      <header className="border-b border-white/5 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-screen-2xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/50 flex items-center justify-center">
              <Activity className="w-5 h-5 text-indigo-400" />
            </div>
            <h1 className="text-xl font-semibold tracking-tight">Query Optic</h1>
          </div>

          <button
            onClick={handleCompile}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:hover:bg-indigo-600 text-white rounded-lg font-medium transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_25px_rgba(79,70,229,0.5)] active:scale-95"
          >
            {loading ? (
              <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
              </svg>
            ) : (
              <Play className="w-4 h-4" />
            )}
            {loading ? "Analyzing Engine..." : "Analyze Options"}
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-screen-2xl w-full mx-auto p-6 grid grid-cols-1 lg:grid-cols-[450px_1fr] gap-6">

        {/* Left Panel: Inputs */}
        <div className="flex flex-col gap-6 h-[calc(100vh-8rem)]">
          <div className="flex-1 flex flex-col bg-slate-900/50 rounded-2xl border border-white/5 overflow-hidden backdrop-blur-sm shadow-xl flex-shrink-0">
            <div className="px-4 py-3 border-b border-white/5 flex items-center gap-2 bg-slate-900">
              <Code2 className="w-4 h-4 text-slate-400" />
              <h2 className="text-sm font-medium text-slate-300">Target SQL Block</h2>
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

          <div className="flex-1 flex flex-col bg-slate-900/50 rounded-2xl border border-white/5 overflow-hidden backdrop-blur-sm shadow-xl flex-shrink-0">
            <div className="px-4 py-3 border-b border-white/5 flex items-center gap-2 bg-slate-900">
              <Database className="w-4 h-4 text-slate-400" />
              <h2 className="text-sm font-medium text-slate-300">Database Schema (Optional)</h2>
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

        {/* Right Panel: Visualization Grid */}
        <div className="relative bg-slate-900/30 rounded-2xl border border-white/5 overflow-hidden backdrop-blur-sm shadow-2xl h-[calc(100vh-8rem)]">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_500px_at_50%_50%,#4f46e510,transparent)]"></div>
          <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#8080801a_1px,transparent_1px),linear-gradient(to_bottom,#8080801a_1px,transparent_1px)] bg-[size:40px_40px]"></div>

          {errorMsg && (
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="absolute top-4 left-4 right-4 z-10 p-4 border border-red-500/30 bg-red-500/10 backdrop-blur-md rounded-xl flex items-start gap-3"
            >
              <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div className="text-sm text-red-200">{errorMsg}</div>
            </motion.div>
          )}

          <div className="absolute inset-0 z-0 p-8 overflow-auto">
            {!graphData && !loading && !errorMsg && (
              <div className="h-full flex flex-col items-center justify-center text-slate-500">
                <Activity className="w-12 h-12 mb-4 opacity-20" />
                <p className="text-sm">Enter SQL and click Analyze to map the Engine topology.</p>
              </div>
            )}

            {graphData && (
              <VisualCanvas
                graphDefinition={graphData.mermaid_graph}
                metadata={graphData.nodes_metadata}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
