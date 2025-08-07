import { appRouter } from '@/server/trpc';
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';

export const runtime = 'edge';

export async function POST(req: Request) {
  return fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: () => ({}),
  });
}
