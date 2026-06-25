import { createClient } from "redis";
import config from "../config/config";

export const client = createClient({
  url: config.redisUrl,
});

client.on("error", (err) =>
  console.error("Erro ao se conectar ao REDIS::: ", err),
); 