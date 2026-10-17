import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * New pages open at the top. Links with a #hash are left to the page to scroll,
 * and filter changes on the same page (query string only) keep the position.
 */
const ScrollManager = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  }, []);

  useEffect(() => {
    if (!hash) window.scrollTo(0, 0);
  }, [pathname, hash]);

  return null;
};

export default ScrollManager;
