# yolox

Use AI language models to write one-liner shell commands, then execute them. 🤞

Only supports OpenAI GPT for now, but could be updated to use Llama on Replicate, Ollama, etc.

## Installation

```console
npm i -g yolox
```

or you can just invoke it directly with npx:

```console
npx yolox@latest "use ffmpeg to convert foo.mkv to foo.mp4"
```

## Usage

This thing only supports OpenAI GPT for the moment, but it could be easily updated to support other models using Replicate, Ollama, etc.

Set your OpenAI API key in the environment:

```console
export OPENAI_API_KEY="..."
```

Give it a command and it will execute it:

```
yolox extract audio from maths.mp4 and save it as maths.m4a
# shell command to extract audio from maths.mp4 and save it as maths.m4a
# ffmpeg -i maths.mp4 -vn -acodec copy maths.m4a
```

## Dependencies

- [chatgpt](https://ghub.io/chatgpt): Node.js client for the official ChatGPT API.

## Dev Dependencies

None

## License

MIT
