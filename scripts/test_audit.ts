import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '../server/routers';
import superjson from 'superjson';

const client = createTRPCProxyClient<AppRouter>({
  links: [httpBatchLink({ 
    url: 'http://localhost:3000/api/trpc',
  })],
  transformer: superjson,
});

async function test() {
  try {
    console.log('Testing auditDispatch...');
    const res = await client.command.auditDispatch.mutate({ 
      text: "Reflexionar sobre la inmortalidad del cangrejo" 
    });
    console.log('Response:', JSON.stringify(res, null, 2));
  } catch (e: any) {
    console.error('Error:', e.message);
    console.error('Stack:', e.stack);
  }
}

test();
