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
import { User } from "../../models/user";
import Header from "./header";
import NavBarLoggedOutView from "./navbarLoggedOutView";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { AppDispatch } from "../../store";
import * as UsersApi from "../../network/users_api";
import { setLoggedInUser } from "../../features/player/playerSlice";

interface NavBarProps {
  loggedInUser: User | null;
  onSignUpClicked: () => void;
  onLoginClicked: () => void;
}

interface MenuItem {
  text: string;
  link: string;
}

const NavBar = ({ loggedInUser, onSignUpClicked, onLoginClicked }: NavBarProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const [drawerOpen, setDrawerOpen] = useState(false);

  async function handleMenuSelect(e: { preventDefault: () => void }, option: MenuItem) {
    e.preventDefault();
    if (option.text === "Logout") {
      try {
        await UsersApi.logout();
        dispatch(setLoggedInUser(null));
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
    <div className="flex space-between">
      <AppBar position="sticky" sx={{ backgroundColor: "#3f51b5" }}>
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
              <NavBarLoggedOutView onLoginClicked={onLoginClicked} onSignUpClicked={onSignUpClicked} />
            )}
          </Box>
          <IconButton onClick={toggleDrawer(true)} edge="start" color="inherit" aria-label="menu" sx={{ ml: 2 }}>
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Drawer anchor="right" open={drawerOpen} onClose={toggleDrawer(false)}>
        <Box sx={{ width: 250 }} role="presentation" onClick={toggleDrawer(false)} onKeyDown={toggleDrawer(false)}>
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
