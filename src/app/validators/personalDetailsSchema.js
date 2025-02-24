// src/validation/personalDetailsSchema.js
import { z } from "zod";

export const personalDetailsSchema = z.object({
  name: z.string().min(3, { message: "Name must be at least 3 characters." }),
  email: z.string().email({ message: "Invalid email format." }),
  mobno: z
    .string()
    .regex(/^[0-9]{10}$/, { message: "Mobile number must be 10 digits." }),
  dob: z.string().nullable(), // Consider adding a date validation if needed
  gender: z.enum(["male", "female"]).default("male"),
  religion: z.string().optional(),
  parent_name: z
    .string()
    .min(3, { message: "Parent's name must be at least 3 characters." }),
  parent_mobno: z
    .string()
    .regex(/^[0-9]{10}$/, {
      message: "Parent's mobile number must be 10 digits.",
    }),
  address1: z
    .string()
    .min(5, { message: "Address Line 1 must be at least 5 characters." }),
  address2: z.string().optional(),
  pincode: z
    .string()
    .regex(/^[0-9]{6}$/, { message: "Pincode must be 6 digits." }),
  state: z.string().min(2, { message: "Please select a state." }),
  city: z.string().min(2, { message: "City must be at least 2 characters." }),
  community: z.string().optional(),
  mother_tongue: z.string().optional(),
  native_state: z.string().optional(),
  district: z.string().optional(),
});