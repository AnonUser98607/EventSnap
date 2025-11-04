import { useState } from 'react';
import { ArrowLeft, Download } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

interface CreateEventProps {
  onBack: () => void;
  onEventCreated: (eventId: string) => void;
  apiUrl: string;
  publicAnonKey: string;
}

export function CreateEvent({ onBack, onEventCreated, apiUrl, publicAnonKey }: CreateEventProps) {
  const [step, setStep] = useState<'form' | 'qr'>('form');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    maxPhotosPerUser: 10,
    expiryDays: 7,
  });
  
  const [eventId, setEventId] = useState('');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      console.log('Creating event with:', { apiUrl, formData });
      const response = await fetch(`${apiUrl}/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify(formData),
      });
      
      const responseData = await response.json();
      
      if (!response.ok) {
        console.error('Event creation failed:', responseData);
        throw new Error(responseData.error || `Fehler beim Erstellen des Events (Status: ${response.status})`);
      }
      
      const { event } = responseData;
      setEventId(event.id);
      setStep('qr');
    } catch (err: any) {
      console.error('Event creation error:', err);
      setError(err.message || 'Fehler beim Erstellen des Events. Bitte versuche es erneut.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleDownloadQR = () => {
    const svg = document.querySelector('#qr-code');
    if (!svg) return;
    
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `event-${eventId}.png`;
          a.click();
          URL.revokeObjectURL(url);
        }
      });
    };
    
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };
  
  const eventUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}?event=${eventId}` 
    : '';
  
  if (step === 'qr') {
    return (
      <div className="min-h-screen bg-background flex flex-col p-6 relative overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-900/20 via-blue-900/20 to-purple-900/20" />
        
        <div className="relative z-10">
          <button
            onClick={onBack}
            className="mb-6 p-3 rounded-full backdrop-blur-xl bg-white/10 text-white hover:bg-white/20 transition-all"
          >
            <ArrowLeft size={24} />
          </button>
        </div>
        
        <div className="flex-1 flex flex-col items-center justify-center space-y-6 relative z-10">
          <div className="text-center">
            <h2 className="mb-2 bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              Event erstellt!
            </h2>
            <p className="text-white/80">
              {formData.name}
            </p>
          </div>
          
          <div className="backdrop-blur-xl bg-white/95 p-8 rounded-3xl shadow-2xl">
            <QRCodeSVG
              id="qr-code"
              value={eventUrl}
              size={256}
              level="H"
              includeMargin={true}
            />
          </div>
          
          <div className="w-full max-w-md space-y-3">
            <button
              onClick={handleDownloadQR}
              className="w-full backdrop-blur-xl bg-gradient-to-br from-blue-500/80 to-purple-500/80 text-white p-4 rounded-2xl shadow-xl hover:shadow-blue-500/50 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <Download size={20} />
              <span>QR-Code herunterladen</span>
            </button>
            
            <button
              onClick={() => {
                onEventCreated(eventId);
              }}
              className="w-full backdrop-blur-xl bg-white/10 border border-white/20 text-white p-4 rounded-2xl shadow-xl hover:bg-white/15 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Event beitreten
            </button>
          </div>
          
          <div className="text-center mt-4">
            <p className="text-sm text-white/60">
              Max. {formData.maxPhotosPerUser} Fotos pro Person
            </p>
            <p className="text-sm text-white/60">
              Läuft ab in {formData.expiryDays} Tagen
            </p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background flex flex-col p-6 relative overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-pink-900/20" />
      
      <div className="relative z-10">
        <button
          onClick={onBack}
          className="mb-6 p-3 rounded-full backdrop-blur-xl bg-white/10 text-white hover:bg-white/20 transition-all"
        >
          <ArrowLeft size={24} />
        </button>
      </div>
      
      <div className="flex-1 flex flex-col justify-center relative z-10">
        <h2 className="mb-8 text-center bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
          Event erstellen
        </h2>
        
        <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto space-y-6">
          <div>
            <label className="block mb-2 text-white/90">
              Event-Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full p-4 rounded-2xl backdrop-blur-xl bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="z.B. Hochzeit Maria & Tom"
            />
          </div>
          
          <div>
            <label className="block mb-2 text-white/90">
              Max. Fotos pro Person
            </label>
            <input
              type="number"
              min="1"
              max="100"
              value={formData.maxPhotosPerUser}
              onChange={(e) => setFormData({ ...formData, maxPhotosPerUser: parseInt(e.target.value) })}
              required
              className="w-full p-4 rounded-2xl backdrop-blur-xl bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          
          <div>
            <label className="block mb-2 text-white/90">
              Ablaufzeit (Tage, max. 30)
            </label>
            <input
              type="number"
              min="1"
              max="30"
              value={formData.expiryDays}
              onChange={(e) => setFormData({ ...formData, expiryDays: parseInt(e.target.value) })}
              required
              className="w-full p-4 rounded-2xl backdrop-blur-xl bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          
          {error && (
            <div className="p-4 rounded-2xl backdrop-blur-xl bg-red-500/20 border border-red-400/50 text-red-300">
              {error}
            </div>
          )}
          
          <button
            type="submit"
            disabled={loading}
            className="w-full backdrop-blur-xl bg-gradient-to-br from-blue-500/80 to-purple-500/80 text-white p-4 rounded-2xl shadow-xl hover:shadow-blue-500/50 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100"
          >
            {loading ? 'Erstelle Event...' : 'Event erstellen'}
          </button>
        </form>
      </div>
    </div>
  );
}
