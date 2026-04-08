const { spawn } = require("child_process");
const readline = require("readline");

const prompt = process.argv[2];

if (!prompt) {
  console.error('Usage: node minimal-opencode.js "你的问题"');
  process.exit(1);
}

const child = spawn(
  "opencode",
  ["run", "--format", "json", prompt],
  {
    stdio: ["pipe", "pipe", "pipe"],
  }
);

child.stdin.end();

const rl = readline.createInterface({
  input: child.stdout,
  crlfDelay: Infinity,
});

let printed = false;
let stderrBuffer = "";
const stderrLines = [];

function isIgnorableStderrLine(line) {
  return false;
}

function handleStderrText(text) {
  stderrBuffer += text;

  while (true) {
    const newlineIndex = stderrBuffer.indexOf("\n");
    if (newlineIndex === -1) {
      break;
    }

    const line = stderrBuffer.slice(0, newlineIndex).trim();
    stderrBuffer = stderrBuffer.slice(newlineIndex + 1);

    if (!line || isIgnorableStderrLine(line)) {
      continue;
    }

    stderrLines.push(line);
  }
}

rl.on("line", (line) => {
  let event;

  try {
    event = JSON.parse(line);
  } catch {
    return;
  }

  if (
    event.type === "text" &&
    event.part &&
    typeof event.part.text === "string"
  ) {
    process.stdout.write(event.part.text);
    printed = true;
  }
});

child.stderr.on("data", (chunk) => {
  handleStderrText(chunk.toString());
});

child.on("close", (code) => {
  const lastLine = stderrBuffer.trim();
  if (lastLine && !isIgnorableStderrLine(lastLine)) {
    stderrLines.push(lastLine);
  }

  if (printed) {
    process.stdout.write("\n");
  }

  if (stderrLines.length > 0) {
    for (const line of stderrLines) {
      console.error(line);
    }
  }

  if (code !== 0) {
    console.error(`OpenCode exited with code ${code}`);
    process.exit(code || 1);
  }
});

child.on("error", (err) => {
  console.error("Failed to start OpenCode:", err.message);
  process.exit(1);
});
