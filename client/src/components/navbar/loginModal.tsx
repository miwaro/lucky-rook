import { useState } from "react";
import { useForm } from "react-hook-form";
import { LoginCredentials } from "../../network/users_api";
import * as UsersApi from "../../network/users_api";
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Alert } from "@mui/material";
import { UnauthorizedError } from "../../errors/http_errors";
import { AppDispatch } from "../../store";
import { useDispatch } from "react-redux";
import { setLoggedInUser } from "../../features/player/playerSlice";

const LoginModal = () => {
  const dispatch = useDispatch<AppDispatch>();

  const [errorText, setErrorText] = useState<string | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const handleOpenLoginModal = () => {
    setIsLoginModalOpen(true);
  };

  const handleCloseLoginModal = () => {
    setIsLoginModalOpen(false);
  };

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginCredentials>();

  async function onSubmit(credentials: LoginCredentials) {
    try {
      const user = await UsersApi.login(credentials);
      dispatch(setLoggedInUser(user));
      handleCloseLoginModal();
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        setErrorText(error.message);
      } else {
        alert(error);
      }
      console.error(error);
    }
  }

  return (
    <div>
      <Button
        onClick={handleOpenLoginModal}
        variant="outlined"
        style={{
          color: "#fff",
          borderColor: "#fff",
        }}
      >
        Log In
      </Button>
      <Dialog open={isLoginModalOpen} onClose={handleCloseLoginModal} fullWidth maxWidth="sm">
        <DialogTitle>Log In</DialogTitle>
        <DialogContent>
          {errorText && (
            <Alert severity="error" className="mb-4">
              {errorText}
            </Alert>
          )}
          <Box component="form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 mt-4">
            <TextField
              label="Username"
              type="text"
              placeholder="Username"
              fullWidth
              {...register("username", { required: "Required" })}
              error={!!errors.username}
              helperText={errors.username?.message}
            />
            <TextField
              label="Password"
              type="password"
              placeholder="Password"
              fullWidth
              {...register("password", { required: "Required" })}
              error={!!errors.password}
              helperText={errors.password?.message}
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={isSubmitting}
              style={{
                color: "FFF",
                borderColor: "#000",
                backgroundColor: "#15803D",
              }}
            >
              Log In
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCloseLoginModal}
            variant="outlined"
            style={{
              color: "#000",
              borderColor: "#ccc",
              margin: "0 14px 14px 0",
            }}
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default LoginModal;
