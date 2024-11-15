import { useState } from "react";
import { useForm } from "react-hook-form";
import { User } from "../../models/user";
import { SignUpCredentials } from "../../network/users_api";
import * as Users from "../../network/users_api";
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Alert } from "@mui/material";
import { ConflictError } from "../../errors/http_errors";

interface SignUpModalProps {
  onDismiss: () => void;
  onSignUpSuccessful: (user: User) => void;
}

const SignUpModal = ({ onDismiss, onSignUpSuccessful }: SignUpModalProps) => {
  const [errorText, setErrorText] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpCredentials>();

  async function onSubmit(credentials: SignUpCredentials) {
    try {
      const newUser = await Users.signUp(credentials);
      onSignUpSuccessful(newUser);
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
    <Dialog open onClose={onDismiss} fullWidth maxWidth="sm">
      <DialogTitle>Sign Up</DialogTitle>
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
          <Button type="submit" variant="contained" color="primary" disabled={isSubmitting} className="w-full mt-4">
            Sign Up
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

export default SignUpModal;
