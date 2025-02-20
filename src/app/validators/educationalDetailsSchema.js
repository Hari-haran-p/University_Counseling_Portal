// src/validation/educationalDetailsSchema.js
import { z } from "zod";

export const educationalDetailsSchema = z.object({
  board_name: z
    .string()
    .min(3, { message: "Board name must be at least 3 characters." }),
  school_name: z
    .string()
    .min(3, { message: "School name must be at least 3 characters." }),
  month_passout: z.string().min(1, { message: "Please select a month." }),
  year_passout: z.string().min(4, { message: "Please select a year." }),
  address: z
    .string()
    .min(5, { message: "School address must be at least 5 characters." }),
  medium: z
    .string()
    .min(2, { message: "Medium of instruction must be at least 2 characters." }),
});