import { ScanResult } from '../types';

/**
 * Attempts to connect to a specific port on a target IP using fetch.
 * 
 * NOTE: Browser-based port scanning is severely limited by browser security sandboxes.
 * 1. Many ports (21, 22, 23, 25, etc.) are explicitly blocked by browsers for safety.
 * 2. CORS policies prevent reading actual responses from most open services.
 * 3. We use a "timed fetch" heuristic:
 *    - If we get an opaque response (mode: no-cors), the port is likely OPEN (running HTTP/Web).
 *    - If we get a quick "Connection Refused", it is CLOSED.
 *    - If it times out, it might be FILTERED (firewall) or just slow. We count this as CLOSED/FILTERED for this simple app.
 */
export const checkPort = async (
  ip: string, 
  port: number, 
  timeout: number
): Promise<ScanResult> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  const startTime = Date.now();

  try {
    // Attempt a HEAD request (lighter than GET)
    await fetch(`http://${ip}:${port}`, {
      method: 'HEAD',
      mode: 'no-cors', // Required to attempt connection across origins
      cache: 'no-cache',
      signal: controller.signal,
    });
    
    // If fetch resolves (even with opaque response), the port accepted the TCP connection.
    clearTimeout(timeoutId);
    return { port, status: 'OPEN', timestamp: Date.now() };

  } catch (error: any) {
    clearTimeout(timeoutId);
    
    // Distinguish between timeout and other errors if possible
    // Note: Error messages vary by browser.
    
    // "The user aborted a request" usually means our timeout fired.
    if (error.name === 'AbortError') {
      return { port, status: 'CLOSED', timestamp: Date.now() }; // Treating timeout as closed/filtered
    }

    // "ERR_UNSAFE_PORT" or similar
    if (error.message && error.message.toLowerCase().includes('unsafe')) {
      return { port, status: 'BLOCKED', timestamp: Date.now() };
    }

    // General connection error (refused, reset, etc.)
    return { port, status: 'CLOSED', timestamp: Date.now() };
  }
};
