import { initEdgeStore } from "@edgestore/server";
import { createEdgeStoreNextHandler } from "@edgestore/server/adapters/next/app";
import { auth, currentUser } from "@clerk/nextjs/server";

const es = initEdgeStore.create();

const edgeStoreRouter = es.router({
  publicFiles: es
    .fileBucket()
    .beforeUpload(async () => {
      const { userId } = await auth();
      if (!userId) {
        throw new Error("Unauthorized");
      }
      return true;
    })
    .beforeDelete(async () => {
      const { userId } = await auth();
      if (!userId) {
        throw new Error("Unauthorized");
      }
      return true;
    }),
});

export type EdgeStoreRouter = typeof edgeStoreRouter;

const getHandler = () => {
  if (!process.env.EDGE_STORE_ACCESS_KEY || !process.env.EDGE_STORE_SECRET_KEY) {
    return async () =>
      new Response(
        JSON.stringify({
          error:
            "EdgeStore is not configured. Set EDGE_STORE_ACCESS_KEY and EDGE_STORE_SECRET_KEY in .env.local to enable file uploads.",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
  }
  return createEdgeStoreNextHandler({
    router: edgeStoreRouter,
  });
};

export async function GET(req: any) {
  const handler = getHandler();
  return handler(req);
}

export async function POST(req: any) {
  const handler = getHandler();
  return handler(req);
}
