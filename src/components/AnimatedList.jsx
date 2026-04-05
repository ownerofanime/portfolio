import { useState, useEffect, useRef, useCallback } from 'react';
import './AnimatedList.css';

export default function AnimatedList({
  items = [],
  renderItem,
  onItemSelect,
  showGradients = true,
  enableArrowNavigation = true,
  displayScrollbar = false,
  maxHeight = 420,
}) {
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [showTopGradient, setShowTopGradient] = useState(false);
  const [showBottomGradient, setShowBottomGradient] = useState(true);
  const listRef = useRef(null);
  const itemRefs = useRef([]);

  const handleScroll = useCallback(() => {
    const el = listRef.current;
    if (!el) return;
    setShowTopGradient(el.scrollTop > 8);
    setShowBottomGradient(el.scrollTop + el.clientHeight < el.scrollHeight - 8);
  }, []);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    handleScroll();
    el.addEventListener('scroll', handleScroll);
    return () => el.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // Keyboard navigation
  useEffect(() => {
    if (!enableArrowNavigation) return;
    const handler = (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((i) => {
          const next = Math.min(i + 1, items.length - 1);
          itemRefs.current[next]?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
          return next;
        });
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((i) => {
          const next = Math.max(i - 1, 0);
          itemRefs.current[next]?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
          return next;
        });
      } else if (e.key === 'Enter' && selectedIndex >= 0) {
        onItemSelect?.(items[selectedIndex], selectedIndex);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [enableArrowNavigation, items, selectedIndex, onItemSelect]);

  return (
    <div className="animated-list-container">
      <div
        ref={listRef}
        className={`animated-list-scroll${displayScrollbar ? '' : ' no-scrollbar'}`}
        style={{ maxHeight }}
      >
        {items.map((item, i) => (
          <div
            key={i}
            ref={(el) => { itemRefs.current[i] = el; }}
            className={`animated-list-item${selectedIndex === i ? ' selected' : ''}`}
            style={{ animationDelay: `${i * 60}ms` }}
            onClick={() => {
              setSelectedIndex(i);
              onItemSelect?.(item, i);
            }}
            onMouseEnter={() => setSelectedIndex(i)}
            onMouseLeave={() => setSelectedIndex(-1)}
          >
            {renderItem ? renderItem(item, i, selectedIndex === i) : (
              <p className="animated-list-item-text">{String(item)}</p>
            )}
          </div>
        ))}
      </div>
      {showGradients && (
        <>
          <div className={`animated-list-gradient-top${showTopGradient ? ' visible' : ''}`} />
          <div className={`animated-list-gradient-bottom${showBottomGradient ? ' visible' : ''}`} />
        </>
      )}
    </div>
  );
}
