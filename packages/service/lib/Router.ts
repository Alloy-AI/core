type RouteResponse = string | { body: string; status?: number; headers?: Record<string, string> };

export class Context {
    req: Request;

    constructor(req: Request) {
        this.req = req;
    }

    err(message: string, status: number = 400): RouteResponse {
        return {
            body: JSON.stringify({ message, success: false }),
            status,
            headers: { 'Content-Type': 'application/json' }
        };
    }

    ok(data: any, message: string = '', status: number = 200): RouteResponse {
        return {
            body: JSON.stringify({ message, success: true, data }),
            status,
            headers: { 'Content-Type': 'application/json' }
        };
    }
}

export class Router {
    private routes: Map<string, Map<string, (ctx: Context) => RouteResponse>> = new Map();

    get(path: string, handler: (ctx: Context) => RouteResponse) {
        if (!this.routes.has('GET')) this.routes.set('GET', new Map());
        this.routes.get('GET')!.set(path, handler);
    }

    post(path: string, handler: (ctx: Context) => RouteResponse) {
        if (!this.routes.has('POST')) this.routes.set('POST', new Map());
        this.routes.get('POST')!.set(path, handler);
    }

    handle(req: Request): Response {
        const url = new URL(req.url);
        const methodRoutes = this.routes.get(req.method);
        if (methodRoutes) {
            const handler = methodRoutes.get(url.pathname);
            if (handler) {
                const ctx = new Context(req);
                const result = handler(ctx);
                if (typeof result === 'string') {
                    return new Response(result);
                } else {
                    return new Response(result.body, {
                        status: result.status || 200,
                        headers: result.headers || {}
                    });
                }
            }
        }
        return new Response("Not Found", { status: 404 });
    }
}
