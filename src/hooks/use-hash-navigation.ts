import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export function useHashNavigation() {
  const location = useLocation();

  useEffect(() => {
    const hash = location.hash.slice(1);
    
    if (hash) {
      const element = document.getElementById(hash);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 0);
      }
    }
  }, [location.hash]);
}
