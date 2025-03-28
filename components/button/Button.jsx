import React from "react";
import "./button-animations.css";

/**
 * @typedef {Object} ButtonProps
 * @property {"button" | "submit" | "reset"} [type] - The button type
 * @property {React.ReactNode} children - The button content
 * @property {function} [onClick] - Click handler
 * @property {boolean} [isScaled] - Whether to apply scale effect on hover
 * @property {"xs" | "sm" | "md" | "lg" | "xl"} [size] - Button size
 * @property {"primary" | "secondary" | "outline" | "ghost" | "custom"} [variant] - Button style variant
 * @property {boolean} [fullWidth] - Whether the button should take full width
 * @property {boolean} [disabled] - Whether the button is disabled
 * @property {string} [className] - Additional CSS classes
 * @property {string} [ariaLabel] - Accessibility label
 * @property {string} [bgColor] - Custom background color
 * @property {string} [textColor] - Custom text color
 * @property {string} [hoverBgColor] - Custom hover background color
 * @property {string} [borderColor] - Custom border color
 * @property {"fadeIn" | "pulse" | "bounce" | "slide" | "shake" | "glowPulse" | "none"} [animation] - Animation type
 * @property {"fast" | "normal" | "slow"} [animationDuration] - Animation duration
 * @property {"none" | "short" | "medium" | "long"} [animationDelay] - Animation delay
 * @property {"load" | "hover" | "click"} [animateTrigger] - Animation trigger
 */

const sizeClasses = {
  xs: "text-xs py-1 px-2",
  sm: "text-sm py-1 px-3",
  md: "text-base py-2 px-4",
  lg: "text-lg py-2.5 px-5",
  xl: "text-xl py-3 px-6"
};

const variantClasses = {
  primary: "bg-blue-500 hover:bg-blue-700 text-white",
  secondary: "bg-gray-500 hover:bg-gray-700 text-white",
  outline: "bg-transparent hover:bg-blue-100 text-blue-500 border border-blue-500",
  ghost: "bg-transparent hover:bg-gray-100 text-gray-700",
  custom: "" // Empty to be filled with custom colors
};

// Basic transitions
const animations = {
  hover: "transition-colors duration-300",
  focus: "focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-opacity-50",
  scale: "transition-transform hover:scale-105 duration-300",
  disabled: "opacity-50 cursor-not-allowed"
};

// Custom animation classes with duration variants
const customAnimations = {
  fadeIn: {
    base: "bx-anim-fadeIn opacity-0",
    fast: "bx-duration-300",
    normal: "bx-duration-500",
    slow: "bx-duration-1000"
  },
  pulse: {
    base: "bx-anim-pulse",
    fast: "bx-duration-750",
    normal: "bx-duration-1500",
    slow: "bx-duration-2250"
  },
  bounce: {
    base: "bx-anim-bounce",
    fast: "bx-duration-300",
    normal: "bx-duration-500",
    slow: "bx-duration-700"
  },
  slide: {
    base: "bx-anim-slide",
    fast: "bx-duration-300",
    normal: "bx-duration-500",
    slow: "bx-duration-700"
  },
  shake: {
    base: "bx-anim-shake",
    fast: "bx-duration-300",
    normal: "bx-duration-500",
    slow: "bx-duration-700"
  },
  glowPulse: {
    base: "bx-anim-glow-pulse",
    fast: "bx-duration-1000",
    normal: "bx-duration-2000",
    slow: "bx-duration-3000"
  }
};

// Animation delay classes
const animationDelays = {
  none: "",
  short: "bx-delay-300",
  medium: "bx-delay-600",
  long: "bx-delay-1000"
};

// Animation trigger classes
const animationTriggers = {
  load: "",
  hover: "bx-trigger-hover",
  click: "bx-trigger-click"
};

// Helper to check if it's a hex/rgb color or a Tailwind utility
const isColorValue = (color) => {
  return color?.startsWith('#') || color?.startsWith('rgb') || color?.startsWith('hsl');
};

/**
 * Button component with various style and animation options
 * @param {ButtonProps} props - Button properties
 * @returns {JSX.Element} - Button component
 */
const Button = ({
  type = "button",
  children,
  onClick,
  isScaled = false,
  size = "md",
  variant = "primary",
  fullWidth = false,
  disabled = false,
  className = "",
  ariaLabel,
  bgColor = "",
  textColor = "",
  hoverBgColor = "",
  borderColor = "",
  animation = "none",
  animationDuration = "normal",
  animationDelay = "none",
  animateTrigger = "load"
}) => {
  
  // Handle inline styles for hex/rgb values
  const inlineStyles = {};
  
  // Process custom colors - use a cleaner approach for building Tailwind classes
  let customColors = [];
  
  if (variant === "custom") {
    // Background color
    if (bgColor) {
      if (isColorValue(bgColor)) {
        inlineStyles.backgroundColor = bgColor;
      } else {
        customColors.push(`bg-${bgColor}`);
      }
    }
    
    // Text color
    if (textColor) {
      if (isColorValue(textColor)) {
        inlineStyles.color = textColor;
      } else {
        customColors.push(`text-${textColor}`);
      }
    }
    
    // Border color
    if (borderColor) {
      if (isColorValue(borderColor)) {
        inlineStyles.borderColor = borderColor;
        inlineStyles.borderWidth = '1px';
        inlineStyles.borderStyle = 'solid';
      } else {
        customColors.push(`border border-${borderColor}`);
      }
    }
    
    // Hover background (only for Tailwind classes)
    if (hoverBgColor && !isColorValue(hoverBgColor)) {
      customColors.push(`hover:bg-${hoverBgColor}`);
    }
  }
  
  // Flag for JS hover handlers (only needed for hex/RGB colors)
  const needsHoverHandlers = 
    variant === "custom" && 
    bgColor && isColorValue(bgColor) && 
    hoverBgColor && isColorValue(hoverBgColor);
  
  // Animation classes
  const animationClass = animation !== "none" ? 
    [
      customAnimations[animation].base,
      customAnimations[animation][animationDuration],
      animationDelays[animationDelay],
      animationTriggers[animateTrigger]
    ].filter(Boolean).join(' ') : '';
  
  // Build the final class string using an array for cleaner concatenation
  const buttonClasses = [
    'rounded',
    'font-medium',
    sizeClasses[size],
    variant !== "custom" ? variantClasses[variant] : customColors.join(' '),
    animations.hover,
    animations.focus,
    isScaled ? animations.scale : '',
    fullWidth ? 'w-full' : '',
    disabled ? animations.disabled : '',
    animationClass,
    className // User can override with their own classes
  ].filter(Boolean).join(' ');
  
  return (
    <button
      type={type}
      disabled={disabled}
      aria-label={ariaLabel}
      onClick={onClick}
      className={buttonClasses}
      style={Object.keys(inlineStyles).length > 0 ? inlineStyles : undefined}
      onMouseOver={needsHoverHandlers ? 
        (e) => { e.currentTarget.style.backgroundColor = hoverBgColor; } : undefined
      }
      onMouseOut={needsHoverHandlers ? 
        (e) => { e.currentTarget.style.backgroundColor = bgColor; } : undefined
      }
    >
      {children}
    </button>
  );
};

export default Button;