import { ApiInterface } from "../../../../application/interfaces/ApiInterface";
import config from "../../../config/config";

export class OllamaService implements ApiInterface{
  constructor(){}
  
  async execute(message: string): Promise<string | null> {
    const result = await fetch(config.ollamaUrl!, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: `${config.model!}`,
        messages: [
          {
            role: "user",
            content: message,
          },
        ],
        stream: false,
      }),
    }).then((res) => res.json());

    return result;
  }
}