import { useState, useEffect, useRef } from 'react';

export default function TextType({
  texts = [],
  typingSpeed = 75,
  deletingSpeed = 50,
  pauseDuration = 1500,
  showCursor = true,
  cursorCharacter = '_',
  cursorBlinkDuration = 0.5,
  variableSpeedEnabled = false,
  variableSpeedMin = 60,
  variableSpeedMax = 120,
  loop = true,
  delay = 0,           // ms after `start` becomes true before typing begins
  start = true,        // set false to hold, flip to true to begin
  hideCursorOnDone = false,
  className = '',
}) {
  const [ts, setTs] = useState({
    displayed: '',
    textIdx: 0,
    charIdx: 0,
    phase: 'waiting',  // always start waiting; kick off when `start` flips true
  });
  const [cursorVisible, setCursorVisible] = useState(true);
  const timerRef = useRef(null);

  const getSpeed = (base) =>
    variableSpeedEnabled
      ? variableSpeedMin + Math.random() * (variableSpeedMax - variableSpeedMin)
      : base;

  // Begin typing when `start` becomes true (after optional delay)
  useEffect(() => {
    if (!start) return;
    const t = setTimeout(() => setTs(s => ({ ...s, phase: 'typing' })), delay);
    return () => clearTimeout(t);
  }, [start]); // eslint-disable-line

  // Main typing machine — re-runs whenever phase/charIdx/textIdx change
  useEffect(() => {
    const { phase, textIdx, charIdx } = ts;
    if (phase === 'waiting' || phase === 'done' || !texts.length) return;

    const current = texts[textIdx] || '';
    clearTimeout(timerRef.current);

    if (phase === 'typing') {
      timerRef.current = setTimeout(() => {
        const next = charIdx + 1;
        const newDisplayed = current.slice(0, next);
        if (next >= current.length) {
          // Finished typing this text
          setTs(s => ({
            ...s,
            displayed: newDisplayed,
            charIdx: next,
            phase: loop ? 'pausing' : 'done',
          }));
        } else {
          setTs(s => ({ ...s, displayed: newDisplayed, charIdx: next }));
        }
      }, getSpeed(typingSpeed));

    } else if (phase === 'pausing') {
      timerRef.current = setTimeout(() => {
        setTs(s => ({ ...s, phase: 'deleting' }));
      }, pauseDuration);

    } else if (phase === 'deleting') {
      timerRef.current = setTimeout(() => {
        const next = charIdx - 1;
        if (next <= 0) {
          const nextTextIdx = (textIdx + 1) % texts.length;
          setTs(s => ({ ...s, displayed: '', charIdx: 0, textIdx: nextTextIdx, phase: 'typing' }));
        } else {
          setTs(s => ({ ...s, displayed: current.slice(0, next), charIdx: next }));
        }
      }, getSpeed(deletingSpeed));
    }

    return () => clearTimeout(timerRef.current);
  }, [ts.phase, ts.charIdx, ts.textIdx]); // eslint-disable-line

  // Cursor blink
  useEffect(() => {
    if (!showCursor) return;
    const id = setInterval(() => setCursorVisible(v => !v), cursorBlinkDuration * 1000);
    return () => clearInterval(id);
  }, [showCursor, cursorBlinkDuration]);

  const showingCursor = showCursor && !(ts.phase === 'done' && hideCursorOnDone);

  return (
    <span className={`text-type ${className}`}>
      {ts.displayed}
      {showingCursor && (
        <span className={`text-type__cursor${cursorVisible ? '' : ' text-type__cursor--hidden'}`}>
          {cursorCharacter}
        </span>
      )}
    </span>
  );
}
