function updateFile(path, content, action = 'UPDATE_FILE') {
  navigator.serviceWorker.controller.postMessage({
    type: action,
    payload: {
      path: path,
      content: content
    }
  });
}

if ('serviceWorker' in navigator) navigator.serviceWorker.register("../serviceworker.js", { scope: '/' })