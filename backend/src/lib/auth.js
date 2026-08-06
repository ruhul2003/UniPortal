import { betterAuth } from "better-auth";

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET || "uniportal_super_secret_auth_key_2026_modern",
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:5000",
  emailAndPassword: {
    enabled: true,
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "student",
      },
      department: {
        type: "string",
        defaultValue: "Computer Science & Engineering",
      },
      studentId: {
        type: "string",
        defaultValue: "",
      },
      designation: {
        type: "string",
        defaultValue: "",
      }
    }
  }
});
