# yolox 🤞

Use AI language models to write one-liner shell commands, then execute them. 

## Caution

This tool should be used with caution. It's called "YOLO X" because it's dangerous. **yolo** as in "you only live once" and *x* as in "execute this code". It lets an AI write code for you, then blindly executes that code on your system. There are a few guardrails in its prompt to prevent the result from taking destructive actions like deleting files or directories, but there's always still a danger that the resulting commands will have unintended consequences. You've been warned!

## Installation

```console
npm i -g yolox
```

or you can just invoke it directly with npx:

```console
npx yolox@latest "use ffmpeg to convert foo.mkv to foo.mp4"
```

## Usage

This thing only supports OpenAI GPT for the moment, but it could be easily updated to support other models using Replicate, Ollama, etc. [Pull requests welcome!](https://github.com/zeke/yolox/issues)

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
