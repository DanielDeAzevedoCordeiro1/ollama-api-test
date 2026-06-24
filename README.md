# Ollama API 

## Se trata de uma API em construcao para atuar com intermediador entre o Ollama e o usuario/sistema.

## Como usar:

### Baixe o [Ollama](https://ollama.com/)

### Baixe um modelo de LLM que preferir [Sugestoes](https://ollama.com/search): 

Exemplo com `llama3:8B`:
```bash
ollama run llama3:8B
```
### Verifique se foi instalado 
Vai mostrar o modelo baixado
```bash
ollama list 
```

### Execute este comando para subir o modelo:

```bash
ollama run <nome-do-modelo>
```
### Suba o redis

```bash
docker compose up -d
```

### Preencha o arquivo .env com as informacoes necessarias , use o `.env.example` como referencia

### Suba o server

```bash
npm run dev
```

## Payload de exemplo para interacao com modelo:

```JSON
{
  "message": "conteudo a ser consultado"
}
```
