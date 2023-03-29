/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from 'react';

function useConsoleLog(key: string, value: any) {
  useEffect(() => console.log(key, value), [value]);
}

export default useConsoleLog;
