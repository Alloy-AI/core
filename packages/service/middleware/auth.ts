import { createMiddleware } from "hono/factory";
import { Address, isAddress } from "viem";
import { respond } from "../lib/Router";

export const authenticated = createMiddleware<{
    Variables: {
        userWallet: Address;
    };
}>(async (ctx, next) => {
    const authHeader = ctx.req.header("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return respond.err(ctx, "Missing or invalid authorization header", 401);
    }

    const address = authHeader.substring(7); // Remove "Bearer " prefix

    if (!isAddress(address)) {
        return respond.err(ctx, "Invalid wallet address", 401);
    }

    ctx.set("userWallet", address);
    await next();
});
