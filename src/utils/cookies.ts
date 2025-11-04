export function setCookie(name: string, value: string, days: number = 365) {
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  const expires = `expires=${date.toUTCString()}`;
  document.cookie = `${name}=${value};${expires};path=/`;
}

export function getCookie(name: string): string | null {
  const nameEQ = `${name}=`;
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}

export function getUserId(): string {
  let userId = getCookie('userId');
  if (!userId) {
    userId = crypto.randomUUID();
    setCookie('userId', userId);
  }
  return userId;
}

export function getJoinedEvents(): Array<{ id: string; name: string }> {
  const eventsStr = getCookie('joinedEvents');
  if (!eventsStr) return [];
  
  try {
    return JSON.parse(decodeURIComponent(eventsStr));
  } catch {
    return [];
  }
}

export function addJoinedEvent(eventId: string, eventName: string) {
  const events = getJoinedEvents();
  
  // Check if already exists
  if (events.some(e => e.id === eventId)) return;
  
  events.push({ id: eventId, name: eventName });
  setCookie('joinedEvents', encodeURIComponent(JSON.stringify(events)));
}
