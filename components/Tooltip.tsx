
import React, { useState } from 'react';

interface TooltipProps {
  text: string;
  children: React.ReactElement<React.HTMLAttributes<HTMLElement>>; // Expect a single child element that accepts HTML attributes
}

export function Tooltip({ text, children }: TooltipProps): React.ReactNode {
  const [isVisible, setIsVisible] = useState(false);

  // Ensure children is a single valid React element
  const child = React.Children.only(children);

  const showTooltip = () => setIsVisible(true);
  const hideTooltip = () => setIsVisible(false);

  // Clone the child to add event handlers
  const triggerElement = React.cloneElement(child, {
    onMouseEnter: showTooltip,
    onMouseLeave: hideTooltip,
    onTouchStart: () => setIsVisible(!isVisible), // Toggle on touch
    onFocus: showTooltip,
    onBlur: hideTooltip,
    // Add accessibility attributes
    'aria-describedby': isVisible ? `tooltip-${Math.random().toString(36).substr(2, 9)}` : undefined,
  });

  return (
    <span className="relative inline-block">
      {triggerElement}
      {isVisible && (
        <div
          role="tooltip"
          id={`tooltip-${Math.random().toString(36).substr(2, 9)}`} // Should match aria-describedby if used
          className="absolute z-10 px-3 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg shadow-sm tooltip bottom-full left-1/2 transform -translate-x-1/2 mb-2 min-w-max max-w-xs"
        >
          {text}
          <div className="tooltip-arrow absolute left-1/2 transform -translate-x-1/2 bottom-[-4px] w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-gray-900"></div>
        </div>
      )}
    </span>
  );
}
