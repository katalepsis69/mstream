import React from 'react';
import MovieCard from './MovieCard';

const MovieRow = ({ title, items, onItemClick }) => {
  // Limit to 24 items for 6x4 grid
  const displayItems = items.filter(item => item.poster_path).slice(0, 24);

  return (
    <div className="row">
      <div className="row-header">
        <h2>{title}</h2>
      </div>
      <div className="grid-container">
        {displayItems.map(item => (
          <MovieCard
            key={item.id}
            item={item}
            onClick={() => onItemClick(item)}
          />
        ))}
      </div>
    </div>
  );
};

export default MovieRow;
