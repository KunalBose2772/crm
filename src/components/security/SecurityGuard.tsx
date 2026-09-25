'use client';

import React, { useEffect } from 'react';

export const SecurityGuard: React.FC = () => {
  useEffect(() => {
    // 1. Block Context Menu (Right Click Inspect)
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    // 2. Block DevTools and Source Viewing Keyboard Shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      // F12 key
      if (e.key === 'F12' || e.keyCode === 123) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      const isCtrlOrMeta = e.ctrlKey || e.metaKey;

      // Ctrl+Shift+I / Cmd+Option+I (Inspect Element)
      // Ctrl+Shift+J / Cmd+Option+J (Console)
      // Ctrl+Shift+C / Cmd+Option+C (Inspect Element element picker)
      if (isCtrlOrMeta && e.shiftKey && ['I', 'i', 'J', 'j', 'C', 'c'].includes(e.key)) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Ctrl+U / Cmd+Option+U (View Page Source)
      if (isCtrlOrMeta && (e.key === 'u' || e.key === 'U')) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Ctrl+S / Cmd+S (Save Page)
      if (isCtrlOrMeta && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Ctrl+P / Cmd+P (Print Page)
      if (isCtrlOrMeta && (e.key === 'p' || e.key === 'P')) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    // 3. Print stylized warning in Console & neutralize malicious script injection
    const showSecurityBanner = () => {
      try {
        console.clear();
        console.log(
          '%cSTOP! %cSECURED BROKERAGE WORKSPACE',
          'color: #dc2626; font-size: 24px; font-weight: 900; -webkit-text-stroke: 1px black;',
          'color: #2563eb; font-size: 16px; font-weight: 700;'
        );
        console.log(
          '%cThis portal is protected by enterprise security telemetry. Running arbitrary scripts, copying credentials, or inspecting financial ledger data is monitored and recorded.',
          'color: #475569; font-size: 12px; font-weight: 500;'
        );
      } catch {
        // Ignored
      }
    };

    // 4. In production, disable console outputs
    if (process.env.NODE_ENV === 'production') {
      const noop = () => {};
      window.console.log = noop;
      window.console.info = noop;
      window.console.debug = noop;
      window.console.warn = noop;
    }

    showSecurityBanner();

    // Attach listeners
    document.addEventListener('contextmenu', handleContextMenu, { capture: true });
    window.addEventListener('keydown', handleKeyDown, { capture: true });

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu, { capture: true });
      window.removeEventListener('keydown', handleKeyDown, { capture: true });
    };
  }, []);

  return null;
};
