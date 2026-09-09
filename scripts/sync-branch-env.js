import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const repoRoot = process.cwd();
const envPath = path.join(repoRoot, ".env");
const branchName = process.argv[2] || execSync("git rev-parse --abbrev-ref HEAD", {
    cwd: repoRoot,
    encoding: "utf8",
}).trim();

const envTemplatesByBranch = {
    dev: ".env.dev.local",
    main: ".env.main.local",
};

const templateFileName = envTemplatesByBranch[branchName] ?? null;

if (!templateFileName) {
    console.log(`\x1b[90m↷  Env switch skipped:\x1b[0m no automatic profile for branch '${branchName}'.`);
    process.exit(0);
}

const templatePath = path.join(repoRoot, templateFileName);

if (!fs.existsSync(templatePath)) {
    console.log(`\x1b[93m⚠  Env switch skipped:\x1b[0m ${templateFileName} was not found.`);
    process.exit(0);
}

const templateContent = fs.readFileSync(templatePath, "utf8");
fs.writeFileSync(envPath, templateContent);

console.log(`\x1b[94m➜  Env profile:\x1b[0m ${branchName} -> ${templateFileName}`);
