import { ArrowLeft, ChevronRight } from 'lucide-react';

interface Event {
  id: string;
  name: string;
}

interface EventsListProps {
  onBack: () => void;
  onSelectEvent: (eventId: string) => void;
  events: Event[];
}

export function EventsList({ onBack, onSelectEvent, events }: EventsListProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col p-6 relative overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/20 via-blue-900/20 to-purple-900/20" />
      
      <div className="relative z-10">
        <button
          onClick={onBack}
          className="mb-6 p-3 rounded-full backdrop-blur-xl bg-white/10 text-white hover:bg-white/20 transition-all"
        >
          <ArrowLeft size={24} />
        </button>
      </div>
      
      <div className="flex-1 flex flex-col relative z-10">
        <h2 className="mb-6 text-center bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
          Meine Events
        </h2>
        
        <div className="w-full max-w-md mx-auto space-y-3">
          {events.length === 0 ? (
            <div className="text-center p-8 text-white/60">
              Noch keine Events beigetreten
            </div>
          ) : (
            events.map((event) => (
              <button
                key={event.id}
                onClick={() => onSelectEvent(event.id)}
                className="w-full backdrop-blur-xl bg-white/10 border border-white/20 text-white p-5 rounded-2xl shadow-xl hover:bg-white/15 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-between"
              >
                <span>{event.name}</span>
                <ChevronRight size={20} />
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
