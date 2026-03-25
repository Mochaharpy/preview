/// <reference lib="WebWorker" />

let userProjectFiles = {}

/**@type {ServiceWorkerGlobalScope} */
self.addEventListener("install", event => {
  self.skipWaiting();
})

self.addEventListener("activate", event => {
  self.clients.claim();
})

self.addEventListener('message', (event) => {
    if (event.data.type === 'UPDATE_FILE') {
        const { path, content } = event.data.payload;
        userProjectFiles[path] = content;
        
        event.ports?.[0]?.postMessage('ACK');
    }
    
    if (event.data.type === 'DELETE_FILE') {
        delete userProjectFiles[event.data.path];
    }
});

self.addEventListener("fetch", event => {
  const url = new URL(event.request.url);
  const marker = '/preview-project/'
  if (url.pathname.includes(marker)) {
    const path = url.pathname.split(marker)[1];
    const content = userProjectFiles[path]

    if (content) {
      const ext = path.split('.').pop().toLowerCase();

      const mimeMap = {
        'html': 'text/html',
        'css': 'text/css',
        'js': 'text/javascript',
        'json': 'application/json',
        'png': 'image/png',
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'gif': 'image/gif',
        'svg': 'image/svg+xml',
        'ico': 'image/x-icon',
        'webp': 'image/webp',
        'mp3': 'audio/mpeg',
        'mp4': 'video/mp4',
        'woff': 'font/woff',
        'woff2': 'font/woff2',
        'pdf': 'application/pdf',
        'xml': 'application/xml',
        'txt': 'text/plaintext'
      };

      const contentType = mimeMap[ext] || 'application/octet-stream';
      console.log(contentType, content)
     return event.respondWith(new Response(content, { headers: { 'Content-Type': contentType } }));
    } else {
      console.log("no file at: ", path)
    }
  }
  event.respondWith(
    fetch(event.request)
      .then(async (response) => {
        if (response.status === 404) {
          const html = 'why no file?'
          return new Response(html, {
            headers: { 'Content-Type': 'text/html' },
            status: 404
          });
        }
        return response;
      })
  )
})
