import { describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

const dbMocks = vi.hoisted(() => ({
  list: vi.fn().mockResolvedValue([{ id: 7, userId: 42, label: "GPS · A Block", latitude: 10.938, longitude: 76.959, accuracyMeters: 8 }]),
  create: vi.fn().mockResolvedValue({ id: 8, userId: 42, label: "GPS · B Block", latitude: 10.9385, longitude: 76.9585, accuracyMeters: 6 }),
  remove: vi.fn().mockResolvedValue(true),
}));

vi.mock("./db", () => ({
  listRecordedCampusPoints: dbMocks.list,
  createRecordedCampusPoint: dbMocks.create,
  deleteRecordedCampusPoint: dbMocks.remove,
}));

function createContext(user: TrpcContext["user"]): TrpcContext {
  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

const signedInUser = {
  id: 42,
  openId: "field-recorder",
  email: "recorder@example.com",
  name: "Field Recorder",
  loginMethod: "manus",
  role: "user" as const,
  createdAt: new Date(),
  updatedAt: new Date(),
  lastSignedIn: new Date(),
};

describe("recordedPoints", () => {
  it("requires authentication before listing saved GPS points", async () => {
    const caller = appRouter.createCaller(createContext(null));
    await expect(caller.recordedPoints.list()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("passes the authenticated owner through create, list, and delete", async () => {
    const caller = appRouter.createCaller(createContext(signedInUser));
    await expect(caller.recordedPoints.list()).resolves.toHaveLength(1);
    await expect(caller.recordedPoints.create({ label: "GPS · B Block", latitude: 10.9385, longitude: 76.9585, accuracyMeters: 6 })).resolves.toMatchObject({ id: 8 });
    await expect(caller.recordedPoints.delete({ id: 8 })).resolves.toBe(true);
    expect(dbMocks.create).toHaveBeenCalledWith(expect.objectContaining({ userId: 42, label: "GPS · B Block" }));
    expect(dbMocks.remove).toHaveBeenCalledWith(42, 8);
  });
});
