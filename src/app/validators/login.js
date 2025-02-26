const z = require('zod');

const loginSchema = z.object({
  username: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters." }),
});

module.exports = {
  loginSchema,
};



