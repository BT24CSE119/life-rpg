import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop automatically resets window scroll position to (0, 0)
 * whenever the route pathname or search parameters change.
 */
const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant' as ScrollBehavior,
    });
  }, [pathname]);

  return null;
};

export default ScrollToTop;
