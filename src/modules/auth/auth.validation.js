import z from "zod";

const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name cannot exceed 100 characters"),

  email: z
    .string()
    .trim()
    .email("Please Provide a vaild email")
    .max(254, "email is too long")
    .transform((value) => value.toLowerCase()),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password cannot exceed 72 characters"),
});

const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Please provide a valid email")
    .max(254, "Email is too long")
    .transform((value) => value.toLowerCase()),

  password: z
    .string()
    .min(1, "Password is required")
    .max(72, "Password cannot exceed 72 characters"),
});

export { registerSchema, loginSchema };
