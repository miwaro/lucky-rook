import { useEffect } from "react";
import { AppDispatch } from "./store";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setLoggedInUser } from "./features/player/playerSlice";
import NavBar from "./components/navbar/navbar";
import * as UsersApi from "./network/users_api";
import Game from "./pages/game";
import Lobby from "./pages/lobby";

const App = () => {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    async function fetchLoggedInUser() {
      try {
        const user = await UsersApi.getLoggedInUser();
        dispatch(setLoggedInUser(user));
      } catch (error) {
        console.error(error);
      }
    }
    fetchLoggedInUser();
  }, [dispatch]);

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div className="flex flex-col w-screen">
        <NavBar />
        <Routes>
          <Route path="/" element={<Lobby />} />
          <Route path="/:gameId/" element={<Game />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
