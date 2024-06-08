import { NextRequest, NextResponse } from "next/server";
import { StatusCodes as HTTPStatusCode } from "http-status-codes";
import { th } from "date-fns/locale";

class RateLimiter {
  windowSizeMs: number;
  maxRequests: number;
  idToWindows: Map<string, Array<number>>;

  constructor(config: { windowSizeSec: number; maxRequests: number }) {
    this.windowSizeMs = config.windowSizeSec * 1000;
    this.maxRequests = config.maxRequests;
    this.idToWindows = new Map<string, Array<number>>();
  }

  limit(id: string) {
    const now = Date.now();

    // get queue or initialize it
    let queue = this.idToWindows.get(id);
    if (!queue) {
      queue = [];
      this.idToWindows.set(id, queue);
    }

    // clear old windows
    while (queue.length > 0 && now - queue[0] > this.windowSizeMs) {
      queue.shift();
    }

    if (queue.length >= this.maxRequests) return true;

    // add current window to queue
    queue.push(now);

    return false;
  }
}

export type NextApiHandler = (req: NextRequest) => Promise<Response>;

export function rateLimitedEndpoint(handler: NextApiHandler, rateLimiter: RateLimiter): NextApiHandler {
  return async (req: NextRequest) => {
    try {
      const ip = (req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "").split(",").shift()?.trim();
      if (!ip || ip?.length === 0) throw new Error("IP address not found");

      const isRateLimited = rateLimiter.limit(ip);

      if (isRateLimited)
        return NextResponse.json(
          { error: "You have reached the rate limit. Please try again later." },
          { status: HTTPStatusCode.TOO_MANY_REQUESTS },
        );

      const response = await handler(req);
      return response;
    } catch (error) {
      return NextResponse.json({ error: "Internal Server Error" }, { status: HTTPStatusCode.INTERNAL_SERVER_ERROR });
    }
  };
}

export { RateLimiter };
