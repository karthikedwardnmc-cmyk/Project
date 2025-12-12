import React, { useRef, useEffect } from 'react';
import { ScanResult, ScanStatus } from '../types';
import { Terminal, Wifi, ShieldCheck, ShieldX, Ban } from 'lucide-react';

interface ResultsLogProps {
  results: ScanResult[];
  status: ScanStatus;
  scannedCount: number;
}

const ResultsLog: React.FC<ResultsLogProps> = ({ results, status, scannedCount }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new results arrive
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [results, scannedCount]);

  const openCount = results.filter(r => r.status === 'OPEN').length;
  const closedCount = results.filter(r => r.status === 'CLOSED').length;

  return (
    <div className="bg-gray-900 rounded-2xl border border-gray-700 shadow-2xl overflow-hidden flex flex-col h-[500px]">
      {/* Header */}
      <div className="bg-gray-800 p-4 border-b border-gray-700 flex justify-between items-center">
        <div className="flex items-center gap-2 text-cyan-400">
          <Terminal className="w-5 h-5" />
          <span className="font-bold tracking-wider">SCAN_LOG.TXT</span>
        </div>
        <div className="flex gap-4 text-xs font-mono">
           <div className="flex items-center gap-1 text-green-400">
             <ShieldCheck className="w-3 h-3" /> OPEN: {openCount}
           </div>
           <div className="flex items-center gap-1 text-gray-500">
             <ShieldX className="w-3 h-3" /> CLOSED: {closedCount}
           </div>
        </div>
      </div>

      {/* Log Body */}
      <div className="flex-1 overflow-y-auto p-4 font-mono text-sm relative space-y-2 bg-gray-950">
        {status === ScanStatus.IDLE && results.length === 0 && (
           <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-600 opacity-50 pointer-events-none">
              <Wifi className="w-16 h-16 mb-4" />
              <p>Ready to initialize sequence...</p>
           </div>
        )}

        {results.map((result, idx) => (
          <div 
            key={`${result.port}-${idx}`} 
            className={`flex items-center gap-3 p-2 rounded border-l-2 animate-in fade-in slide-in-from-left-2 duration-300 ${
              result.status === 'OPEN' 
                ? 'bg-green-900/10 border-green-500 text-green-400' 
                : result.status === 'BLOCKED'
                ? 'bg-orange-900/10 border-orange-500 text-orange-400'
                : 'bg-gray-900/30 border-gray-700 text-gray-600'
            }`}
          >
            <span className="w-16 font-bold">:{result.port}</span>
            <span className="flex-1">
              {result.status === 'OPEN' && 'CONNECTION ESTABLISHED'}
              {result.status === 'CLOSED' && 'CONNECTION REFUSED / TIMEOUT'}
              {result.status === 'BLOCKED' && 'BLOCKED BY BROWSER POLICY'}
            </span>
            <span className="text-xs opacity-50">
                [{result.status}]
            </span>
          </div>
        ))}
        
        {status === ScanStatus.SCANNING && (
          <div className="flex items-center gap-2 text-cyan-500 animate-pulse p-2">
            <span className="w-2 h-2 bg-cyan-500 rounded-full"></span>
            <span>Scanning port {scannedCount}...</span>
          </div>
        )}
        
        <div ref={bottomRef} />
      </div>
      
      {/* Footer Status Line */}
      <div className="bg-gray-800 p-2 border-t border-gray-700 text-xs text-gray-500 flex justify-between font-mono">
        <span>STATUS: {status}</span>
        <span>MODE: TCP_FETCH_SIM</span>
      </div>
    </div>
  );
};

export default ResultsLog;
