import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { createRecordedCampusPoint, deleteRecordedCampusPoint, listRecordedCampusPoints } from "./db";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  recordedPoints: router({
    list: protectedProcedure.query(({ ctx }) => listRecordedCampusPoints(ctx.user.id)),
    create: protectedProcedure
      .input(z.object({
        label: z.string().min(1).max(160),
        category: z.string().min(1).max(80).default("campus-point"),
        latitude: z.number().gte(-90).lte(90),
        longitude: z.number().gte(-180).lte(180),
        accuracyMeters: z.number().int().nonnegative().optional(),
        notes: z.string().max(1000).optional(),
      }))
      .mutation(({ ctx, input }) => createRecordedCampusPoint({ ...input, userId: ctx.user.id })),
    delete: protectedProcedure
      .input(z.object({ id: z.number().int().positive() }))
      .mutation(({ ctx, input }) => deleteRecordedCampusPoint(ctx.user.id, input.id)),
  }),

  // TODO: add feature routers here, e.g.
  // todo: router({
  //   list: protectedProcedure.query(({ ctx }) =>
  //     db.getUserTodos(ctx.user.id)
  //   ),
  // }),
});

export type AppRouter = typeof appRouter;
