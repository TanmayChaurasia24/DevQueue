// src/routers/creator.ts
import z from "zod";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Router, Publicprocedure, Middlware } from "../trpc/trpc"; // keep your imports as you have them
import {
  signupSchema,
  loginSchema,
  courseInput,
  updateCourseInput,
  userProfileUpdate,
} from "../zod/zodSchema";
import { BCRYPT_SALT_ROUNDS, JWT_SECRET, JWT_EXPIRES_IN } from "@/utils/config";
import { protect } from "../middleware/authMiddleware";

// ---------- Helper: set token cookie ----------
function setTokenCookie(res: any, token: string) {
  // Using cookie with HttpOnly, Secure, SameSite=strict
  // Adjust domain/path as needed. In development, Secure won't work without https,
  // so you might conditionally set secure based on NODE_ENV
  const secure = process.env.NODE_ENV === "production";
  res.setHeader(
    "Set-Cookie",
    `token=${token}; HttpOnly; Path=/; Max-Age=${60 * 60 * 24 * 7}; SameSite=Strict${secure ? "; Secure" : ""}`
  );
}

// ---------- Router ----------
export const CreatorRouter = Router({
  // ---------- Signup ----------
  signup: Publicprocedure.input(signupSchema).mutation(
    async ({ ctx, input }: any) => {
      const {
        email,
        password,
        displayname,
        username,
        location,
        college,
        occupation,
        experience,
      } = input;

      // check existing
      const existing = await ctx.prisma.user.findFirst({
        where: { OR: [{ email }, { username }] },
      });
      if (existing) {
        throw new (require("@trpc/server").TRPCError)({
          code: "CONFLICT",
          message: "Email or username already in use",
        });
      }

      const hashed = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

      const user = await ctx.prisma.user.create({
        data: {
          email,
          displayname,
          username,
          location,
          college,
          occupation,
          password: hashed,
          // createdAt auto
        },
      });

      // issue JWT
      const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN,
      });
      // set cookie if response available
      if (ctx.res) setTokenCookie(ctx.res, token);

      // Do not return password
      const { password: _p, ...safe } = user as any;
      return { user: safe, token };
    }
  ),

  // ---------- Login ----------
  login: Publicprocedure.input(loginSchema).mutation(
    async ({ ctx, input }: any) => {
      const { email, password } = input;
      const user = await ctx.prisma.user.findUnique({ where: { email } });
      if (!user) {
        throw new (require("@trpc/server").TRPCError)({
          code: "UNAUTHORIZED",
          message: "Invalid credentials",
        });
      }
      const ok = await bcrypt.compare(password, user.password);
      if (!ok) {
        throw new (require("@trpc/server").TRPCError)({
          code: "UNAUTHORIZED",
          message: "Invalid credentials",
        });
      }

      const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN,
      });
      if (ctx.res) setTokenCookie(ctx.res, token);

      const { password: _p, ...safe } = user as any;
      return { user: safe, token };
    }
  ),

  // ---------- Create course (protected) ----------
  createCourse: Publicprocedure.use(protect)
    .input(courseInput)
    .mutation(async ({ ctx, input }: any) => {
      // ctx.user is set by protect middleware
      const user = (ctx as any).user;
      const created = await ctx.prisma.course.create({
        data: {
          title: input.title,
          description: input.description ?? "",
          duration: input.duration ?? "",
          // rating default 0, alreadyEnrolled default 0
          price: (input.price ?? 0).toString(), // if your schema uses Decimal/Int adjust accordingly
          availableLanguages: input.availableLanguages ?? [],
          courseLevel: input.courseLevel ?? "Beginner",
          skillsToGain: input.skillsToGain ?? [],
          author: { connect: { id: user.id } },
        },
      });
      return created;
    }),

  // ---------- Add user to a course (purchase) ----------
  addUserToCourse: Publicprocedure.use(protect)
    .input(z.object({ courseId: z.string() }))
    .mutation(async ({ ctx, input }: any) => {
      const user = (ctx as any).user;
      const courseId = input.courseId;

      // many-to-many relationship assumed (purchasers)
      // connect in join table
      await ctx.prisma.course.update({
        where: { id: courseId },
        data: {
          purchasers: { connect: { id: user.id } },
          // increment enrolled count if you track it:
          alreadyEnrolled: { increment: 1 as any }, // only if alreadyEnrolled is Int in schema
        },
      });

      return { success: true };
    }),

  // ---------- Remove user from a course (unenroll) ----------
  removeUserFromCourse: Publicprocedure.use(protect)
    .input(z.object({ courseId: z.string() }))
    .mutation(async ({ ctx, input }: any) => {
      const user = (ctx as any).user;
      const courseId = input.courseId;

      await ctx.prisma.course.update({
        where: { id: courseId },
        data: {
          purchasers: { disconnect: { id: user.id } },
          alreadyEnrolled: { decrement: 1 as any }, // only if Int
        },
      });

      return { success: true };
    }),

  // ---------- Update course (only author) ----------
  updateCourse: Publicprocedure.use(protect)
    .input(updateCourseInput)
    .mutation(async ({ ctx, input }: any) => {
      const user = (ctx as any).user;
      const course = await ctx.prisma.course.findUnique({
        where: { id: input.id },
      });
      if (!course) {
        throw new (require("@trpc/server").TRPCError)({
          code: "NOT_FOUND",
          message: "Course not found",
        });
      }
      if (course.authorId !== user.id) {
        throw new (require("@trpc/server").TRPCError)({
          code: "FORBIDDEN",
          message: "Not the author",
        });
      }

      const updated = await ctx.prisma.course.update({
        where: { id: input.id },
        data: {
          title: input.title,
          description: input.description,
          duration: input.duration,
          price: input.price?.toString(),
          availableLanguages: input.availableLanguages,
          courseLevel: input.courseLevel,
          skillsToGain: input.skillsToGain,
        },
      });

      return updated;
    }),

  // ---------- Update user profile (protected) ----------
  updateUserProfile: Publicprocedure.use(protect)
    .input(userProfileUpdate)
    .mutation(async ({ ctx, input }: any) => {
      const user = (ctx as any).user;
      const updated = await ctx.prisma.user.update({
        where: { id: user.id },
        data: {
          displayname: input.displayname ?? undefined,
          location: input.location ?? undefined,
          college: input.college ?? undefined,
          occupation: input.occupation ?? undefined,
        },
      });
      const { password, ...safe } = updated as any;
      return safe;
    }),
});
