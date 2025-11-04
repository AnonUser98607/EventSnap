import { Plus, ScanLine, Image } from 'lucide-react';

interface HomePageProps {
  onCreateEvent: () => void;
  onJoinEvent: () => void;
  onViewEvents: () => void;
  hasEvents: boolean;
}

export function HomePage({ onCreateEvent, onJoinEvent, onViewEvents, hasEvents }: HomePageProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-teal-900/20" />
      
      <div className="w-full max-w-md space-y-6 relative z-10">
        <div className="text-center mb-12">
          <h1 className="mb-2 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            📸 EventSnap
          </h1>
          <p className="text-muted-foreground">Gemeinsame Event-Fotoalben</p>
        </div>
        
        <div className="space-y-4">
          <button
            onClick={onCreateEvent}
            className="w-full p-6 rounded-2xl backdrop-blur-xl bg-gradient-to-br from-blue-500/80 to-purple-500/80 text-white shadow-2xl hover:shadow-blue-500/50 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3"
          >
            <Plus size={24} />
            <span>Event erstellen</span>
          </button>
          
          <button
            onClick={onJoinEvent}
            className="w-full p-6 rounded-2xl backdrop-blur-xl bg-white/10 border border-white/20 text-white shadow-xl hover:bg-white/15 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3"
          >
            <ScanLine size={24} />
            <span>Event beitreten</span>
          </button>
          
          {hasEvents && (
            <button
              onClick={onViewEvents}
              className="w-full p-6 rounded-2xl backdrop-blur-xl bg-white/10 border border-white/20 text-white shadow-xl hover:bg-white/15 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3"
            >
              <Image size={24} />
              <span>Meine Events</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
