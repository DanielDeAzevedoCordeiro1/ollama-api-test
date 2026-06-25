import ModelRepository from "../../../domain/model/modelInterface";
import { client } from "../database";

export class RedisRepository implements ModelRepository {
  
  async findByMessage(message: string): Promise<string | null> {
    const res = await client.GET(message);
    return res
  }
  
  async saveMessageInCache(message: string, response: string): Promise<string | null> {
    const persistMessageAndResponse = await client.SET(message, response);
    return persistMessageAndResponse; 
  }
  
}