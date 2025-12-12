export interface ScanResult {
  port: number;
  status: 'OPEN' | 'CLOSED' | 'BLOCKED';
  timestamp: number;
}

export interface ScanConfig {
  targetIp: string;
  startPort: number;
  endPort: number;
  timeout: number;
}

export enum ScanStatus {
  IDLE = 'IDLE',
  SCANNING = 'SCANNING',
  COMPLETED = 'COMPLETED',
  STOPPED = 'STOPPED'
}
