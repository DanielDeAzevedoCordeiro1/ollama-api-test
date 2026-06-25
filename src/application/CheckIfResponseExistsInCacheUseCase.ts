import ModelRepository from "../domain/model/modelInterface";

export class CheckIfResponseExists {
  constructor(private repository: ModelRepository) { }

  async execute(message: string): Promise<string | null> {
    const check = await this.repository.findByMessage(message);
    if (!check) return null;
    return check;
  }
}