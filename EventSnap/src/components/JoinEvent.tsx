import { useEffect, useRef, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';

interface JoinEventProps {
  onBack: () => void;
  onEventJoined: (eventId: string) => void;
  apiUrl: string;
  publicAnonKey: string;
}

export function JoinEvent({ onBack, onEventJoined, apiUrl, publicAnonKey }: JoinEventProps) {
  const [error, setError] = useState('');
  const [scanning, setScanning] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const mountedRef = useRef(true);
  
  useEffect(() => {
    mountedRef.current = true;
    startScanner();
    
    return () => {
      mountedRef.current = false;
      stopScanner();
    };
  }, []);
  
  const startScanner = async () => {
    try {
      const scanner = new Html5Qrcode('qr-reader');
      scannerRef.current = scanner;
      
      await scanner.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        onScanSuccess,
        onScanFailure
      );
      
      setScanning(true);
      setError('');
    } catch (err: any) {
      console.error('Scanner start error:', err);
      if (err.name === 'NotAllowedError' || err.message?.includes('Permission denied')) {
        setError('Kamera-Zugriff verweigert. Bitte erlaube den Zugriff in deinen Browser-Einstellungen.');
      } else {
        setError('Kamera-Zugriff fehlgeschlagen. Stelle sicher, dass keine andere App die Kamera verwendet.');
      }
    }
  };
  
  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        const state = scannerRef.current.getState();
        if (state === 2) { // SCANNING state
          await scannerRef.current.stop();
        }
        scannerRef.current.clear();
        scannerRef.current = null;
      } catch (err) {
        console.error('Scanner stop error:', err);
        // Ignore errors when stopping - scanner might already be stopped
      }
    }
  };
  
  const onScanSuccess = async (decodedText: string) => {
    if (!mountedRef.current) return;
    
    try {
      // Extract event ID from URL
      const url = new URL(decodedText);
      const eventId = url.searchParams.get('event');
      
      if (!eventId) {
        setError('Ungültiger QR-Code');
        return;
      }
      
      // Verify event exists
      const response = await fetch(`${apiUrl}/events/${eventId}`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Event nicht gefunden');
      }
      
      await stopScanner();
      onEventJoined(eventId);
    } catch (err: any) {
      console.error('QR scan error:', err);
      setError(err.message || 'Ungültiger QR-Code');
    }
  };
  
  const onScanFailure = (error: string) => {
    // Ignore scan failures - they happen constantly while scanning
  };
  
  return (
    <div className="min-h-screen bg-background flex flex-col p-6 relative overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-purple-900/20 to-pink-900/20" />
      
      <div className="relative z-10">
        <button
          onClick={async () => {
            await stopScanner();
            onBack();
          }}
          className="mb-6 p-3 rounded-full backdrop-blur-xl bg-white/10 text-white hover:bg-white/20 transition-all"
        >
          <ArrowLeft size={24} />
        </button>
      </div>
      
      <div className="flex-1 flex flex-col items-center justify-center space-y-6 relative z-10">
        <div className="text-center">
          <h2 className="mb-2 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            QR-Code scannen
          </h2>
          <p className="text-white/70">
            Halte die Kamera auf den Event-QR-Code
          </p>
        </div>
        
        <div className="w-full max-w-md">
          <div 
            id="qr-reader" 
            className="rounded-3xl overflow-hidden shadow-2xl backdrop-blur-xl border-2 border-white/20"
          />
        </div>
        
        {error && (
          <div className="w-full max-w-md">
            <div className="p-4 rounded-2xl backdrop-blur-xl bg-red-500/20 border border-red-400/50 text-red-300 text-center">
              {error}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
