import ModelRepository from "../domain/model/modelInterface";
import { CheckIfResponseExists } from "./CheckIfResponseExistsInCacheUseCase";
import { ApiInterface } from "./interfaces/ApiInterface";

export class GenerateResponseUseCase {
  constructor(private repository: ModelRepository,
              private checkIfResponseExistsUseCase: CheckIfResponseExists,
              private model: ApiInterface) { }

  async execute(message: string) {
    const responseExists = this.checkIfResponseExistsUseCase.execute(message);

    if (responseExists === null) {
      const generateResponse = await this.model.execute(message);
      this.repository.saveMessageInCache(message, generateResponse!);
      return generateResponse;
    }

    return responseExists;
  }
}