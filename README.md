# yolox 🤞

Use AI language models to write one-liner shell commands, then execute them. 

## Examples

```
$ yolox list all files in the current directory, sorted by human size
# ls -lhS
```

```
$ yolox rename all jpeg files to jpg
# for file in *.jpeg; do mv "$file" "${file%.jpeg}.jpg"; done
```

```
$ yolox extract from 0:30 to 1:22 from video.mp4 and save it as audio.m4a
# ffmpeg -i video.mp4 -ss 00:00:30 -to 00:01:22 -vn -acodec copy audio.m4a
```

```
$ yolox create slideshow.mp4 from all the jpg files in the current directory with one second for each slide
# ffmpeg -framerate 1 -pattern_type glob -i '*.jpg' slideshow.mp4
```

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
