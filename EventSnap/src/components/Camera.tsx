import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Camera as CameraIcon, Zap, ZapOff, Image } from 'lucide-react';

interface CameraProps {
  onBack: () => void;
  onPhotoTaken: (photoData: string) => void;
  onViewGallery: () => void;
  remainingPhotos: number;
  eventName: string;
}

export function Camera({ onBack, onPhotoTaken, onViewGallery, remainingPhotos, eventName }: CameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [error, setError] = useState('');
  const [cameraReady, setCameraReady] = useState(false);
  
  useEffect(() => {
    startCamera();
    
    return () => {
      stopCamera();
    };
  }, []);
  
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          aspectRatio: 4 / 3,
        },
        audio: false,
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setCameraReady(true);
      }
      
      // Check if flash is supported
      const track = stream.getVideoTracks()[0];
      const capabilities = track.getCapabilities();
      if (!(capabilities as any).torch) {
        // Flash not supported
      }
    } catch (err: any) {
      console.error('Camera start error:', err);
      if (err.name === 'NotAllowedError') {
        setError('Kamera-Zugriff verweigert. Bitte erlaube den Zugriff in deinen Browser-Einstellungen.');
      } else if (err.name === 'NotFoundError') {
        setError('Keine Kamera gefunden.');
      } else {
        setError('Kamera-Zugriff fehlgeschlagen. Stelle sicher, dass keine andere App die Kamera verwendet.');
      }
    }
  };
  
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
  };
  
  const toggleFlash = async () => {
    if (!streamRef.current) return;
    
    try {
      const track = streamRef.current.getVideoTracks()[0];
      const capabilities = track.getCapabilities();
      
      if ((capabilities as any).torch) {
        await track.applyConstraints({
          advanced: [{ torch: !flashEnabled } as any],
        });
        setFlashEnabled(!flashEnabled);
      }
    } catch (err) {
      console.error('Flash toggle error:', err);
    }
  };
  
  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current || capturing) return;
    
    setCapturing(true);
    
    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Set canvas to 4:3 ratio at max 1080p
      const maxWidth = 1440; // 1440x1080 = 4:3 ratio
      const maxHeight = 1080;
      
      let width = video.videoWidth;
      let height = video.videoHeight;
      
      // Scale down if needed
      if (width > maxWidth || height > maxHeight) {
        const scale = Math.min(maxWidth / width, maxHeight / height);
        width = width * scale;
        height = height * scale;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas context not available');
      
      // Draw video frame
      ctx.drawImage(video, 0, 0, width, height);
      
      // Convert to JPEG with compression
      const photoData = canvas.toDataURL('image/jpeg', 0.85);
      
      onPhotoTaken(photoData);
    } catch (err: any) {
      console.error('Photo capture error:', err);
      setError('Foto konnte nicht aufgenommen werden');
    } finally {
      setCapturing(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-black flex flex-col relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 z-10 p-4">
        <div className="backdrop-blur-xl bg-black/40 rounded-3xl border border-white/20 p-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => {
                stopCamera();
                onBack();
              }}
              className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all"
            >
              <ArrowLeft size={24} />
            </button>
            
            <div className="text-center flex-1">
              <p className="text-white">{eventName}</p>
              <p className="text-white/70 text-sm">
                {remainingPhotos} Fotos verbleibend
              </p>
            </div>
            
            <button
              onClick={onViewGallery}
              className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all"
            >
              <Image size={24} />
            </button>
          </div>
        </div>
      </div>
      
      <div className="flex-1 relative flex items-center justify-center">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          playsInline
          muted
        />
        <canvas ref={canvasRef} className="hidden" />
        
        {!cameraReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-black">
            <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6">
              <p className="text-white">Kamera wird geladen...</p>
            </div>
          </div>
        )}
        
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black p-6">
            <div className="text-center backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8">
              <p className="text-white mb-4">{error}</p>
              <button
                onClick={() => {
                  stopCamera();
                  onBack();
                }}
                className="backdrop-blur-xl bg-gradient-to-br from-blue-500/80 to-purple-500/80 text-white px-6 py-3 rounded-2xl"
              >
                Zurück
              </button>
            </div>
          </div>
        )}
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 z-10 p-8">
        <div className="backdrop-blur-xl bg-black/40 rounded-3xl border border-white/20 p-6">
          <div className="flex items-center justify-center gap-8">
            <button
              onClick={toggleFlash}
              className="p-4 rounded-full backdrop-blur-xl bg-white/10 text-white hover:bg-white/20 transition-all"
            >
              {flashEnabled ? <Zap size={24} /> : <ZapOff size={24} />}
            </button>
            
            <button
              onClick={capturePhoto}
              disabled={!cameraReady || capturing || remainingPhotos === 0}
              className="w-20 h-20 rounded-full bg-white border-4 border-white/30 disabled:opacity-50 flex items-center justify-center shadow-2xl shadow-white/20 hover:scale-105 active:scale-95 transition-transform"
            >
              <CameraIcon size={32} className="text-black" />
            </button>
            
            <div className="w-16" />
          </div>
        </div>
      </div>
    </div>
  );
}
