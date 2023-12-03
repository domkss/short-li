import { createClient, RedisClientType } from "redis";

class RedisDB {
  private static client: RedisClientType;
  static async getClient() {
    if (this.client && this.client.isOpen) {
      return this.client;
    }

    this.client = createClient({
      password: process.env.REDIS_PW,
      socket: {
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT),
      },
    });

    this.client.on("error", (err: any) => console.log(err));

    await this.client.connect();

    return this.client;
  }
}

export { RedisDB };
