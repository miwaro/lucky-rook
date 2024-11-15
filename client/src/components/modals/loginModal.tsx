import { useForm } from "react-hook-form";
import { User } from "../../models/user";
import { LoginCredentials } from "../../network/users_api";
import * as UsersApi from "../../network/users_api";
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Alert } from "@mui/material";
import { useState } from "react";
import { UnauthorizedError } from "../../errors/http_errors";

interface LoginModalProps {
  onDismiss: () => void;
  onLoginSuccessful: (user: User) => void;
}

const LoginModal = ({ onDismiss, onLoginSuccessful }: LoginModalProps) => {
  const [errorText, setErrorText] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginCredentials>();

  async function onSubmit(credentials: LoginCredentials) {
    try {
      const user = await UsersApi.login(credentials);
      onLoginSuccessful(user);
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
    <Dialog open onClose={onDismiss} fullWidth maxWidth="sm">
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
          <Button type="submit" variant="contained" color="primary" disabled={isSubmitting} className="w-full mt-4">
            Log In
          </Button>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onDismiss} color="secondary">
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LoginModal;
