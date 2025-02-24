import { z } from "zod";

export const declarationDetailsSchema = z.object({
  photo: z.any().optional(),
  signature: z.any().optional(),
  declaration: z
    .literal(true, {
      errorMap: () => ({ message: "You must accept the declaration." }),
    }),
});
