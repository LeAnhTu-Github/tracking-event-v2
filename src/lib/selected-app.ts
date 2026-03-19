export const SELECTED_APP_ID_KEY = 'selected_app_id';
export const SELECTED_APP_CHANGED_EVENT = 'selected-app-id-change';

type AppLike = {
  id: number;
};

export const readSelectedAppId = () => {
  if (typeof window === 'undefined') return null;
  const stored = window.localStorage.getItem(SELECTED_APP_ID_KEY);
  const parsed = stored ? Number(stored) : null;
  return Number.isFinite(parsed) ? parsed : null;
};

export const writeSelectedAppId = (appId: number) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(SELECTED_APP_ID_KEY, String(appId));
  window.dispatchEvent(
    new CustomEvent(SELECTED_APP_CHANGED_EVENT, {
      detail: appId
    })
  );
};

export const clearSelectedAppId = () => {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(SELECTED_APP_ID_KEY);
  window.dispatchEvent(new CustomEvent(SELECTED_APP_CHANGED_EVENT));
};

export const resolveSelectedAppId = <T extends AppLike>(
  apps: T[],
  fallbackIndex = 1
) => {
  if (apps.length === 0) return null;
  const stored = readSelectedAppId();
  const matched = apps.find((item) => item.id === stored);
  if (matched) return matched.id;
  return apps[fallbackIndex]?.id ?? apps[0].id;
};
