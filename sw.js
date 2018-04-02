importScripts('https://storage.googleapis.com/workbox-cdn/releases/3.0.0/workbox-sw.js');

workbox.precaching.precacheAndRoute([
    'jquery-3.3.1.min.js',
    'jquery-ui.min.js',
    { url: '/index.html', revision: '1' },
]);

workbox.routing.registerRoute(
  // Cache CSS files
  /.*\.css/,
  // Use cache but update in the background ASAP
  workbox.strategies.staleWhileRevalidate({
    // Use a custom cache name
    cacheName: 'css-cache',
  })
);