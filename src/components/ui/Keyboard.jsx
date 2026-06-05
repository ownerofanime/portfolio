// UI — Keyboard: visual QWERTY keyboard that highlights keys in real time.
// Keys light up when the user types physically (via activeKeys prop)
// and are fully clickable to type into the terminal.
// onMouseDown uses e.preventDefault() to avoid stealing focus from the terminal input.

// ── Layout ────────────────────────────────────────────────────────
// Each key: { label, code (KeyboardEvent.code), cls (optional width class) }
const ROWS = [
  [
    { label: 'esc', code: 'Escape',       cls: 'w-esc' },
    { label: '`',   code: 'Backquote' },
    { label: '1',   code: 'Digit1' },
    { label: '2',   code: 'Digit2' },
    { label: '3',   code: 'Digit3' },
    { label: '4',   code: 'Digit4' },
    { label: '5',   code: 'Digit5' },
    { label: '6',   code: 'Digit6' },
    { label: '7',   code: 'Digit7' },
    { label: '8',   code: 'Digit8' },
    { label: '9',   code: 'Digit9' },
    { label: '0',   code: 'Digit0' },
    { label: '-',   code: 'Minus' },
    { label: '=',   code: 'Equal' },
    { label: '⌫',   code: 'Backspace',    cls: 'w-backspace' },
  ],
  [
    { label: '⇥',   code: 'Tab',          cls: 'w-tab' },
    { label: 'q',   code: 'KeyQ' },
    { label: 'w',   code: 'KeyW' },
    { label: 'e',   code: 'KeyE' },
    { label: 'r',   code: 'KeyR' },
    { label: 't',   code: 'KeyT' },
    { label: 'y',   code: 'KeyY' },
    { label: 'u',   code: 'KeyU' },
    { label: 'i',   code: 'KeyI' },
    { label: 'o',   code: 'KeyO' },
    { label: 'p',   code: 'KeyP' },
    { label: '[',   code: 'BracketLeft' },
    { label: ']',   code: 'BracketRight' },
    { label: '\\',  code: 'Backslash',    cls: 'w-backslash' },
  ],
  [
    { label: '⇪',   code: 'CapsLock',     cls: 'w-caps' },
    { label: 'a',   code: 'KeyA' },
    { label: 's',   code: 'KeyS' },
    { label: 'd',   code: 'KeyD' },
    { label: 'f',   code: 'KeyF' },
    { label: 'g',   code: 'KeyG' },
    { label: 'h',   code: 'KeyH' },
    { label: 'j',   code: 'KeyJ' },
    { label: 'k',   code: 'KeyK' },
    { label: 'l',   code: 'KeyL' },
    { label: ';',   code: 'Semicolon' },
    { label: "'",   code: 'Quote' },
    { label: '↵',   code: 'Enter',        cls: 'w-enter' },
  ],
  [
    { label: '⇧',   code: 'ShiftLeft',    cls: 'w-shiftl' },
    { label: 'z',   code: 'KeyZ' },
    { label: 'x',   code: 'KeyX' },
    { label: 'c',   code: 'KeyC' },
    { label: 'v',   code: 'KeyV' },
    { label: 'b',   code: 'KeyB' },
    { label: 'n',   code: 'KeyN' },
    { label: 'm',   code: 'KeyM' },
    { label: ',',   code: 'Comma' },
    { label: '.',   code: 'Period' },
    { label: '/',   code: 'Slash' },
    { label: '⇧',   code: 'ShiftRight',   cls: 'w-shiftr' },
  ],
  [
    { label: 'fn',  code: 'Fn',           cls: 'w-fn' },
    { label: '⌃',   code: 'ControlLeft',  cls: 'w-ctrl' },
    { label: '⌥',   code: 'AltLeft',      cls: 'w-alt' },
    { label: '⌘',   code: 'MetaLeft',     cls: 'w-cmd' },
    { label: '',    code: 'Space',         cls: 'w-space' },
    { label: '⌘',   code: 'MetaRight',    cls: 'w-cmd' },
    { label: '⌥',   code: 'AltRight',     cls: 'w-alt' },
    { label: '←',   code: 'ArrowLeft',    cls: 'w-arrow' },
    { label: '↑',   code: 'ArrowUp',      cls: 'w-arrow' },
    { label: '↓',   code: 'ArrowDown',    cls: 'w-arrow' },
    { label: '→',   code: 'ArrowRight',   cls: 'w-arrow' },
  ],
];

// Maps key code → typeable character (used when clicking keys on-screen)
const KEY_CHAR = {
  Backquote: '`',   Digit1: '1', Digit2: '2', Digit3: '3', Digit4: '4',
  Digit5: '5',      Digit6: '6', Digit7: '7', Digit8: '8', Digit9: '9',
  Digit0: '0',      Minus: '-',  Equal: '=',
  KeyQ: 'q',        KeyW: 'w',   KeyE: 'e',   KeyR: 'r',   KeyT: 't',
  KeyY: 'y',        KeyU: 'u',   KeyI: 'i',   KeyO: 'o',   KeyP: 'p',
  BracketLeft: '[', BracketRight: ']',         Backslash: '\\',
  KeyA: 'a',        KeyS: 's',   KeyD: 'd',   KeyF: 'f',   KeyG: 'g',
  KeyH: 'h',        KeyJ: 'j',   KeyK: 'k',   KeyL: 'l',
  Semicolon: ';',   Quote: "'",
  KeyZ: 'z',        KeyX: 'x',   KeyC: 'c',   KeyV: 'v',   KeyB: 'b',
  KeyN: 'n',        KeyM: 'm',   Comma: ',',  Period: '.', Slash: '/',
  Space: ' ',
};

export default function Keyboard({ activeKeys = new Set(), onKeyClick }) {
  return (
    <div className="kb-wrap" aria-label="Interactive keyboard">
      {ROWS.map((row, rowIdx) => (
        <div key={rowIdx} className="kb-row">
          {row.map((key) => {
            const isActive = activeKeys.has(key.code);
            return (
              <button
                key={`${key.code}-${rowIdx}`}
                className={`kb-key ${key.cls || ''} ${isActive ? 'kb-key-active' : ''}`}
                onMouseDown={(e) => {
                  // Prevent stealing focus from terminal input
                  e.preventDefault();
                  onKeyClick?.(key.code, KEY_CHAR[key.code] ?? '');
                }}
                tabIndex={-1}
                aria-label={key.label || key.code}
              >
                {key.label}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
