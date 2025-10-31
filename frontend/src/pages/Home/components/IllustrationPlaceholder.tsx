import React from 'react';

interface IllustrationPlaceholderProps {
  title: string;
  description: string;
  imagePath?: string;
  alt: string;
  className?: string;
}

const IllustrationPlaceholder: React.FC<IllustrationPlaceholderProps> = ({
  title,
  description,
  imagePath,
  alt,
  className = "w-full h-64 lg:h-80"
}) => {
  return (
    <div className={`relative ${className}`}>
      {imagePath ? (
        <img 
          src={imagePath} 
          alt={alt}
          className="w-full h-full object-contain"
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl flex flex-col items-center justify-center p-6 border-2 border-dashed border-blue-200">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 bg-blue-200 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-sm lg:text-base">{title}</h3>
              <p className="text-xs lg:text-sm text-gray-600 mt-1">{description}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IllustrationPlaceholder;