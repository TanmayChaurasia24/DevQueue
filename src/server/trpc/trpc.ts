import { initTRPC } from "@trpc/server";

const t = initTRPC.create();

export const Router = t.router;
export const Publicprocedure = t.procedure;
export const Middlware = t.middleware;
