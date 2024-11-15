import { useState, useEffect, useRef } from "react";
import { RootState, AppDispatch } from "./store";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { setReceivedPlayerOneName, setReceivedPlayerTwoName, setLoggedInUser } from "./features/player/playerSlice";
import { setBoardOrientation } from "./features/game/gameSlice";
import getSocketInstance from "./socket";
import NavBar from "./components/navbar/navbar";
import SignUpModal from "./components/modals/signUpModal";
import LoginModal from "./components/modals/loginModal";
import * as UsersApi from "./network/users_api";
import Game from "./pages/game";
import PlayerOneCreateAndJoin from "./pages/PlayerOneCreateAndJoin";

const App = () => {
  const socketRef = useRef(getSocketInstance());
  const socket = socketRef.current;

  const { loggedInUser } = useSelector((state: RootState) => state.player);
  const dispatch = useDispatch<AppDispatch>();

  const [showSignUpModal, setShowSignUpModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

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

  useEffect(() => {
    socket.on("receivePlayerOneName", (name: string) => {
      dispatch(setReceivedPlayerOneName(name));
    });
    socket.on("playerTwoJoined", (name: string) => {
      dispatch(setReceivedPlayerTwoName(name));
    });
    socket.on("playerColor", (color: "white" | "black") => {
      dispatch(setBoardOrientation(color));
    });
    return () => {
      socket.off("receivePlayerOneName");
      socket.off("playerTwoJoined");
      socket.off("playerColor");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket]);

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div className="flex flex-col w-screen">
        <NavBar
          loggedInUser={loggedInUser}
          onLoginClicked={() => setShowLoginModal(true)}
          onSignUpClicked={() => setShowSignUpModal(true)}
        />
        <Routes>
          <Route path="/" element={<PlayerOneCreateAndJoin />} />
          <Route path="/game/:roomId" element={<Game />} />
        </Routes>
        {showSignUpModal && (
          <SignUpModal
            onDismiss={() => setShowSignUpModal(false)}
            onSignUpSuccessful={(user) => {
              dispatch(setLoggedInUser(user));
              setShowSignUpModal(false);
            }}
          />
        )}
        {showLoginModal && (
          <LoginModal
            onDismiss={() => setShowLoginModal(false)}
            onLoginSuccessful={(user) => {
              dispatch(setLoggedInUser(user));
              setShowLoginModal(false);
            }}
          />
        )}
      </div>
    </Router>
  );
};

export default App;
