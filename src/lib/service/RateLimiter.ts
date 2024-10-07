import { NextRequest, NextResponse } from "next/server";
import { StatusCodes as HTTPStatusCode } from "http-status-codes";
import Logger from "./Logger";
import RedisInstance from "../server/RedisInstance";

type NextApiHandler = (req: NextRequest) => Promise<Response>;

type NameSpaces = "limit_by_ip";

class RateLimiter {
  readonly namspace: NameSpaces;
  readonly windowSizeMs: number;
  readonly maxRequests: number;

  public static getInstance(config: { namspace: NameSpaces; windowSizeSec: number; maxRequests: number }): RateLimiter {
    return new RateLimiter(config);
  }

  private constructor(config: { namspace: NameSpaces; windowSizeSec: number; maxRequests: number }) {
    this.namspace = config.namspace;
    this.windowSizeMs = config.windowSizeSec * 1000;
    this.maxRequests = config.maxRequests;
  }

  public async isRateLimited(id: string) {
    const now = Date.now();
    const key = `${this.namspace}:${id}`;
    let redis = await RedisInstance.getClient();
    if (!(redis && redis.isOpen)) {
      Logger.error({ message: "Redis client not found", namespace: this.namspace, severity: "Critical" });
      throw new Error("Redis client not found");
    }

    let queue = await redis.LRANGE(key, 0, -1);

    // clear old timestamps
    while (queue.length > 0 && now - parseInt(queue[0]) > this.windowSizeMs) {
      queue.shift();
    }
    await redis.DEL(key);
    // Save the updated queue

    for (let i = 0; i < queue.length; i++) {
      await redis.LPUSH(key, queue[i]);
    }

    if (queue.length >= this.maxRequests) return true;

    await redis.LPUSH(key, now.toString());

    return false;
  }

  public static IPRateLimitedEndpoint(IPRateLimiter: RateLimiter, handler: NextApiHandler): NextApiHandler {
    return async (req: NextRequest) => {
      try {
        const ip = (req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "")
          .split(",")
          .shift()
          ?.trim();
        if (!ip || ip?.length === 0) {
          Logger.error({ message: "IP address not found", namespace: IPRateLimiter.namspace });
          throw new Error("IP address not found");
        }

        const isRateLimited = await IPRateLimiter.isRateLimited(ip);

        if (isRateLimited) {
          Logger.warn({ message: "Rate limit reached", ip, namespace: IPRateLimiter.namspace });

          return NextResponse.json(
            { error: "You have reached the rate limit. Please try again later." },
            { status: HTTPStatusCode.TOO_MANY_REQUESTS },
          );
        }

        const response = await handler(req);
        return response;
      } catch (error) {
        Logger.error({
          message: "Internal Server Error",
          error: error instanceof Error ? error.message : String(error),
        });
        return NextResponse.json({ error: "Internal Server Error" }, { status: HTTPStatusCode.INTERNAL_SERVER_ERROR });
      }
    };
  }
}

export { RateLimiter };
