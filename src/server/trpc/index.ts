import { z } from "zod";
import { Publicprocedure, router} from "./trpc";

export const appRouter = router({
  hello: Publicprocedure
    .input(z.object({ name: z.string() }))
    .mutation(({ input }) => {
      console.log("input from frontend to backend is: ", input);
      return { greeting: `Hello, ${input.name}!` };
    }),
});

export type AppRouter = typeof appRouter;
