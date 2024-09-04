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

```
$ yolox "add 100px white padding around dots.png and save it as dots-with-room.png"
# convert dots.png -bordercolor white -border 100 dots-with-room.png
```

You can also pass a file containing the prompt. This lets you write long prompts and iterate on them without retyping:

```
echo "do some stuff" > PROMPT.md
$ yolox PROMPT.md
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

```
yolox <prompt-string-or-filename-containing-prompt-string>
```

yolox supports [GPT4o](https://openai.com/index/hello-gpt-4o/) on OpenAI and [Llama 3](https://replicate.com/meta/meta-llama-3-70b-instruct) on Replicate.

To add support for other models or providers, [open a pull request](https://github.com/zeke/yolox/issues)!

### OpenAI Usage (GPT4o)

Set your OpenAI API key in the environment:

```console
export OPENAI_API_KEY="..."
```

Then give it a command and it will execute it:

```
yolox "extract audio from maths.mp4 and save it as maths.m4a"
# ffmpeg -i maths.mp4 -vn -acodec copy maths.m4a
```

### Replicate Usage (Llama 3)

Set your Replicate token in the environment:

```console
export REPLICATE_API_TOKEN="r8_..."
```

Then specify `model` as a flag set to `llama` (which uses [meta/meta-llama-3.1-405b-instruct](https://replicate.com/meta/meta-llama-3.1-405b-instruct)):

```
yolox "extract audio from maths.mp4 and save it as maths.m4a" --model=llama
# ffmpeg -i maths.mp4 -vn -acodec copy maths.m4a
```

### Print mode

Print the command but don't execute it:

```console
yolox --print "extract audio from maths.mp4 and save it as maths.m4a"
ffmpeg -i maths.mp4 -vn -acodec copy maths.m4a
```

## Alternatives

[GitHub Copilot CLI](https://docs.github.com/en/copilot/github-copilot-in-the-cli/using-github-copilot-in-the-cli) is a paid offering from GitHub that works similarly to yolox, but is safer. Rather than running the generated command, it shows you the command and gives you some options:

```
$ gh copilot suggest -t shell "list all files"

Suggestion:

  ls -a

? Select an option  [Use arrows to move, type to filter]
> Copy command to clipboard
  Explain command
  Revise command
  Rate response
  Exit
```

## License

MIT
