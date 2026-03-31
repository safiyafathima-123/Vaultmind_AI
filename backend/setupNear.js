const nearAPI = require("near-api-js");
const crypto = require("crypto");
const fs = require("fs");
const https = require("https");

async function createTestnetAccount() {
  // Generate a brand new keypair
  const keyPair = nearAPI.utils.KeyPairEd25519.fromRandom();
  const publicKey = keyPair.getPublicKey().toString();
  const secretKey = keyPair.toString(); // This is the full private key

  // Generate a random account name
  const randomId = crypto.randomBytes(4).toString("hex");
  const accountId = `plgenesis-${randomId}.testnet`;

  console.log("Generated Account ID:", accountId);
  console.log("Public Key:", publicKey);
  console.log("Secret Key (first 20 chars):", secretKey.substring(0, 20) + "...");

  // Use NEAR testnet helper to fund the account
  const url = `https://helper.testnet.near.org/account`;
  const postData = JSON.stringify({
    newAccountId: accountId,
    newAccountPublicKey: publicKey,
  });

  return new Promise((resolve, reject) => {
    const req = https.request(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(postData),
      },
    }, (res) => {
      let body = "";
      res.on("data", (chunk) => body += chunk);
      res.on("end", () => {
        if (res.statusCode === 200) {
          console.log("\n✅ Account created and funded on NEAR Testnet!");
          
          // Write .env
          const envContent = `NEAR_RPC_URL=https://rpc.testnet.near.org\nNEAR_ACCOUNT_ID=${accountId}\nNEAR_PRIVATE_KEY=${secretKey}\nNEAR_CONTRACT_ID=${accountId}\n`;
          fs.writeFileSync(".env", envContent);
          console.log("✅ .env file updated with new credentials!");
          console.log("\nYour new .env:");
          console.log(envContent);
          resolve();
        } else {
          console.error("❌ Failed to create account. Status:", res.statusCode, body);
          reject(new Error(body));
        }
      });
    });
    req.on("error", reject);
    req.write(postData);
    req.end();
  });
}

createTestnetAccount().catch(console.error);
