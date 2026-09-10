import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const repoRoot = process.cwd();
const envPath = path.join(repoRoot, ".env");
const branchName = process.argv[2] || execSync("git rev-parse --abbrev-ref HEAD", {
    cwd: repoRoot,
    encoding: "utf8",
}).trim();

const envConfigByBranch = {
    dev: {
        MONGODB_URI: "mongodb://localhost:27017",
        MONGODB_DATABASE_NAME: "valian"
    },
    main: {
        MONGODB_URI: "mongodb+srv://luisandresrodriguezcampos0709_db_user:tFdLicJndnPPGeSV@valiandb.vhymgiy.mongodb.net/?appName=ValianDB",
        MONGODB_DATABASE_NAME: "valian"
    }
};

const envConfig = envConfigByBranch[branchName];

if (!envConfig) {
    console.log(`\x1b[90m↷  Env switch skipped:\x1b[0m no automatic profile for branch '${branchName}'.`);
    process.exit(0);
}

const envContent = Object.entries(envConfig)
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");

fs.writeFileSync(envPath, envContent);

console.log(`\x1b[94m➜  Env profile:\x1b[0m ${branchName} (local MongoDB → MongoDB Atlas)`);
