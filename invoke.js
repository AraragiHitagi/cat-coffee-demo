const { spawn } = require("child_process");
const readline = require("readline");

const CLI_CONFIG = {
  codex: {
    command: "codex",
    args(prompt) {
      return [
        "exec",
        "--json",
        "--skip-git-repo-check",
        "--sandbox",
        "read-only",
        "--color",
        "never",
        "--ephemeral",
        prompt,
      ];
    },
    getText(event) {
      if (
        event.type === "item.completed" &&
        event.item &&
        event.item.type === "agent_message" &&
        typeof event.item.text === "string"
      ) {
        return event.item.text;
      }

      return null;
    },
    isIgnorableStderrLine(line) {
      return (
        line.includes("failed to refresh available models") ||
        line.includes("Reading additional input from stdin...")
      );
    },
    displayName: "Codex",
  },
  opencode: {
    command: "opencode",
    args(prompt) {
      return ["run", "--format", "json", prompt];
    },
    getText(event) {
      if (
        event.type === "text" &&
        event.part &&
        typeof event.part.text === "string"
      ) {
        return event.part.text;
      }

      return null;
    },
    isIgnorableStderrLine() {
      return false;
    },
    displayName: "OpenCode",
  },
};

function invoke(cli, prompt) {
  return new Promise((resolve, reject) => {
    const config = CLI_CONFIG[cli];

    if (!config) {
      reject(new Error(`Unsupported CLI: ${cli}`));
      return;
    }

    if (typeof prompt !== "string" || prompt.length === 0) {
      reject(new Error("Prompt must be a non-empty string"));
      return;
    }

    const child = spawn(config.command, config.args(prompt), {
      stdio: ["pipe", "pipe", "pipe"],
    });

    child.stdin.end();

    const rl = readline.createInterface({
      input: child.stdout,
      crlfDelay: Infinity,
    });

    let reply = "";
    let stderrBuffer = "";
    const stderrLines = [];

    function handleStderrText(text) {
      stderrBuffer += text;

      while (true) {
        const newlineIndex = stderrBuffer.indexOf("\n");
        if (newlineIndex === -1) {
          break;
        }

        const line = stderrBuffer.slice(0, newlineIndex).trim();
        stderrBuffer = stderrBuffer.slice(newlineIndex + 1);

        if (!line || config.isIgnorableStderrLine(line)) {
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

      const text = config.getText(event);
      if (text) {
        reply += text;
      }
    });

    child.stderr.on("data", (chunk) => {
      handleStderrText(chunk.toString());
    });

    child.on("close", (code) => {
      const lastLine = stderrBuffer.trim();
      if (lastLine && !config.isIgnorableStderrLine(lastLine)) {
        stderrLines.push(lastLine);
      }

      if (code !== 0) {
        const stderrText = stderrLines.length > 0 ? `\n${stderrLines.join("\n")}` : "";
        reject(
          new Error(`${config.displayName} exited with code ${code}${stderrText}`)
        );
        return;
      }

      resolve(reply);
    });

    child.on("error", (err) => {
      reject(new Error(`Failed to start ${config.displayName}: ${err.message}`));
    });
  });
}

module.exports = {
  invoke,
};
