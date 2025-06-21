// src/Component/TawkChat.jsx
import { useEffect } from 'react';

const TawkChat = () => {
  useEffect(() => {
    // Initialize Tawk.to script
    const s1 = document.createElement("script");
    const s0 = document.getElementsByTagName("script")[0];
    s1.async = true;
    s1.src = 'https://embed.tawk.to/67eb7b275b2a6f190f21862c/1innti5f2';
    s1.charset = 'UTF-8';
    s1.setAttribute('crossorigin', '*');
    s0.parentNode.insertBefore(s1, s0);

    // Cleanup function to remove widget when component unmounts
    return () => {
      // Remove the Tawk widget when component unmounts
      if (window.Tawk_API) {
        window.Tawk_API.hideWidget();
      }
      // Try to remove the script
      const tawkScript = document.querySelector('script[src*="tawk.to"]');
      if (tawkScript && tawkScript.parentNode) {
        tawkScript.parentNode.removeChild(tawkScript);
      }
    };
  }, []);

  return null; // This component doesn't render anything visible
};

export default TawkChat;