#!/usr/bin/env node

import { test } from 'node:test'
import assert from 'node:assert'
import { spawn } from 'node:child_process'
import { writeFile, unlink } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const yoloxPath = join(__dirname, 'index.js')

// Helper function to run yolox with various inputs
async function runYolox (args = [], stdin = null, env = {}, timeout = 5000) {
  return new Promise((resolve, reject) => {
    const child = spawn('node', [yoloxPath, ...args], {
      env: { ...process.env, ...env },
      stdio: ['pipe', 'pipe', 'pipe']
    })

    let stdout = ''
    let stderr = ''
    let timedOut = false

    const timer = setTimeout(() => {
      timedOut = true
      child.kill('SIGTERM')
      resolve({ code: -1, stdout, stderr, timedOut: true })
    }, timeout)

    child.stdout.on('data', (data) => {
      stdout += data.toString()
    })

    child.stderr.on('data', (data) => {
      stderr += data.toString()
    })

    child.on('close', (code) => {
      clearTimeout(timer)
      if (!timedOut) {
        resolve({ code, stdout, stderr, timedOut: false })
      }
    })

    child.on('error', (err) => {
      clearTimeout(timer)
      if (!timedOut) {
        reject(err)
      }
    })

    if (stdin) {
      child.stdin.write(stdin)
      child.stdin.end()
    } else {
      child.stdin.end()
    }
  })
}

test('yolox shows usage when no command provided', async () => {
  const result = await runYolox([])
  assert.strictEqual(result.code, 0)
  assert(result.stdout.includes('Usage: yolox [options] <english-command>'))
  assert(result.stdout.includes('Available models:'))
  assert(result.stdout.includes('Example with stdin:'))
})

test('yolox shows error for unsupported model', async () => {
  const result = await runYolox(['--model=invalid', 'list files'])
  assert.strictEqual(result.code, 0)
  assert(result.stderr.includes("Error: Model 'invalid' is not supported"))
  assert(result.stdout.includes('Available models are:'))
})

test('yolox handles file input for prompts', async () => {
  const testPrompt = 'list all files in current directory'
  const tempFile = 'test-prompt.txt'

  try {
    await writeFile(tempFile, testPrompt)
    // This will fail due to missing API key, but should not error on file reading
    const result = await runYolox([tempFile, '--print'])

    // The process will exit with code 1 due to API error, but shouldn't have file reading errors
    assert(!result.stderr.includes('Error reading file'))
  } finally {
    await unlink(tempFile).catch(() => {}) // Clean up
  }
})

test('yolox accepts stdin input without crashing', async () => {
  const stdinData = '{"name": "test", "value": 42}'
  const result = await runYolox(['use jq to get the name field', '--print'], stdinData)

  // Should not have stdin reading errors, even if API call fails
  assert(!result.stderr.includes('Error reading from stdin'))
})

test('yolox supports model aliases without hanging', async () => {
  // Test just one model to avoid hanging on API calls
  const result = await runYolox(['--model=gpt-4o', 'echo hello'], null, {}, 3000)

  // Should not error on model selection, might timeout on API call
  assert(!result.stderr.includes('is not supported'))
  // If it times out, that's expected without valid API keys
  if (result.timedOut) {
    console.log('  ℹ Test timed out as expected (no valid API key)')
  }
})

test('yolox handles empty stdin gracefully', async () => {
  const result = await runYolox(['list files'], '', {}, 3000)

  // Should not error on empty stdin, might timeout on API call
  assert(!result.stderr.includes('Error reading from stdin'))
  if (result.timedOut) {
    console.log('  ℹ Test timed out as expected (no valid API key)')
  }
})

test('yolox includes proper usage examples', async () => {
  const result = await runYolox([])

  assert(result.stdout.includes('Usage: yolox [options] <english-command>'))
  assert(result.stdout.includes('Available models:'))
  assert(result.stdout.includes('Example:'))
  assert(result.stdout.includes('Example with stdin:'))
})

test('yolox validates model names correctly', async () => {
  const invalidModel = 'nonexistent-model'

  // Test invalid model - this should exit quickly
  const invalidResult = await runYolox(['--model=' + invalidModel, 'test'])
  assert(invalidResult.stderr.includes('is not supported'))
  assert(invalidResult.stdout.includes('Available models are:'))

  // Test one valid model briefly
  const result = await runYolox(['--model=gpt-4o', 'test'], null, {}, 2000)
  assert(!result.stderr.includes('is not supported'))
})

console.log('Running yolox tests...')
