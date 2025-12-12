import React, { useState, useCallback, useRef } from 'react';
import ScannerForm from './components/ScannerForm';
import ResultsLog from './components/ResultsLog';
import { ScanConfig, ScanStatus, ScanResult } from './types';
import { checkPort } from './services/scannerService';
import { Network, Activity } from 'lucide-react';

// Constants
const BATCH_SIZE = 5; // Number of parallel requests
const DEFAULT_TIMEOUT = 1000; // ms

function App() {
  const [config, setConfig] = useState<ScanConfig>({
    targetIp: '127.0.0.1',
    startPort: 80,
    endPort: 100,
    timeout: DEFAULT_TIMEOUT,
  });

  const [status, setStatus] = useState<ScanStatus>(ScanStatus.IDLE);
  const [results, setResults] = useState<ScanResult[]>([]);
  const [currentPort, setCurrentPort] = useState<number>(0);
  
  // Ref to stop the scanning loop
  const stopRef = useRef<boolean>(false);

  const calculateProgress = () => {
    if (status === ScanStatus.IDLE && results.length === 0) return 0;
    const total = config.endPort - config.startPort + 1;
    if (total <= 0) return 0;
    const scanned = currentPort - config.startPort;
    return Math.min(100, Math.max(0, (scanned / total) * 100));
  };

  const handleStartScan = useCallback(async () => {
    if (config.startPort > config.endPort) {
      alert("Start port must be less than or equal to end port.");
      return;
    }

    setResults([]);
    setStatus(ScanStatus.SCANNING);
    stopRef.current = false;

    const totalPorts = config.endPort - config.startPort + 1;
    let processed = 0;

    // We iterate in batches to avoid choking the browser
    for (let i = config.startPort; i <= config.endPort; i += BATCH_SIZE) {
      if (stopRef.current) break;

      const batchEnd = Math.min(i + BATCH_SIZE - 1, config.endPort);
      const batchPromises = [];

      setCurrentPort(i);

      for (let p = i; p <= batchEnd; p++) {
        batchPromises.push(checkPort(config.targetIp, p, config.timeout));
      }

      // Wait for the batch to finish
      const batchResults = await Promise.all(batchPromises);
      
      setResults(prev => [...prev, ...batchResults]);
      processed += batchResults.length;
      
      // Small delay between batches to allow UI updates and prevent browser freeze
      await new Promise(r => setTimeout(r, 50));
    }

    setStatus(stopRef.current ? ScanStatus.STOPPED : ScanStatus.COMPLETED);
    setCurrentPort(config.endPort);
  }, [config]);

  const handleStopScan = useCallback(() => {
    stopRef.current = true;
    setStatus(ScanStatus.STOPPED);
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900 via-gray-950 to-black text-white p-4 md:p-8 flex flex-col items-center">
      
      {/* Background Grid Animation Effect (Visual Only) */}
      <div className="fixed inset-0 z-0 opacity-20 pointer-events-none" 
           style={{ 
             backgroundImage: 'linear-gradient(rgba(34, 211, 238, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(34, 211, 238, 0.1) 1px, transparent 1px)', 
             backgroundSize: '30px 30px' 
           }}>
      </div>

      <header className="relative z-10 w-full max-w-5xl mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-cyan-900/20 rounded-xl border border-cyan-500/30 neon-shadow">
            <Network className="w-8 h-8 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500 tracking-tight">
              MINI PORT SCANNER
            </h1>
            <p className="text-gray-400 text-sm font-mono tracking-wider flex items-center gap-2">
              <Activity className="w-3 h-3" /> SYSTEM_ONLINE
            </p>
          </div>
        </div>
      </header>

      <main className="relative z-10 w-full max-w-5xl grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Column: Form */}
        <div className="md:col-span-5 lg:col-span-4">
          <ScannerForm 
            config={config} 
            status={status}
            progress={calculateProgress()}
            onConfigChange={setConfig}
            onStart={handleStartScan}
            onStop={handleStopScan}
          />
        </div>

        {/* Right Column: Results */}
        <div className="md:col-span-7 lg:col-span-8">
          <div className="relative">
            {/* Scan line effect overlay if scanning */}
            {status === ScanStatus.SCANNING && (
              <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden rounded-2xl">
                 <div className="scan-line"></div>
              </div>
            )}
            <ResultsLog 
              results={results} 
              status={status}
              scannedCount={currentPort}
            />
          </div>
        </div>
      </main>

      <footer className="relative z-10 mt-12 text-center text-gray-500 text-xs font-mono">
        <p>V1.0.0 &bull; BROWSER_BASED_TOOL &bull; USE_RESPONSIBLY</p>
      </footer>
    </div>
  );
}

export default App;
