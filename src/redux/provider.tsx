import { Provider } from "react-redux";
import { store, persistor } from "./store";
import { PersistGate } from "redux-persist/integration/react";
import { ReactNode } from "react";
import { Loader2 } from "lucide-react";

interface ReduxProviderProps {
  children: ReactNode;
}

const LoadingComponent = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="flex items-center gap-2">
      <Loader2 className="h-6 w-6 animate-spin" />
      <span>Loading application...</span>
    </div>
  </div>
);

export function ReduxProvider({ children }: ReduxProviderProps) {
  return (
    <Provider store={store}>
      <PersistGate loading={<LoadingComponent />} persistor={persistor}>
        {children}
      </PersistGate>
    </Provider>
  );
}
