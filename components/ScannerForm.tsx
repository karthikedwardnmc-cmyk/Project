import React from 'react';
import { ScanConfig, ScanStatus } from '../types';
import { Play, Square, AlertTriangle, ShieldAlert } from 'lucide-react';

interface ScannerFormProps {
  config: ScanConfig;
  status: ScanStatus;
  progress: number;
  onConfigChange: (newConfig: ScanConfig) => void;
  onStart: () => void;
  onStop: () => void;
}

const ScannerForm: React.FC<ScannerFormProps> = ({
  config,
  status,
  progress,
  onConfigChange,
  onStart,
  onStop,
}) => {
  const isScanning = status === ScanStatus.SCANNING;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onConfigChange({
      ...config,
      [name]: name === 'targetIp' ? value : parseInt(value) || 0,
    });
  };

  return (
    <div className="bg-gray-800/80 backdrop-blur-sm p-6 rounded-2xl border border-gray-700 shadow-2xl relative overflow-hidden group">
      {/* Decorative gradient blob */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-cyan-500/20 rounded-full blur-3xl group-hover:bg-cyan-500/30 transition-all duration-700"></div>

      <div className="relative z-10">
        <h2 className="text-2xl font-bold text-cyan-400 mb-6 flex items-center gap-2">
           <ShieldAlert className="w-6 h-6" />
           Target Configuration
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1 font-semibold">
              Target IP Address
            </label>
            <input
              type="text"
              name="targetIp"
              value={config.targetIp}
              onChange={handleChange}
              disabled={isScanning}
              placeholder="127.0.0.1"
              className="w-full bg-gray-900 border border-gray-700 text-gray-100 rounded-lg p-3 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-mono"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1 font-semibold">
                Start Port
              </label>
              <input
                type="number"
                name="startPort"
                min="1"
                max="65535"
                value={config.startPort}
                onChange={handleChange}
                disabled={isScanning}
                className="w-full bg-gray-900 border border-gray-700 text-gray-100 rounded-lg p-3 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-mono"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1 font-semibold">
                End Port
              </label>
              <input
                type="number"
                name="endPort"
                min="1"
                max="65535"
                value={config.endPort}
                onChange={handleChange}
                disabled={isScanning}
                className="w-full bg-gray-900 border border-gray-700 text-gray-100 rounded-lg p-3 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-mono"
              />
            </div>
          </div>

          <div className="pt-4">
            {!isScanning ? (
              <button
                onClick={onStart}
                className="w-full bg-cyan-500 hover:bg-cyan-400 text-gray-950 font-bold py-3 px-4 rounded-lg shadow-[0_0_15px_rgba(6,182,212,0.5)] hover:shadow-[0_0_25px_rgba(6,182,212,0.7)] transition-all duration-300 flex items-center justify-center gap-2"
              >
                <Play className="w-5 h-5 fill-current" />
                SCAN TARGET
              </button>
            ) : (
              <button
                onClick={onStop}
                className="w-full bg-red-500 hover:bg-red-400 text-white font-bold py-3 px-4 rounded-lg shadow-[0_0_15px_rgba(239,68,68,0.5)] hover:shadow-[0_0_25px_rgba(239,68,68,0.7)] transition-all duration-300 flex items-center justify-center gap-2 animate-pulse"
              >
                <Square className="w-5 h-5 fill-current" />
                ABORT SCAN ({progress.toFixed(0)}%)
              </button>
            )}
          </div>
          
          <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-700/50 rounded-lg flex items-start gap-3">
             <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
             <p className="text-xs text-yellow-200/80 leading-relaxed">
               <strong>Warning:</strong> Scan only your own network. Unauthorized scanning is illegal.
               Browser-based scanning is limited and may produce false negatives due to browser security policies.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScannerForm;
