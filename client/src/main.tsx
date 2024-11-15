import { createRoot } from "react-dom/client";
import "./styles/index.css";
import { ToastContainer } from "react-toastify";
import { Provider } from "react-redux";
import { store } from "./store";

import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <>
    <Provider store={store}>
      <ToastContainer />
      <App />
    </Provider>
  </>
);
