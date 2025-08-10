import z from "zod";

export const signupSchema = z.object({
    displayname: z.string().min(3),
    username: z.string().min(3),
    email: z.string().email(),
    location: z.string().optional(),
    college: z.string().optional(),
    occupation: z.string().optional(),
    experience: z.string().optional(),
    password: z.string().min(8), // recommend 8+, enforce complexity at UI if needed
  });
  
  export const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
  });
  
  export const courseInput = z.object({
    title: z.string().min(1),
    description: z.string().optional(),
    duration: z.string().optional(),
    price: z.number().nonnegative().optional(),
    availableLanguages: z.array(z.string()).optional(),
    courseLevel: z.enum(["Beginner", "Intermediate", "Advanced"]).optional(),
    skillsToGain: z.array(z.string()).optional(),
  });
  
  export const updateCourseInput = courseInput.extend({ id: z.string() });
  
  export const userProfileUpdate = z.object({
    displayname: z.string().min(1).optional(),
    location: z.string().optional(),
    college: z.string().optional(),
    occupation: z.string().optional(),
    // never allow password update here; use dedicated change-password flow
  });