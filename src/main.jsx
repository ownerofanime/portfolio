import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';

// Guard against double-removal races between React's deletion phase and
// libraries that move DOM out from under it (drei's <Html> portals re-parent
// their nodes next to the WebGL canvas). Without this, unmounting the 3-D
// Game Boy (StrictMode double-mount in dev, HMR, Photography-mode toggle)
// can throw "removeChild ... not a child of this node", which escalates and
// unmounts the entire app. Making the ops idempotent keeps React happy.
const origRemoveChild = Node.prototype.removeChild;
Node.prototype.removeChild = function (child) {
  if (child.parentNode !== this) return child;
  return origRemoveChild.call(this, child);
};
const origInsertBefore = Node.prototype.insertBefore;
Node.prototype.insertBefore = function (node, ref) {
  if (ref && ref.parentNode !== this) return origInsertBefore.call(this, node, null);
  return origInsertBefore.call(this, node, ref);
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
