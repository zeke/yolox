echo "# shell command to $*"
output=$(npx chatgpt "write a one-line shell command to $*. Do not write code that will delete files or folders. Do not explain the code. Do not fence the code. No code fencing. Just show the command.")
echo "# $output"
echo ""
echo $output | bash