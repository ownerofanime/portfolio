// Router-free navigation bridge.
//
// The Game Boy terminal renders inside the React Three Fiber canvas, which is a
// separate reconciler root — React Router's context does not cross that
// boundary, so useNavigate() is unavailable in there. App registers the real
// navigate() here once, and anything outside the router tree calls goTo().

let navigator = null;

export function setNavigator(fn) {
  navigator = fn;
}

export function goTo(path) {
  if (navigator) navigator(path);
  else if (typeof window !== 'undefined') window.location.assign(path);
}
