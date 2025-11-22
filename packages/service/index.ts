import z from "zod";
import { appd } from "./lib/appd";
import { Router } from "./lib/Router";

const router = new Router();

router.get('/app-id', (ctx) => {
    return ctx.ok({ appId: appd.getAppId() });
});

router.post('/agents', async (ctx) => {
    const rawBody = await ctx.req.json();
    const parsedData = z.object({
        name: z.string(),
    })

    return ctx.ok({ status: 'ok' });
})

router.get('/agents/:id/pk', (ctx) => {
    return ctx.ok({ status: 'ok' });
});

const server = Bun.serve({
    port: 3000,
    fetch(req) {
        return router.handle(req);
    },
});

console.log(`Server running on http://localhost:${server.port}`);
