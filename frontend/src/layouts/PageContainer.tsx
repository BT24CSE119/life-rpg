import React from 'react';

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full';
  as?: React.ElementType;
}

const maxWidthClasses = {
  sm:   'max-w-3xl',
  md:   'max-w-5xl',
  lg:   'max-w-6xl',
  xl:   'max-w-7xl',
  '2xl':'max-w-[1536px]',
  '3xl':'max-w-[1720px]',
  full: 'max-w-full',
};

const PageContainer: React.FC<PageContainerProps> = ({
  children,
  className = '',
  maxWidth = '2xl',
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
