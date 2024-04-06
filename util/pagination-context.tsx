import { createContext, useReducer, useContext } from "react";
export const PaginationContext = createContext<any>(null);
export const PaginationDispatchContext = createContext<any>(null);

export function PaginationProvider({ children }: any) {
  const [paginationData, dispatchPagination] = useReducer(paginationReducer, initialPagination);
  return (
    <PaginationContext.Provider value={paginationData}>
      <PaginationDispatchContext.Provider value={dispatchPagination}>{children}</PaginationDispatchContext.Provider>
    </PaginationContext.Provider>
  );
}

function paginationReducer(paginationData: any, action: any) {
  switch (action.type) {
    case "changePage": {
      return {
        ...paginationData,
        current: action.page,
        pageSize: action.pageSize || paginationData?.pageSize,
      };
      break;
    }
    case "changeRowsPerPage": {
      return {
        ...paginationData,
        current: 1,
        pageSize: action.size,
        total: action.total,
      };
      break;
    }
    default: {
      throw Error("Unknown action: " + action.type);
    }
  }
}
export function usePaginationData() {
  return useContext(PaginationContext);
}
export function usePaginationDispatch() {
  return useContext(PaginationDispatchContext);
}

let initialPagination = {
  current: 1,
  pageSize: 15,
  total: 0,
  pageSizeOptions: [5, 10, 20, 50, 100],
};
