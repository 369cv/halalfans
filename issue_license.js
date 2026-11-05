import { issueLicense } from "./server.js";

const limit = parseInt(process.argv[2] || "100", 10);
const email = process.argv[3] || "user@example.com";
const plan = process.argv[4] || "creator";

const license = issueLicense({ email, limit, plan });

console.log("\n==========================================");
console.log("       NEW LICENSE KEY ISSUED");
console.log("==========================================");
console.log(`Key:         ${license.key}`);
console.log(`Email:       ${license.email}`);
console.log(`Plan:        ${license.plan}`);
console.log(`Generations: ${license.limit}`);
console.log(`Created:     ${license.createdAt}`);
console.log("==========================================\n");
