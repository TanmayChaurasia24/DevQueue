import { JWT_SECRET } from "@/utils/config";
import { Middlware } from "../trpc/trpc";
import jwt from "jsonwebtoken"

// ---------- Auth middleware ----------
export const protect = Middlware(async ({ ctx, next }: any) => {
    const authHeader = ctx.req?.headers?.authorization as string | undefined;
    const tokenFromHeader = authHeader?.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;
  
    // Also you might prefer reading token from HttpOnly cookie:
    const tokenFromCookie = ctx.req?.cookies?.token;
  
    const token = tokenFromHeader ?? tokenFromCookie;
  
    if (!token) {
      throw new (require("@trpc/server").TRPCError)({
        code: "UNAUTHORIZED",
        message: "Not authenticated",
      });
    }
  
    try {
      const payload = jwt.verify(token, JWT_SECRET) as {
        userId: string;
        iat?: number;
        exp?: number;
      };
      // attach user to ctx for downstream resolvers
      const user = await ctx.prisma.user.findUnique({
        where: { id: payload.userId },
      });
      if (!user) {
        throw new Error("User not found");
      }
      // attach
      (ctx as any).user = user;
      return next({
        ctx: {
          // keep existing ctx but add user
          ...ctx,
          user,
        },
      });
    } catch (err) {
      throw new (require("@trpc/server").TRPCError)({
        code: "UNAUTHORIZED",
        message: "Invalid or expired token",
      });
    }
  });