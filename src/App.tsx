import { useState, useEffect } from 'react';
import { HomePage } from './components/HomePage';
import { CreateEvent } from './components/CreateEvent';
import { JoinEvent } from './components/JoinEvent';
import { EventsList } from './components/EventsList';
import { Camera } from './components/Camera';
import { EventGallery } from './components/EventGallery';
import { getUserId, getJoinedEvents, addJoinedEvent } from './utils/cookies';
import { projectId, publicAnonKey } from './utils/supabase/info';

type Screen = 'home' | 'create' | 'join' | 'events' | 'camera' | 'gallery';

interface Event {
  id: string;
  name: string;
  maxPhotosPerUser: number;
  expiryDays: number;
  expiresAt: number;
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [currentEventId, setCurrentEventId] = useState<string | null>(null);
  const [currentEvent, setCurrentEvent] = useState<Event | null>(null);
  const [joinedEvents, setJoinedEvents] = useState(getJoinedEvents());
  const [photoCount, setPhotoCount] = useState(0);
  const [uploading, setUploading] = useState(false);
  
  const apiUrl = `https://${projectId}.supabase.co/functions/v1/make-server-5836e3ac`;
  const userId = getUserId();
  
  useEffect(() => {
    // Check for event parameter in URL
    const params = new URLSearchParams(window.location.search);
    const eventId = params.get('event');
    
    if (eventId) {
      handleEventJoined(eventId);
      // Clear URL parameter
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);
  
  useEffect(() => {
    if (currentEventId) {
      loadEvent(currentEventId);
      loadPhotoCount(currentEventId);
    }
  }, [currentEventId]);
  
  const loadEvent = async (eventId: string) => {
    try {
      const response = await fetch(`${apiUrl}/events/${eventId}`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Event nicht gefunden');
      }
      
      const data = await response.json();
      setCurrentEvent(data.event);
    } catch (err) {
      console.error('Load event error:', err);
      alert('Event konnte nicht geladen werden');
      setScreen('home');
    }
  };
  
  const loadPhotoCount = async (eventId: string) => {
    try {
      const response = await fetch(
        `${apiUrl}/events/${eventId}/users/${userId}/count`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        setPhotoCount(data.count);
      }
    } catch (err) {
      console.error('Load photo count error:', err);
    }
  };
  
  const handleEventCreated = (eventId: string) => {
    handleEventJoined(eventId);
  };
  
  const handleEventJoined = async (eventId: string) => {
    try {
      const response = await fetch(`${apiUrl}/events/${eventId}`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Event nicht gefunden');
      }
      
      const data = await response.json();
      
      // Add to joined events
      addJoinedEvent(eventId, data.event.name);
      setJoinedEvents(getJoinedEvents());
      
      // Set current event
      setCurrentEventId(eventId);
      setCurrentEvent(data.event);
      setScreen('gallery');
    } catch (err: any) {
      console.error('Join event error:', err);
      alert(err.message || 'Event konnte nicht beigetreten werden');
    }
  };
  
  const handlePhotoTaken = async (photoData: string) => {
    if (!currentEventId || uploading) return;
    
    setUploading(true);
    
    try {
      const response = await fetch(`${apiUrl}/events/${currentEventId}/photos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({
          photoData,
          userId,
        }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Fehler beim Hochladen');
      }
      
      // Update photo count
      setPhotoCount(prev => prev + 1);
      
      // Go back to gallery
      setScreen('gallery');
    } catch (err: any) {
      console.error('Upload error:', err);
      alert(err.message || 'Foto konnte nicht hochgeladen werden');
    } finally {
      setUploading(false);
    }
  };
  
  const remainingPhotos = currentEvent 
    ? Math.max(0, currentEvent.maxPhotosPerUser - photoCount)
    : 0;
  
  if (screen === 'create') {
    return (
      <CreateEvent
        onBack={() => setScreen('home')}
        onEventCreated={handleEventCreated}
        apiUrl={apiUrl}
        publicAnonKey={publicAnonKey}
      />
    );
  }
  
  if (screen === 'join') {
    return (
      <JoinEvent
        onBack={() => setScreen('home')}
        onEventJoined={handleEventJoined}
        apiUrl={apiUrl}
        publicAnonKey={publicAnonKey}
      />
    );
  }
  
  if (screen === 'events') {
    return (
      <EventsList
        onBack={() => setScreen('home')}
        onSelectEvent={(eventId) => {
          setCurrentEventId(eventId);
          setScreen('gallery');
        }}
        events={joinedEvents}
      />
    );
  }
  
  if (screen === 'camera' && currentEventId && currentEvent) {
    return (
      <Camera
        onBack={() => setScreen('gallery')}
        onPhotoTaken={handlePhotoTaken}
        onViewGallery={() => setScreen('gallery')}
        remainingPhotos={remainingPhotos}
        eventName={currentEvent.name}
      />
    );
  }
  
  if (screen === 'gallery' && currentEventId && currentEvent) {
    return (
      <EventGallery
        onBack={() => setScreen('home')}
        onTakePhoto={() => setScreen('camera')}
        eventId={currentEventId}
        eventName={currentEvent.name}
        apiUrl={apiUrl}
        publicAnonKey={publicAnonKey}
        remainingPhotos={remainingPhotos}
      />
    );
  }
  
  return (
    <HomePage
      onCreateEvent={() => setScreen('create')}
      onJoinEvent={() => setScreen('join')}
      onViewEvents={() => setScreen('events')}
      hasEvents={joinedEvents.length > 0}
    />
  );
}
