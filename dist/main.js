"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const readline = require("readline");
const child_process_1 = require("child_process");
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
const currentProcess = [];
const installResults = [];
readlineInterface.setPrompt(PROMPT);
readlineInterface.prompt();
readlineInterface.on("line", (line) => __awaiter(void 0, void 0, void 0, function* () {
    const commandTokens = tokenizeCommand(line);
    const isDevelopmentDependency = includesSaveDev(commandTokens);
    const packageName = getPackageName(commandTokens);
    if (tokens.npm === commandTokens[0]) {
        if (tokens.install.includes(commandTokens[1])) {
            if (packageName) {
                const result = yield installPackage(packageName, isDevelopmentDependency);
                installResults.push(result);
                const typesResult = yield installTypes(packageName, isDevelopmentDependency);
                installResults.push(typesResult);
            }
            else {
                console.log(ERROR_NO_PACKAGE_NAME);
            }
        }
        else {
            yield executeCommand(line);
        }
    }
    else {
        yield executeCommand(line);
    }
    installResults.forEach((result) => {
        console.log(`${result.packageName} (${result.link}): ${colorizeStatus(result.status)}`);
    });
    installResults.length = 0;
    readlineInterface.prompt();
}));
function tokenizeCommand(command) {
    return command.trim().split(" ");
}
function includesSaveDev(commandTokens) {
    return commandTokens.some((token) => tokens.saveDev.includes(token));
}
function getPackageName(commandTokens) {
    return commandTokens
        .filter((token) => !tokens.saveDev.includes(token))
        .slice(2)
        .join(" ")
        .trim();
}
function installPackage(packageName, isDevelopmentDependency) {
    return __awaiter(this, void 0, void 0, function* () {
        const installCommand = isDevelopmentDependency
            ? `npm install --save-dev ${packageName}`
            : `npm install ${packageName}`;
        console.log(MESSAGE_INSTALLING + packageName + "...");
        const installExitCode = yield executeCommand(installCommand);
        const packageStatus = installExitCode === 0 ? "Installed successfully" : "Installation problem";
        const packageLink = `https://www.npmjs.com/package/${packageName}`;
        return { packageName, status: packageStatus, link: packageLink };
    });
}
function installTypes(packageName, isDevelopmentDependency) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(MESSAGE_SEARCHING_TYPES + packageName + "...");
        const viewCommand = `npm view @types/${packageName}`;
        const viewExitCode = yield executeCommand(viewCommand);
        let typesStatus;
        let typesLink;
        if (viewExitCode !== 0) {
            console.log(MESSAGE_NO_TYPES + packageName + ", skipping.");
            typesStatus = "Package not found";
            typesLink = "";
        }
        else {
            console.log(MESSAGE_FOUND_TYPES + packageName + "...");
            const installCommand = isDevelopmentDependency
                ? `npm install --save-dev @types/${packageName}`
                : `npm install @types/${packageName}`;
            const installExitCode = yield executeCommand(installCommand);
            typesStatus =
                installExitCode === 0 ? "Installed successfully" : "Installation problem";
            typesLink = `https://www.npmjs.com/package/@types/${packageName}`;
        }
        return {
            packageName: "@types/" + packageName,
            status: typesStatus,
            link: typesLink,
        };
    });
}
function executeCommand(command) {
    return new Promise((resolve, reject) => {
        const process = (0, child_process_1.spawn)(command, { shell: true, stdio: "inherit" });
        currentProcess.push(process);
        process.on("exit", resolve);
        process.on("error", reject);
    });
}
function colorizeStatus(status) {
    const GREEN = "\x1b[32m";
    const YELLOW = "\x1b[33m";
    const RED = "\x1b[31m";
    const RESET = "\x1b[0m";
    if (status === "Installed successfully") {
        return GREEN + status + RESET;
    }
    else if (status === "Package not found") {
        return YELLOW + status + RESET;
    }
    else {
        return RED + status + RESET;
    }
}
