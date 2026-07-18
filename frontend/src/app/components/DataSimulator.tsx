"use client";

import React, { useMemo } from 'react';
import { Database, Table as TableIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface DataSimulatorProps {
    data: any;
    schema: string;
}

export default function DataSimulator({ data, schema }: DataSimulatorProps) {
    const columns = useMemo(() => {
        if (!data || !schema) return [];
        // very rudimentary extraction of column names from standard schema
        const words = schema.replace(/\n/g, ' ')
            .replace(/[(),;]/g, ' ')
            .split(' ')
            .filter(w => w.trim().length > 0);

        const extractedCols = [];
        for (let i = 0; i < words.length - 1; i++) {
            if (['INT', 'VARCHAR', 'VARCHAR2', 'DECIMAL', 'BOOLEAN', 'DATE'].includes(words[i + 1].toUpperCase())) {
                extractedCols.push(words[i]);
            }
        }
        // Fallbacks if regex fails
        return extractedCols.length > 0 ? extractedCols : ['id', 'status', 'value', 'timestamp'];
    }, [data, schema]);

    if (!data) {
        return (
            <div className="w-full h-full bg-slate-900/50 backdrop-blur-md border border-white/5 p-6 rounded-2xl flex flex-col shadow-2xl relative overflow-hidden min-h-[300px]">
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent"></div>

                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/50 flex items-center justify-center">
                        <Database className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-slate-100">Data Simulator</h2>
                        <p className="text-sm text-slate-400">Mock tabular data layout based on target operations</p>
                    </div>
                </div>

                <div className="flex-1 flex flex-col items-center justify-center text-slate-500 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-center gap-4 bg-slate-800/30 p-8 rounded-2xl border border-white/5 border-dashed w-full max-w-sm"
                    >
                        <TableIcon className="w-12 h-12 text-slate-600 mb-2" />
                        <p className="text-center font-medium text-slate-400">Simulator Disabled</p>
                        <p className="text-center text-sm text-slate-500">Run a verified query to load simulated rows matching your topology schema.</p>
                    </motion.div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full bg-slate-900/50 backdrop-blur-md border border-white/5 p-6 rounded-2xl flex flex-col shadow-2xl relative overflow-hidden min-h-[300px]">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>

            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center">
                    <Database className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                    <h2 className="text-lg font-semibold text-slate-100">Data Simulator</h2>
                    <p className="text-sm text-slate-400">Successfully mapped output payload preview</p>
                </div>
            </div>

            <div className="flex-1 overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-400">
                    <thead className="text-xs text-slate-500 uppercase bg-slate-800/50 border-b flex-shrink-0 border-white/5">
                        <tr>
                            {columns.map((col, idx) => (
                                <th key={idx} className="px-4 py-3">{col}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {/* Generate mock rows dynamically */}
                        {[1, 2, 3, 4].map((rowIdx) => (
                            <tr key={rowIdx} className="border-b border-white/5 hover:bg-slate-800/30 transition-colors">
                                {columns.map((col, cIdx) => (
                                    <td key={cIdx} className="px-4 py-3 text-slate-300 font-mono">
                                        {col.toLowerCase().includes('id') ? `100${rowIdx + cIdx}`
                                            : col.toLowerCase().includes('name') || col.toLowerCase().includes('category') ? `Item_${rowIdx}${cIdx}`
                                                : col.toLowerCase().includes('price') || col.toLowerCase().includes('total') || col.toLowerCase().includes('rank') ? Math.floor(Math.random() * 500) + 10
                                                    : `Value_${rowIdx}`}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
