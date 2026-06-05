import './Masonry.css';

const Masonry = ({
  items,
  scaleOnHover = true,
  hoverScale = 0.95,
  onItemClick = null,
  // kept for API compat, unused in CSS impl
  ease, duration, stagger, animateFrom, blurToFocus, colorShiftOnHover,
}) => {
  return (
    <div className="masonry-grid">
      {items.map(item => (
        <div
          key={item.id}
          className="masonry-item"
          style={{ '--hover-scale': hoverScale }}
          onClick={() => onItemClick ? onItemClick(item) : (item.url && window.open(item.url, '_blank', 'noopener'))}
        >
          <img src={item.img} alt="" loading="lazy" />
        </div>
      ))}
    </div>
  );
};

export default Masonry;
