import React from 'react';
import { Toaster } from 'sonner';

/**
 * ToasterProvider Component
 * Provides sonner toast notifications globally to the application
 * Should be wrapped around the root of the app
 */
export default function ToasterProvider() {
  return (
    <Toaster
      position="top-right"
      richColors
      theme="light"
      closeButton
      expand
      visibleToasts={3}
    />
  );
}
