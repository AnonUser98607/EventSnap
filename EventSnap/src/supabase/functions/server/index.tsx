import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'npm:@supabase/supabase-js@2';
import * as kv from './kv_store.tsx';

const app = new Hono();

app.use('*', cors());
app.use('*', logger(console.log));

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const BUCKET_NAME = 'make-5836e3ac-event-photos';

// Initialize storage bucket
async function initBucket() {
  const { data: buckets } = await supabase.storage.listBuckets();
  const bucketExists = buckets?.some(bucket => bucket.name === BUCKET_NAME);
  if (!bucketExists) {
    await supabase.storage.createBucket(BUCKET_NAME, {
      public: false,
      fileSizeLimit: 5242880, // 5MB
    });
    console.log('Created storage bucket:', BUCKET_NAME);
  }
}

initBucket();

// Auto-delete expired events (run periodically)
async function cleanupExpiredEvents() {
  try {
    const allEvents = await kv.getByPrefix('event:');
    const now = Date.now();
    
    for (const event of allEvents) {
      if (event.expiresAt && event.expiresAt < now) {
        // Delete all photos for this event
        const photos = await kv.getByPrefix(`photo:${event.id}:`);
        for (const photo of photos) {
          try {
            await supabase.storage.from(BUCKET_NAME).remove([photo.path]);
          } catch (e) {
            console.log('Error deleting photo from storage:', e);
          }
          await kv.del(`photo:${event.id}:${photo.id}`);
        }
        
        // Delete event
        await kv.del(`event:${event.id}`);
        console.log('Deleted expired event:', event.id);
      }
    }
  } catch (error) {
    console.log('Error during cleanup:', error);
  }
}

// Run cleanup every hour
setInterval(cleanupExpiredEvents, 3600000);

// Create event
app.post('/make-server-5836e3ac/events', async (c) => {
  try {
    const { name, maxPhotosPerUser, expiryDays } = await c.req.json();
    
    if (!name || !maxPhotosPerUser || !expiryDays) {
      return c.json({ error: 'Missing required fields' }, 400);
    }
    
    if (expiryDays > 30) {
      return c.json({ error: 'Maximum expiry time is 30 days' }, 400);
    }
    
    const eventId = crypto.randomUUID();
    const expiresAt = Date.now() + (expiryDays * 24 * 60 * 60 * 1000);
    
    const event = {
      id: eventId,
      name,
      maxPhotosPerUser,
      expiryDays,
      expiresAt,
      createdAt: Date.now(),
    };
    
    await kv.set(`event:${eventId}`, event);
    
    return c.json({ event });
  } catch (error) {
    console.log('Error creating event:', error);
    return c.json({ error: 'Failed to create event' }, 500);
  }
});

// Get event
app.get('/make-server-5836e3ac/events/:eventId', async (c) => {
  try {
    const eventId = c.req.param('eventId');
    const event = await kv.get(`event:${eventId}`);
    
    if (!event) {
      return c.json({ error: 'Event not found' }, 404);
    }
    
    // Check if expired
    if (event.expiresAt && event.expiresAt < Date.now()) {
      return c.json({ error: 'Event has expired' }, 410);
    }
    
    return c.json({ event });
  } catch (error) {
    console.log('Error fetching event:', error);
    return c.json({ error: 'Failed to fetch event' }, 500);
  }
});

// Upload photo
app.post('/make-server-5836e3ac/events/:eventId/photos', async (c) => {
  try {
    const eventId = c.req.param('eventId');
    const { photoData, userId } = await c.req.json();
    
    if (!photoData || !userId) {
      return c.json({ error: 'Missing photo data or user ID' }, 400);
    }
    
    // Get event
    const event = await kv.get(`event:${eventId}`);
    if (!event) {
      return c.json({ error: 'Event not found' }, 404);
    }
    
    // Check if expired
    if (event.expiresAt && event.expiresAt < Date.now()) {
      return c.json({ error: 'Event has expired' }, 410);
    }
    
    // Count user's photos
    const userPhotos = await kv.getByPrefix(`photo:${eventId}:${userId}`);
    if (userPhotos.length >= event.maxPhotosPerUser) {
      return c.json({ error: 'Photo limit reached' }, 403);
    }
    
    // Convert base64 to blob
    const base64Data = photoData.split(',')[1];
    const binaryData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
    
    // Generate photo ID
    const photoId = crypto.randomUUID();
    const fileName = `${eventId}/${userId}/${photoId}.jpg`;
    
    // Upload to storage
    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, binaryData, {
        contentType: 'image/jpeg',
        upsert: false,
      });
    
    if (uploadError) {
      console.log('Storage upload error:', uploadError);
      return c.json({ error: 'Failed to upload photo' }, 500);
    }
    
    // Save photo metadata
    const photo = {
      id: photoId,
      eventId,
      userId,
      path: fileName,
      uploadedAt: Date.now(),
    };
    
    await kv.set(`photo:${eventId}:${userId}:${photoId}`, photo);
    
    return c.json({ photo });
  } catch (error) {
    console.log('Error uploading photo:', error);
    return c.json({ error: 'Failed to upload photo' }, 500);
  }
});

// Get all photos for event
app.get('/make-server-5836e3ac/events/:eventId/photos', async (c) => {
  try {
    const eventId = c.req.param('eventId');
    
    // Get event
    const event = await kv.get(`event:${eventId}`);
    if (!event) {
      return c.json({ error: 'Event not found' }, 404);
    }
    
    // Check if expired
    if (event.expiresAt && event.expiresAt < Date.now()) {
      return c.json({ error: 'Event has expired' }, 410);
    }
    
    // Get all photos for this event
    const photos = await kv.getByPrefix(`photo:${eventId}:`);
    
    // Generate signed URLs for all photos
    const photosWithUrls = await Promise.all(
      photos.map(async (photo) => {
        const { data } = await supabase.storage
          .from(BUCKET_NAME)
          .createSignedUrl(photo.path, 3600); // 1 hour expiry
        
        return {
          ...photo,
          url: data?.signedUrl,
        };
      })
    );
    
    return c.json({ photos: photosWithUrls });
  } catch (error) {
    console.log('Error fetching photos:', error);
    return c.json({ error: 'Failed to fetch photos' }, 500);
  }
});

// Get user photo count
app.get('/make-server-5836e3ac/events/:eventId/users/:userId/count', async (c) => {
  try {
    const eventId = c.req.param('eventId');
    const userId = c.req.param('userId');
    
    const userPhotos = await kv.getByPrefix(`photo:${eventId}:${userId}`);
    
    return c.json({ count: userPhotos.length });
  } catch (error) {
    console.log('Error fetching photo count:', error);
    return c.json({ error: 'Failed to fetch photo count' }, 500);
  }
});

Deno.serve(app.fetch);
