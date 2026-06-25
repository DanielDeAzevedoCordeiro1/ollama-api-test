export =  {
  port: process.env.PORT || 3000,
  ollamaUrl: process.env.OLLAMA_URL,
  redisUrl: process.env.REDIS_URL!,
  model: process.env.MODEL,
  jwtSecret: process.env.JWT_SECRET!,
};