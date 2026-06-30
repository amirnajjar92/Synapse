const fs = require('fs');
const path = require('path');

const swPath = path.join(__dirname, '..', 'public', 'sw.js');

if (!fs.existsSync(swPath)) {
  console.log('⚠️  sw.js not found — skipping push SW injection (expected in dev)');
  process.exit(0);
}

const pushHandler = `

// --- Push notification handlers (injected by Synapse) ---
self.addEventListener('push', (event) => {
  let data;
  try { data = event.data?.json(); } catch { data = {}; }
  const title = data?.title || 'Synapse';
  const options = {
    body: data?.body || '',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    tag: 'synapse-chat',
    data: data?.data || {},
    ...data?.options,
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((cls) => {
      const existing = cls.find((c) => c.url === url);
      if (existing) return existing.focus();
      return clients.openWindow(url);
    })
  );
});
`;

try {
  const content = fs.readFileSync(swPath, 'utf-8');

  if (content.includes('push notification handlers (injected')) {
    console.log('✅ Push handlers already injected in sw.js');
    process.exit(0);
  }

  fs.appendFileSync(swPath, pushHandler);
  console.log('✅ Push notification handlers injected into sw.js');
} catch (err) {
  console.error('❌ Failed to inject push handlers:', err.message);
  process.exit(1);
}
