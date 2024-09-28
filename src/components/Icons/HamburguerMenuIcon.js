import React from 'react';

export const HamburguerMenuIcon = ({
  fill = 'black',
  filled,
  size,
  height,
  width,
  label,
  ...props
}) => {
  return (
    <svg
      width={size || width || 24}
      height={size || height || 24}
      viewBox="0 0 24 24"
      fill={filled ? fill : 'none'}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M4.5 12H19.5M4.5 17.77H19.5M4.5 6.23H19.5"
        stroke={fill}
        strokeWidth="1.5"
        strokeMiterlimit="10"
        strokeLinecap="round"
      />
    </svg>
  );
};
