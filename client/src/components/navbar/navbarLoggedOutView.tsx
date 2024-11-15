import { Box, Button } from "@mui/material";

interface NavBarLoggedOutViewProps {
  onSignUpClicked: () => void;
  onLoginClicked: () => void;
}

const NavBarLoggedOutView = ({ onSignUpClicked, onLoginClicked }: NavBarLoggedOutViewProps) => {
  return (
    <Box className="flex items-center gap-4">
      <Button variant="outlined" color="inherit" onClick={onSignUpClicked}>
        Sign Up
      </Button>
      <Button variant="outlined" color="inherit" onClick={onLoginClicked}>
        Log In
      </Button>
    </Box>
  );
};

export default NavBarLoggedOutView;
