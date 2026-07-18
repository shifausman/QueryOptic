"use client";

import React from 'react';
import { Database, Table as TableIcon } from 'lucide-react';
import { motion } from 'framer-motion';

export default function DataSimulator() {
    return (
        <div className="w-full h-full bg-slate-900/50 backdrop-blur-md border border-white/5 p-6 rounded-2xl flex flex-col shadow-2xl relative overflow-hidden">
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
