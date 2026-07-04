import { useCallback, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';

/**
 * Persiste um flag booleano em SecureStore.
 * Retorna [value, setTrue] — setTrue marca como true e persiste.
 * Inicia como false até o carregamento assíncrono completar.
 */
export function usePersistedFlag(key: string): [boolean, () => void] {
  const [value, setValue] = useState(false);

  useEffect(() => {
    SecureStore.getItemAsync(key).then((stored) => {
      if (stored === 'true') setValue(true);
    });
  }, [key]);

  const setTrue = useCallback(() => {
    setValue(true);
    SecureStore.setItemAsync(key, 'true');
  }, [key]);

  return [value, setTrue];
}
