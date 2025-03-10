import { useForm } from "react-hook-form";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";

export default function SignIn(props) {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();
  const onSubmit = (data) => {
    setValue("email", "");
    setValue("password", "");
  };

  return (
    <>
      <Typography variant="h2" gutterBottom>
        Please Login
      </Typography>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Box
          sx={() => ({
            display: "flex",
            flexDirection: "column",
            width: 1 / 3,
            margin: "auto",
            gap: "10px",
            bgcolor: "#fff",
            color: "grey.800",
            border: "1px solid",
            borderColor: "grey.300",
            borderRadius: 2,
            padding: "10px",
          })}
        >
          <TextField
            defaultValue=""
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                message: "Please enter a valid email address",
              },
            })}
            placeholder="Email"
            size="small"
            error={!!errors.email} // Display error state
          />
          {errors.email && (
            <Box
              sx={() => ({
                color: "red",
              })}
            >
              {errors.email.message}
            </Box>
          )}

          <TextField
            {...register("password", {
              required: true,
              minLength: 6,
            })}
            placeholder="Password"
            defaultValue=""
            size="small"
          />
          {/* errors will return when field validation fails  */}
          {errors.password && errors.password.type === "required" && (
            <Box
              sx={() => ({
                color: "red",
              })}
            >
              Please add password.
            </Box>
          )}
          {errors.password && errors.password.type === "minLength" && (
            <Box
              sx={() => ({
                color: "red",
              })}
            >
              Password should be atleast 6 characters
            </Box>
          )}
          <Button type="submit" variant="contained">
            Sign up
          </Button>
        </Box>
      </form>
    </>
  );
}
