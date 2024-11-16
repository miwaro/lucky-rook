import { useState } from "react";
import { useForm } from "react-hook-form";
import { SignUpCredentials } from "../../network/users_api";
import * as Users from "../../network/users_api";
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Alert } from "@mui/material";
import { ConflictError } from "../../errors/http_errors";
import { setLoggedInUser } from "../../features/player/playerSlice";
import { AppDispatch } from "../../store";
import { useDispatch } from "react-redux";

const SignUpModal = () => {
  const [errorText, setErrorText] = useState<string | null>(null);
  const dispatch = useDispatch<AppDispatch>();

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpCredentials>();

  async function onSubmit(credentials: SignUpCredentials) {
    try {
      const newUser = await Users.signUp(credentials);
      dispatch(setLoggedInUser(newUser));
      handleCloseModal();
    } catch (error) {
      if (error instanceof ConflictError) {
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
        onClick={handleOpenModal}
        variant="outlined"
        style={{
          color: "#fff",
          borderColor: "#fff",
        }}
      >
        Sign Up
      </Button>
      <Dialog open={isModalOpen} onClose={handleCloseModal} fullWidth maxWidth="sm">
        <DialogTitle>Sign Up</DialogTitle>
        <DialogContent>
          {errorText && (
            <Alert severity="error" className="mb-4">
              {errorText}
            </Alert>
          )}
          <Box component="form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
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
              label="Email"
              type="email"
              placeholder="Email"
              fullWidth
              {...register("email", { required: "Required" })}
              error={!!errors.email}
              helperText={errors.email?.message}
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
              disabled={isSubmitting}
              style={{
                color: "FFF",
                borderColor: "#000",
                backgroundColor: "#15803D",
              }}
            >
              Sign Up
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCloseModal}
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

export default SignUpModal;
