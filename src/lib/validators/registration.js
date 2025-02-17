const z = require('zod');

const registrationSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  mobile: z.string().regex(/^\d{10}$/, { message: "Must be a 10-digit mobile number." }),
  dob: z.string().min(1, { message: "Date of birth is required." }),
  gender: z.enum(['male', 'female', 'other'], {required_error: 'Please select a gender.'}),
});

module.exports = {
  registrationSchema,
};
