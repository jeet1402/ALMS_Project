import React, { createContext, useContext, useState, useCallback } from 'react';

const DataRefreshContext = createContext({ refreshKey: 0, triggerRefresh: () => {} });

export const DataRefreshProvider = ({ children }) => {
  const [refreshKey, setRefreshKey] = useState(0);
  const triggerRefresh = useCallback(() => setRefreshKey((k) => k + 1), []);
  return (
    <DataRefreshContext.Provider value={{ refreshKey, triggerRefresh }}>
      {children}
    </DataRefreshContext.Provider>
  );
};

export const useDataRefresh = () => useContext(DataRefreshContext);
