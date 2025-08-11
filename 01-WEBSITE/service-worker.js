// Chris David Salon - Service Worker v1.0.0
// Enables offline functionality, caching, and push notifications

const CACHE_NAME = 'cds-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/styles.css',
  '/images/CDS_Logo.jpg',
  '/images/salon-hero.jpg',
  '/images/hair-color.jpg',
  '/images/hair-cut.jpg',
  '/images/hair-extensions.jpg',
  '/images/keratin-treatment.jpg',
  'https://cdn.tailwindcss.com',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css'
];

// Install Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .catch(err => console.log('Cache failed:', err))
  );
  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
});

// Activate Service Worker
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Claim all clients
  self.clients.claim();
});

// Fetch Strategy: Network First, Cache Fallback
self.addEventListener('fetch', event => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Check if valid response
        if (!response || response.status !== 200 || response.type === 'opaque') {
          return response;
        }

        // Clone the response
        const responseToCache = response.clone();

        caches.open(CACHE_NAME)
          .then(cache => {
            cache.put(event.request, responseToCache);
          });

        return response;
      })
      .catch(() => {
        // Network failed, try cache
        return caches.match(event.request)
          .then(response => {
            if (response) {
              return response;
            }
            // Return offline page if available
            if (event.request.destination === 'document') {
              return caches.match('/offline.html');
            }
          });
      })
  );
});

// Push Notification Support
self.addEventListener('push', event => {
  const options = {
    body: event.data ? event.data.text() : 'New notification from Chris David Salon',
    icon: '/images/icon-192.png',
    badge: '/images/icon-72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'book',
        title: 'Book Now',
        icon: '/images/icon-book.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/images/icon-close.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Chris David Salon', options)
  );
});

// Notification Click Handler
self.addEventListener('notificationclick', event => {
  event.notification.close();

  if (event.action === 'book') {
    // Open booking page
    clients.openWindow('https://www.chrisdavidsalonbooking.com');
  } else {
    // Open main site
    clients.openWindow('/');
  }
});

// Background Sync for Offline Booking Attempts
self.addEventListener('sync', event => {
  if (event.tag === 'booking-sync') {
    event.waitUntil(syncBookings());
  }
});

async function syncBookings() {
  // Get pending bookings from IndexedDB
  const pendingBookings = await getPendingBookings();
  
  for (const booking of pendingBookings) {
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(booking)
      });
      
      if (response.ok) {
        // Remove from pending
        await removePendingBooking(booking.id);
      }
    } catch (error) {
      console.log('Sync failed, will retry:', error);
    }
  }
}

// Helper functions for IndexedDB (simplified)
async function getPendingBookings() {
  // Implementation would connect to IndexedDB
  return [];
}

async function removePendingBooking(id) {
  // Implementation would remove from IndexedDB
}

// Periodic Background Sync for Appointment Reminders
self.addEventListener('periodicsync', event => {
  if (event.tag === 'appointment-reminder') {
    event.waitUntil(checkUpcomingAppointments());
  }
});

async function checkUpcomingAppointments() {
  try {
    const response = await fetch('/api/appointments/upcoming');
    const appointments = await response.json();
    
    appointments.forEach(apt => {
      if (shouldRemind(apt)) {
        self.registration.showNotification('Appointment Reminder', {
          body: `Your appointment is tomorrow at ${apt.time}`,
          icon: '/images/icon-192.png',
          tag: 'appointment-reminder',
          requireInteraction: true
        });
      }
    });
  } catch (error) {
    console.log('Failed to check appointments:', error);
  }
}

function shouldRemind(appointment) {
  const aptDate = new Date(appointment.date);
  const now = new Date();
  const hoursDiff = (aptDate - now) / (1000 * 60 * 60);
  return hoursDiff <= 24 && hoursDiff > 0;
}

console.log('Service Worker loaded successfully');