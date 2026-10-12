import { useEffect, useState } from 'react';

const SCRIPT_SRC = 'https://static.elfsight.com/platform/platform.js';

const GoogleReviews = () => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Avoid injecting the widget script more than once
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT_SRC}"]`);
    if (existing) {
      setLoaded(true);
      return;
    }
    const script = document.createElement('script');
    script.src = SCRIPT_SRC;
    script.async = true;
    script.onload = () => setLoaded(true);
    document.body.appendChild(script);
  }, []);

  return (
    <div className="w-full overflow-hidden">
      {!loaded && <p className="py-10 text-center text-sm text-slate-500">Loading Google reviews…</p>}
      <div className="elfsight-app-dd5e296b-6822-4644-b53a-c49a1975bab7" data-elfsight-app-lazy></div>
    </div>
  );
};

export default GoogleReviews;
