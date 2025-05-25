import { useState } from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  Drawer,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import Header from "./header";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { AppDispatch } from "../../store";
import * as UsersApi from "../../network/users_api";
import { resetPlayerState, setLoggedInUser } from "../../features/player/playerSlice";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import LoginModal from "./loginModal";
import SignUpModal from "./signUpModal";

interface MenuItem {
  text: string;
  link: string;
}

const NavBar = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { loggedInUser } = useSelector((state: RootState) => state.player);
  const navigate = useNavigate();

  async function handleMenuSelect(e: { preventDefault: () => void }, option: MenuItem) {
    e.preventDefault();
    if (option.text === "Logout") {
      try {
        await UsersApi.logout();
        dispatch(setLoggedInUser(null));
        dispatch(resetPlayerState());
        navigate("/");
      } catch (error) {
        console.error(error);
        alert(error);
      }
    }
  }

  const toggleDrawer = (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
    if (
      event.type === "keydown" &&
      ((event as React.KeyboardEvent).key === "Tab" || (event as React.KeyboardEvent).key === "Shift")
    ) {
      return;
    }
    setDrawerOpen(open);
  };

  const menuItems = [{ text: "Logout", link: "/" }];
  return (
    <div>
      <AppBar
        position="sticky"
        sx={{
          background: "linear-gradient(to left, #041b01, #03350e)",
        }}
      >
        <Toolbar>
          <Typography variant="h6" component={Link} to="/" color="inherit" sx={{ textDecoration: "none", flexGrow: 1 }}>
            <Box className="flex items-center">
              <Header />
            </Box>
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            {loggedInUser ? (
              <Typography variant="body1">{loggedInUser?.username}</Typography>
            ) : (
              <Box className="flex items-center gap-4">
                <SignUpModal />
                <LoginModal />
              </Box>
            )}
          </Box>
          <IconButton onClick={toggleDrawer(true)} edge="start" color="inherit" aria-label="menu" sx={{ ml: 2 }}>
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Drawer anchor="right" open={drawerOpen} onClose={toggleDrawer(false)}>
        <Box
          sx={{ width: 250, backgroundColor: "#d5e0d1" }}
          role="presentation"
          onClick={toggleDrawer(false)}
          onKeyDown={toggleDrawer(false)}
        >
          <List>
            {menuItems.map((item, index) => (
              <ListItem key={index}>
                <ListItemButton component={Link} to={item.link} onClick={(e) => handleMenuSelect(e, item)}>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
          <Divider />
        </Box>
      </Drawer>
    </div>
  );
};

export default NavBar;
