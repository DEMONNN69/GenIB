/**
 * Dynamic Icon Component
 * Renders any icon from iconsax-react by name
 */

import React from 'react';
import * as IconsaxReact from 'iconsax-react';

interface DynamicIconProps {
  name: string;
  variant?: 'Bold' | 'Outline' | 'Bulk' | 'Linear' | 'Broken' | 'TwoTone';
  size?: number;
  className?: string;
  color?: string;
}

const DynamicIcon: React.FC<DynamicIconProps> = ({ 
  name, 
  variant = 'Outline', 
  size = 24,
  className = '',
  color 
}) => {
  // Get the icon component from iconsax-react
  const IconComponent = (IconsaxReact as any)[name];

  // Fallback to DocumentText if icon not found
  const FallbackIcon = IconsaxReact.DocumentText;

  if (!IconComponent) {
    console.warn(`Icon "${name}" not found in iconsax-react. Using DocumentText as fallback.`);
    return <FallbackIcon variant={variant} size={size} className={className} color={color} />;
  }

  return <IconComponent variant={variant} size={size} className={className} color={color} />;
};

export default DynamicIcon;
