import * as Yup from "yup";

export const loginValidation = Yup.object({
  email: Yup.string()
    .email("Please provide a valid email")
    .required("Email is required"),
  password: Yup.string().required("Password is required"),
});

export const registerValidation = Yup.object({
  name: Yup.string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name cannot exceed 50 characters")
    .required("Name is required"),
  email: Yup.string()
    .email("Please provide a valid email")
    .required("Email is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords must match")
    .required("Confirm password is required"),
});
