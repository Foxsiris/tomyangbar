import { Star } from 'lucide-react';

const Rating = ({ 
  rating, 
  maxRating = 5, 
  size = 'md',
  showNumber = false,
  interactive = false,
  onRatingChange,
  className = '' 
}) => {
  const sizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
    xl: 'w-6 h-6'
  };

  const handleClick = (value) => {
    if (interactive && onRatingChange) {
      onRatingChange(value);
    }
  };

  return (
    <div className={`flex items-center ${className}`}>
      <div className="flex items-center space-x-1">
        {[...Array(maxRating)].map((_, index) => {
          const starValue = index + 1;
          const isFilled = starValue <= rating;
          const isHalf = starValue === Math.ceil(rating) && rating % 1 !== 0;
          
          return (
            <button
              key={index}
              onClick={() => handleClick(starValue)}
              disabled={!interactive}
              className={`${
                interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'
              } transition-transform duration-200`}
            >
              <Star
                className={`${sizes[size]} ${
                  isFilled
                    ? 'text-yellow-400 fill-current'
                    : isHalf
                    ? 'text-yellow-400 fill-current opacity-50'
                    : 'text-gray-300'
                }`}
              />
            </button>
          );
        })}
      </div>
      
      {showNumber && (
        <span className="ml-2 text-sm text-gray-600">
          {rating.toFixed(1)}/{maxRating}
        </span>
      )}
    </div>
  );
};

export default Rating;
