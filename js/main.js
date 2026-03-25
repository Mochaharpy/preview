let currentFile = 'index.html';
require.config({ paths: { vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs' } });
require(['vs/editor/editor.main'], function () {
    monaco.editor.defineTheme('one-dark', {
        base: 'vs-dark', inherit: true,
        rules: [{ token: 'keyword', foreground: 'c678dd' }],
        colors: { 'editor.background': '#282c34', 'editor.lineHighlightBackground': '#2c313a' }
    });
    editor = monaco.editor.create(document.getElementById('monaco-anchor'), { theme: 'one-dark', automaticLayout: true });
    editor.onDidChangeModelContent(() => { 
      updateFile(currentFile, editor.getValue())
     });
});

function updateFile(path, content, action = 'UPDATE_FILE') {
    console.log('updating file: '+path, "with: " + content)
  navigator.serviceWorker.controller.postMessage({
    type: action,
    payload: {
      path: path,
      content: content
    }
  });
}

function reloadPreview() {
  const preview = document.getElementById("previewer");
  preview.src = preview.src
}

function previewFile(formData) {
  const data = new FormData(formData);

  const preview = document.getElementById("previewer");
  preview.src = "./preview-project/" + data.get("path")
}

if ('serviceWorker' in navigator) {
    console.log("ran")
    navigator.serviceWorker.register("../serviceworker.js", { scope: './' })
}
