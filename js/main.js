function updateFile(path, content, action = 'UPDATE_FILE') {
  navigator.serviceWorker.controller.postMessage({
    type: action,
    payload: {
      path: path,
      content: content
    }
  });
}

/**
 * A General Grid Resizer
 * @param {string} splitterId - The ID of the bar being dragged
 * @param {object} options - Configuration for this specific split
 */
function createGridResizer(splitterId, {
    direction = 'vertical', // 'vertical' (cols) or 'horizontal' (rows)
    trackIndex = 0,         // The index of the track to resize (0-based)
    minSize = 50,
    maxSize = Infinity
}) {
    const splitter = document.getElementById(splitterId);
    if (!splitter) return;

    const container = document.body; // Usually the grid container

    splitter.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        splitter.setPointerCapture(e.pointerId);
        container.classList.add('is-resizing');

        const onMove = (moveEvent) => {
            // 1. Get current track definitions from computed styles
            const style = window.getComputedStyle(container);
            const gridTemplate = direction === 'vertical' ? 
                style.gridTemplateColumns : style.gridTemplateRows;
            
            // 2. Convert the string "250px 4px 843px..." into an array of pixels
            const tracks = gridTemplate.split(' ');
            
            // 3. Calculate new size based on pointer position relative to container
            const rect = container.getBoundingClientRect();
            let newSize;

            if (direction === 'vertical') {
                newSize = moveEvent.clientX - rect.left;
                // If the splitter is for the right-side panel, we calculate from the right
                if (trackIndex > 2) newSize = rect.width - (moveEvent.clientX - rect.left);
            } else {
                newSize = rect.height - (moveEvent.clientY - rect.top);
            }

            // 4. Apply Constraints
            newSize = Math.max(minSize, Math.min(newSize, maxSize));

            // 5. Rebuild the grid template string
            // We keep the middle track as '1fr' to prevent "pushing"
            tracks[trackIndex] = `${newSize}px`;
            
            const newTemplate = tracks.join(' ');
            if (direction === 'vertical') {
                container.style.gridTemplateColumns = newTemplate;
            } else {
                container.style.gridTemplateRows = newTemplate;
            }

            if (window.editor?.layout) window.editor.layout();
        };

        const onUp = () => {
            container.classList.remove('is-resizing');
            document.removeEventListener('pointermove', onMove);
            document.removeEventListener('pointerup', onUp);
        };

        document.addEventListener('pointermove', onMove);
        document.addEventListener('pointerup', onUp);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    
    createGridResizer('v-splitter-1', {
        direction: 'vertical',
        trackIndex: 0,
        minSize: 150
    });

    createGridResizer('v-splitter-2', {
        direction: 'vertical',
        trackIndex: 4,
        minSize: 200
    });

    createGridResizer('h-splitter', {
        direction: 'horizontal',
        trackIndex: 3, // In rows: Header(0), Editor(1), Split(2), Console(3)
        minSize: 35
    });
});

if ('serviceWorker' in navigator) navigator.serviceWorker.register("../serviceworker.js", { scope: '/' })