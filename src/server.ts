import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import { createClient } from "redis";
import { loadEnvFile } from "process";
import jwt from 'jsonwebtoken'
import config from "./infra/config/config";
import { Role, User, UserRequest, UserResponse } from "./domain/User";
import { GenerateResponseUseCase } from "./application/GenerateResponseUseCase";
import { RedisRepository } from "./infra/db/repository/RedisRepository";
import { CheckIfResponseExists } from "./application/CheckIfResponseExistsInCacheUseCase";
import { OllamaService } from "./infra/ai/api/ollama/ollama";

const app = express();
loadEnvFile();
app.use(cors());
app.use(express.json());

export const client = createClient({
  url: config.redisUrl,
});

const repository = new RedisRepository();
const modelApiService = new OllamaService(); 
const checkResponseExistsUseCase = new CheckIfResponseExists(repository);
const generateResponse = new GenerateResponseUseCase(
  repository,
  checkResponseExistsUseCase,
  modelApiService,
);

interface JWTPayload {
  id: string,
  email: string,
  role: Role,
}

interface AuthRequest extends Request {
  user?: {
    id: string,
    email: string,
    role: Role
  }
}

const createUser = async (userRequest: UserRequest): Promise<UserResponse | null> => {

  const userExists = await client.GET(userRequest.email)
  if (userExists !== null) return null;
  
  const userId = String(crypto.randomUUID());

  const user: User = {
    id: userId,
    ...userRequest
  }
  
  const database = await client.SET(
    userRequest.email,
    JSON.stringify(user),
  );

  if (database !== 'OK') return null;

  return {
    id: userId,
    name: userRequest.name,
    email: userRequest.email,
    role: userRequest.role,
  }
}

const loginUser = async (userEmail: string, password: string): Promise<User | null> => {
  const userExists = await client.GET(userEmail);

  if (userExists === null) return null;
  
  const userToJSON = JSON.parse(userExists) as User;

  return userToJSON.password === password ? userToJSON : null;
}

const generateJWTToken = (id: string, email: string, role: Role): string => {
  return jwt.sign({
    id: id,
    email: email,
    role: role
  } as JWTPayload,
    config.jwtSecret, {
    expiresIn: "1h"
  });
}

const decodeToken = (token: string): JWTPayload | null  => {
  try {
    const decoded = jwt.verify(token, config.jwtSecret) as JWTPayload;
    return {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role
    } as JWTPayload;
  } catch (err) {
    return null
  }
}

const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) return res.status(401).json({ error: "Token nao informado!" });
  
  const [, token] = authHeader?.split(" ");

  const decoded = decodeToken(token!);

  if (!decoded) return res.status(401).json({ error: "Token Invalido!" });

  req.user = decoded;
  next();
}

const validateBody = (req: Request, res: Response, next: NextFunction) => {
  const { message } = req.body as { message: string };

  if (!message || message.trim() === "") return res.status(400).json({ error: "Passe alguma pergunta , o body nao pode ser vazio!" });

  next();
}

app.post("/chat", validateBody, authMiddleware, async (req: AuthRequest, res: Response) => {
  const { message } = req.body;

  if (req.user?.role !== "premium") {
    return res.status(401).json({ error: "Acesso Negado!, So usuarios premium pode usar esta feature!" });
  }
  
  const response = await generateResponse.execute(message);

  if (!response) return res.status(400).json({ error: "Falhou ao gerar a resposta!" });

  const responseContent = response.message.content;

  console.log(`Resposta da pergunta:::: ${message} \n${responseContent}`);
  return res.status(200).json(responseContent);
});

app.get('/signin', async (req: Request, res: Response) => {
  const { email, password } = req.body as { email: string, password: string }

  if (email === "" || password === "") return res.status(400).json({ error: "Campos nulos sao invalidos!" })

  const sigin = await loginUser(email, password);

  if (sigin === null) return res.status(404).json({ message: "Credenciais invalidas!" });

  const generateToken = generateJWTToken(sigin.id, sigin.email, sigin.role);
  return res.status(200).json({ token: generateToken });
});

app.post('/signup', async (req: Request, res: Response) => {
  const userRequest: UserRequest = req.body;

  const tryCreateUser: UserResponse | null = await createUser(userRequest);

  if (tryCreateUser !== null) {
    return res.status(201).json(tryCreateUser);
  };

  return res.status(400).json({ error: "Erro ao criar usuario" });
});

app.get('/profile', authMiddleware, (req: AuthRequest, res: Response) => {
  return res.status(200).json({ userCredentials: req.user });
})

app.listen(config.port, async () => {
  await client.connect();
  console.log(`Server running on port ${config.port}`);
})