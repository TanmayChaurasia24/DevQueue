import { z } from "zod";
import { Publicprocedure,Router} from "./trpc";
import { CreatorRouter } from "../routers/creatorRouter";

export const appRouter = Router({
  creator: CreatorRouter
});

export type AppRouter = typeof appRouter;
