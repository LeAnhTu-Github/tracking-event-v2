import * as React from 'react';

import {
  readSelectedAppId,
  SELECTED_APP_CHANGED_EVENT
} from '@/lib/selected-app';

/**
 * Read and subscribe to the globally selected app id (ProjectSwitcher).
 */
export const useSelectedAppId = (): number | null => {
  const [selectedAppId, setSelectedAppId] = React.useState<number | null>(null);

  React.useEffect(() => {
    const sync = (event?: Event) => {
      const custom = event as CustomEvent<number> | undefined;
      const nextId = custom?.detail ?? readSelectedAppId();
      setSelectedAppId((prev) => (prev === nextId ? prev : nextId));
    };

    sync();
    window.addEventListener(SELECTED_APP_CHANGED_EVENT, sync as EventListener);
    window.addEventListener('storage', sync);

    return () => {
      window.removeEventListener(
        SELECTED_APP_CHANGED_EVENT,
        sync as EventListener
      );
      window.removeEventListener('storage', sync);
    };
  }, []);

  return selectedAppId;
};

