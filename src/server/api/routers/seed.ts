import { z } from "zod";
import { db } from "../../../database.config";

import { createTRPCRouter, publicProcedure } from "../trpc";

export const seedRouter = createTRPCRouter({
  seedphrase: publicProcedure
    .input(z.object({ uid: z.string() }))
    .query(async ({ input }) => {
      const phrases = await db.state
          .where("uid")
          .equals(input.uid)
          .toArray();

      console.log(phrases);
        if (phrases.length == 0) {
            return {
                seedphrase: ""
            }
        } else {
            return {
                seedphrase: phrases[0]
            }
        }

    }),
});
