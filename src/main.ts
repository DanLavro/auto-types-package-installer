import * as readline from "readline";
import { spawn, ChildProcess } from "child_process";

const readlineInterface = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const PROMPT = "auto-types-install >> ";
const ERROR_NO_PACKAGE_NAME = "Error: No package name specified.";
const MESSAGE_INSTALLING = "Installing ";
const MESSAGE_SEARCHING_TYPES = "Searching for @types/";
const MESSAGE_FOUND_TYPES = "@types/ found, installing...";
const MESSAGE_NO_TYPES = "@types/ not found, skipping.";

const tokens = {
  npm: "npm",
  install: ["install", "i"],
  saveDev: ["--save-dev", "-D"],
};

const currentProcess: ChildProcess[] = [];

const installResults: { packageName: string; status: string; link: string }[] =
  [];

readlineInterface.setPrompt(PROMPT);
readlineInterface.prompt();

readlineInterface.on("line", async (line) => {
  const commandTokens = tokenizeCommand(line);
  const isDevelopmentDependency = includesSaveDev(commandTokens);
  const packageName = getPackageName(commandTokens);

  if (tokens.npm === commandTokens[0]) {
    if (tokens.install.includes(commandTokens[1])) {
      if (packageName) {
        const result = await installPackage(
          packageName,
          isDevelopmentDependency
        );
        installResults.push(result);
        const typesResult = await installTypes(
          packageName,
          isDevelopmentDependency
        );
        installResults.push(typesResult);
      } else {
        console.log(ERROR_NO_PACKAGE_NAME);
      }
    } else {
      await executeCommand(line);
    }
  } else {
    await executeCommand(line);
  }

  installResults.forEach((result) => {
    console.log(
      `${result.packageName} (${result.link}): ${colorizeStatus(result.status)}`
    );
  });
  installResults.length = 0;

  readlineInterface.prompt();
});

function tokenizeCommand(command: string): string[] {
  return command.trim().split(" ");
}

function includesSaveDev(commandTokens: string[]): boolean {
  return commandTokens.some((token) => tokens.saveDev.includes(token));
}

function getPackageName(commandTokens: string[]): string {
  return commandTokens
    .filter((token) => !tokens.saveDev.includes(token))
    .slice(2)
    .join(" ")
    .trim();
}

async function installPackage(
  packageName: string,
  isDevelopmentDependency: boolean
): Promise<{ packageName: string; status: string; link: string }> {
  const installCommand = isDevelopmentDependency
    ? `npm install --save-dev ${packageName}`
    : `npm install ${packageName}`;
  console.log(MESSAGE_INSTALLING + packageName + "...");
  const installExitCode = await executeCommand(installCommand);

  const packageStatus =
    installExitCode === 0 ? "Installed successfully" : "Installation problem";
  const packageLink = `https://www.npmjs.com/package/${packageName}`;

  return { packageName, status: packageStatus, link: packageLink };
}

async function installTypes(
  packageName: string,
  isDevelopmentDependency: boolean
): Promise<{ packageName: string; status: string; link: string }> {
  console.log(MESSAGE_SEARCHING_TYPES + packageName + "...");
  const viewCommand = `npm view @types/${packageName}`;
  const viewExitCode = await executeCommand(viewCommand);

  let typesStatus: string;
  let typesLink: string;
  if (viewExitCode !== 0) {
    console.log(MESSAGE_NO_TYPES + packageName + ", skipping.");
    typesStatus = "Package not found";
    typesLink = "";
  } else {
    console.log(MESSAGE_FOUND_TYPES + packageName + "...");
    const installCommand = isDevelopmentDependency
      ? `npm install --save-dev @types/${packageName}`
      : `npm install @types/${packageName}`;
    const installExitCode = await executeCommand(installCommand);
    typesStatus =
      installExitCode === 0 ? "Installed successfully" : "Installation problem";
    typesLink = `https://www.npmjs.com/package/@types/${packageName}`;
  }

  return {
    packageName: "@types/" + packageName,
    status: typesStatus,
    link: typesLink,
  };
}

function executeCommand(command: string): Promise<number> {
  return new Promise((resolve, reject) => {
    const process = spawn(command, { shell: true, stdio: "inherit" });
    currentProcess.push(process);
    process.on("exit", resolve);
    process.on("error", reject);
  });
}

function colorizeStatus(status: string): string {
  const GREEN = "\x1b[32m";
  const YELLOW = "\x1b[33m";
  const RED = "\x1b[31m";
  const RESET = "\x1b[0m";

  if (status === "Installed successfully") {
    return GREEN + status + RESET;
  } else if (status === "Package not found") {
    return YELLOW + status + RESET;
  } else {
    return RED + status + RESET;
  }
}
