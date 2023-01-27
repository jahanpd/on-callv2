import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "../trpc";

export const exampleRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),
  seedphrase: publicProcedure
    .input(z.object({  }))
    .query(({ input }) => {
      return {
        seedphrase: "testing trpc phrase"
      }
    }),
});
