import { createRoot } from "react-dom/client";
import "./index.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { Provider } from "react-redux";
import { store } from "./store";

import App from "./App.tsx";
import Navbar from "./components/navbar.tsx";

createRoot(document.getElementById("root")!).render(
  <>
    <Provider store={store}>
      <ToastContainer />
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Navbar />
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/game/:roomId" element={<App />} />
        </Routes>
      </Router>
    </Provider>
  </>
);
