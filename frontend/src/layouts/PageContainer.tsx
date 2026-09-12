import React from 'react';

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  as?: React.ElementType;
}

const maxWidthClasses = {
  sm:   'max-w-2xl',
  md:   'max-w-4xl',
  lg:   'max-w-5xl',
  xl:   'max-w-6xl',
  '2xl':'max-w-7xl',
  full: 'max-w-full',
};

const PageContainer: React.FC<PageContainerProps> = ({
  children,
  className = '',
  maxWidth = 'xl',
  as: Tag = 'div',
}) => {
  return (
    <Tag
      className={[
        'w-full mx-auto px-4 sm:px-6 lg:px-8',
        maxWidthClasses[maxWidth],
        className,
      ].join(' ')}
    >
      {children}
    </Tag>
  );
};

export default PageContainer;
