export interface ApiInterface {
  execute(message: string): Promise<string | null>;
}