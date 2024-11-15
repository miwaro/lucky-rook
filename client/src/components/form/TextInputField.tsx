/* eslint-disable @typescript-eslint/no-explicit-any */
import { TextField, FormControl, FormHelperText } from "@mui/material";
import { FieldError, RegisterOptions, UseFormRegister } from "react-hook-form";

interface TextInputFieldProps {
  name: string;
  label: string;
  register: UseFormRegister<any>;
  registerOptions?: RegisterOptions;
  error?: FieldError;
  [x: string]: any;
}

const TextInputField = ({ name, label, register, registerOptions, error, ...props }: TextInputFieldProps) => {
  return (
    <FormControl fullWidth error={!!error} className="mb-4">
      <TextField
        label={label}
        {...props}
        {...register(name, registerOptions)}
        error={!!error}
        helperText={error?.message}
      />
      {error && <FormHelperText>{error.message}</FormHelperText>}
    </FormControl>
  );
};

export default TextInputField;
