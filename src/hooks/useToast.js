import { useCallback, useState } from 'react';
import { uid } from '../core/layouts.js';

export const TOAST_MS = 5000;

export function useToast() {
  const [toast, setToast] = useState(null);
  const say = useCallback((msg, tone) => setToast({ msg, tone, id: uid() }), []);
  const clear = useCallback(() => setToast(null), []);
  return { toast, say, clear };
}
