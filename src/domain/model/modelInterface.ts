export default interface ModelRepository {
  findByMessage(message: string): Promise<string | null>;
  saveMessageInCache(message: string, response: string): Promise<string | null>;
}