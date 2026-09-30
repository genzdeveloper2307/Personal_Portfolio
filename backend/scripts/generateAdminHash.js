/**
 * Helper script to generate a bcrypt hash for your admin password.
 * Copy the output into ADMIN_PASSWORD_HASH in your .env file.
 *
 * Usage:
 *   node scripts/generateAdminHash.js "YourStrongPassword123!"
 *
 * If you don't pass a password as an argument, the script will
 * prompt you to type one instead.
 */
const bcrypt = require("bcryptjs");
const readline = require("readline");

const generateHash = async (password) => {
  const saltRounds = 10;
  const hash = await bcrypt.hash(password, saltRounds);
  console.log("\n✅ Add this line to your .env file:\n");
  console.log(`ADMIN_PASSWORD_HASH=${hash}\n`);
};

const argPassword = process.argv[2];

if (argPassword) {
  generateHash(argPassword).catch((err) => {
    console.error(`❌ Error generating hash: ${err.message}`);
    process.exit(1);
  });
} else {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question("Enter the admin password you want to hash: ", async (password) => {
    rl.close();
    if (!password) {
      console.error("❌ No password entered.");
      process.exit(1);
    }
    await generateHash(password);
  });
}
