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

### Working with Piped Data

You can pipe data to yolox and it will include that data in the context when generating commands:

```bash
$ echo '{"name": "Alice", "age": 30, "city": "NYC"}' | yolox "use jq to extract just the name"
# echo '{"name": "Alice", "age": 30, "city": "NYC"}' | jq '.name'
```

```bash
$ cat users.json | yolox "use jq to get all users over age 25"
# cat users.json | jq '.[] | select(.age > 25)'
```

```bash
$ ps aux | yolox "find processes using more than 50% CPU"
# ps aux | awk '$3 > 50'
```

```bash
$ curl -s https://api.github.com/users/octocat | yolox "extract the public repos count with jq"
# curl -s https://api.github.com/users/octocat | jq '.public_repos'
```

### File-based Prompts

You can also pass a file containing the prompt. This lets you write long prompts and iterate on them without retyping:

```bash
echo "do some stuff" > PROMPT.md
$ yolox PROMPT.md
```

## Supported Models

Use the `--model` flag to specify which model to use (default is `gpt-4o-mini`).

- `gpt-4o-mini` (default)
- `gpt-4o`
- `claude-sonnet-4-5`
- `claude-haiku-4-5`
- `llama-3-70b`
- `llama-3.1-405b`

**Examples:**

```bash
# Use default (gpt-4o-mini)
yolox "list files"

# Use Claude Sonnet
yolox --model=claude-sonnet-4-5 "list files"

# Use GPT-4o
yolox --model=gpt-4o "list files"
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

yolox supports three input methods:

1. **Direct command**: `yolox "command description"`
2. **File input**: `yolox filename.txt` (where the file contains the command description)
3. **Stdin input**: `echo "data" | yolox "process this data"`

### Command Line Options

- `--model`: Choose the AI model to use (default: `gpt-4o-mini`)
- `--print`: Show the generated command without executing it

### Examples

```bash
# Basic usage (uses gpt-4o-mini by default)
yolox "list files by size"

# Use Claude Sonnet
yolox --model=claude-sonnet-4-5 "compress all png files"

# Use Claude Haiku (fast and cost-effective)
yolox --model=claude-haiku-4-5 "find large files"

# Use GPT-4o
yolox --model=gpt-4o "complex task requiring advanced reasoning"

# Print mode (don't execute)
yolox --print "find large files"

# With piped data
cat data.csv | yolox "convert to JSON using any available tools"

# Using a prompt file
echo "complex multi-line prompt here" > prompt.txt
yolox prompt.txt
```

### OpenAI Usage (GPT-4o-mini, GPT-4o)

Set your OpenAI API key in the environment:

```console
export OPENAI_API_KEY="..."
```

Then give it a command and it will execute it (uses GPT-4o-mini by default):

```
yolox "extract audio from maths.mp4 and save it as maths.m4a"
# ffmpeg -i maths.mp4 -vn -acodec copy maths.m4a
```

To use GPT-4o instead:

```
yolox --model=gpt-4o "extract audio from maths.mp4 and save it as maths.m4a"
# ffmpeg -i maths.mp4 -vn -acodec copy maths.m4a
```

### Anthropic Usage (Claude Sonnet, Claude Haiku)

Set your Anthropic API key in the environment:

```console
export ANTHROPIC_API_KEY="..."
```

Then specify `model` as `claude-sonnet-4-5` for Claude Sonnet 4.5 (best for complex reasoning):

```
yolox --model=claude-sonnet-4-5 "extract audio from maths.mp4 and save it as maths.m4a"
# ffmpeg -i maths.mp4 -vn -acodec copy maths.m4a
```

Or use `claude-haiku-4-5` for Claude Haiku 4.5 (faster and more cost-effective):

```
yolox --model=claude-haiku-4-5 "list all jpg files"
# ls *.jpg
```

### Replicate Usage (Llama 3)

Set your Replicate token in the environment:

```console
export REPLICATE_API_TOKEN="r8_..."
```

Then specify `model` as `llama-3.1-405b` or `llama-3-70b`:

```
yolox --model=llama-3.1-405b "extract audio from maths.mp4 and save it as maths.m4a"
# ffmpeg -i maths.mp4 -vn -acodec copy maths.m4a
```

### Print mode

Print the command but don't execute it:

```console
yolox --print "extract audio from maths.mp4 and save it as maths.m4a"
ffmpeg -i maths.mp4 -vn -acodec copy maths.m4a
```

## Testing

Run the test suite:

```console
npm test
```

The tests cover:
- Basic functionality and argument parsing
- Stdin input handling
- Model selection and validation
- File-based prompt input
- Print mode operation
- Error handling

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
