import { z } from "zod";
import { Publicprocedure, router} from "./trpc";
import { CreatorRouter } from "../routers/creatorRouter";

export const appRouter = router({
  creator: CreatorRouter
});

export type AppRouter = typeof appRouter;
