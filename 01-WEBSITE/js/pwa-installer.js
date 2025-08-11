// PWA Installation Handler for Chris David Salon
let deferredPrompt;
let installButton;

// Check if PWA is already installed
function isPWAInstalled() {
  return window.matchMedia('(display-mode: standalone)').matches || 
         window.navigator.standalone === true;
}

// Initialize PWA features
function initPWA() {
  // Register service worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('Service Worker registered:', registration);
        
        // Check for updates every hour
        setInterval(() => {
          registration.update();
        }, 3600000);
      })
      .catch(error => {
        console.log('Service Worker registration failed:', error);
      });
  }

  // Listen for install prompt
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    showInstallPromotion();
  });

  // Listen for successful install
  window.addEventListener('appinstalled', () => {
    console.log('PWA was installed');
    hideInstallPromotion();
    trackInstallation();
  });

  // Check if should show iOS install instructions
  if (isIOS() && !isPWAInstalled()) {
    showIOSInstallInstructions();
  }
}

// Show install promotion UI
function showInstallPromotion() {
  // Create install banner if it doesn't exist
  if (!document.getElementById('pwa-install-banner')) {
    createInstallBanner();
  }
  
  const banner = document.getElementById('pwa-install-banner');
  if (banner) {
    banner.style.display = 'block';
    
    // Auto-show after 30 seconds on page
    setTimeout(() => {
      if (!isPWAInstalled() && deferredPrompt) {
        banner.classList.add('show');
      }
    }, 30000);
  }
}

// Create the install banner
function createInstallBanner() {
  const banner = document.createElement('div');
  banner.id = 'pwa-install-banner';
  banner.className = 'fixed bottom-0 left-0 right-0 bg-gradient-to-r from-purple-900 to-indigo-900 text-white p-4 transform translate-y-full transition-transform duration-500 z-50 shadow-lg';
  banner.innerHTML = `
    <div class="max-w-7xl mx-auto flex items-center justify-between">
      <div class="flex items-center space-x-4">
        <div class="bg-white rounded-lg p-2">
          <img src="/images/icon-72.png" alt="CD Salon" class="w-12 h-12">
        </div>
        <div>
          <div class="font-bold text-lg">Install Chris David Salon App</div>
          <div class="text-sm opacity-90">Book faster, get reminders, work offline!</div>
        </div>
      </div>
      <div class="flex space-x-2">
        <button id="pwa-install-btn" class="bg-yellow-600 text-white px-6 py-2 rounded-full hover:bg-yellow-700 font-semibold">
          Install
        </button>
        <button id="pwa-dismiss-btn" class="bg-white/20 text-white px-4 py-2 rounded-full hover:bg-white/30">
          Not Now
        </button>
      </div>
    </div>
  `;
  
  document.body.appendChild(banner);
  
  // Add event listeners
  document.getElementById('pwa-install-btn').addEventListener('click', installPWA);
  document.getElementById('pwa-dismiss-btn').addEventListener('click', dismissInstallBanner);
  
  // Show banner after a short delay
  setTimeout(() => {
    banner.classList.remove('translate-y-full');
  }, 1000);
}

// Install the PWA
async function installPWA() {
  if (!deferredPrompt) {
    console.log('Install prompt not available');
    return;
  }

  const banner = document.getElementById('pwa-install-banner');
  if (banner) {
    banner.style.display = 'none';
  }

  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  
  console.log(`User response: ${outcome}`);
  
  if (outcome === 'accepted') {
    console.log('User accepted the install prompt');
    trackInstallation();
  }
  
  deferredPrompt = null;
}

// Hide install promotion
function hideInstallPromotion() {
  const banner = document.getElementById('pwa-install-banner');
  if (banner) {
    banner.classList.add('translate-y-full');
    setTimeout(() => {
      banner.style.display = 'none';
    }, 500);
  }
}

// Dismiss install banner
function dismissInstallBanner() {
  hideInstallPromotion();
  // Don't show again for 7 days
  localStorage.setItem('pwa-install-dismissed', Date.now());
}

// Check if iOS
function isIOS() {
  return /iPhone|iPad|iPod/.test(navigator.userAgent) && !window.MSStream;
}

// Show iOS install instructions
function showIOSInstallInstructions() {
  // Check if already dismissed recently
  const dismissed = localStorage.getItem('ios-install-dismissed');
  if (dismissed && Date.now() - dismissed < 7 * 24 * 60 * 60 * 1000) {
    return;
  }

  const instructions = document.createElement('div');
  instructions.id = 'ios-install-instructions';
  instructions.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4';
  instructions.innerHTML = `
    <div class="bg-white rounded-lg max-w-md w-full p-6">
      <h3 class="text-xl font-bold mb-4">Install Chris David Salon App</h3>
      <p class="mb-4">Install our app for quick booking and exclusive offers!</p>
      <ol class="list-decimal list-inside space-y-2 mb-6">
        <li>Tap the <span class="inline-block px-2 py-1 bg-gray-100 rounded">Share</span> button below</li>
        <li>Scroll down and tap <span class="inline-block px-2 py-1 bg-gray-100 rounded">Add to Home Screen</span></li>
        <li>Tap <span class="inline-block px-2 py-1 bg-gray-100 rounded">Add</span> in the top right</li>
      </ol>
      <button onclick="this.parentElement.parentElement.remove(); localStorage.setItem('ios-install-dismissed', Date.now())" 
              class="w-full bg-purple-900 text-white py-3 rounded-lg font-semibold">
        Got it!
      </button>
    </div>
  `;
  
  // Show after 10 seconds on page
  setTimeout(() => {
    if (!isPWAInstalled()) {
      document.body.appendChild(instructions);
    }
  }, 10000);
}

// Track installation for analytics
function trackInstallation() {
  // Send to analytics
  if (window.gtag) {
    gtag('event', 'pwa_install', {
      'event_category': 'engagement',
      'event_label': 'pwa'
    });
  }
  
  // Store locally
  localStorage.setItem('pwa-installed', 'true');
  localStorage.setItem('pwa-install-date', Date.now());
}

// Request notification permission
async function requestNotificationPermission() {
  if ('Notification' in window && 'serviceWorker' in navigator) {
    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      console.log('Notification permission granted');
      subscribeToNotifications();
    }
  }
}

// Subscribe to push notifications
async function subscribeToNotifications() {
  try {
    const registration = await navigator.serviceWorker.ready;
    
    // Your VAPID public key would go here (generate from server)
    const vapidPublicKey = 'YOUR_VAPID_PUBLIC_KEY';
    
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
    });
    
    // Send subscription to server
    await fetch('/api/notifications/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(subscription)
    });
    
    console.log('Push notification subscription successful');
  } catch (error) {
    console.error('Failed to subscribe to notifications:', error);
  }
}

// Helper function for VAPID key
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');
  
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Check for updates
async function checkForUpdates() {
  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
      registration.update();
    }
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPWA);
} else {
  initPWA();
}

// Export functions for use in other scripts
window.PWA = {
  install: installPWA,
  requestNotifications: requestNotificationPermission,
  checkForUpdates: checkForUpdates,
  isInstalled: isPWAInstalled
};