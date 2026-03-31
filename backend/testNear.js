require('dotenv').config();
const { writeProofToNear } = require('./nearProof');

async function main() {
  console.log("ENV check:", process.env.NEAR_ACCOUNT_ID, process.env.NEAR_PRIVATE_KEY ? "KEY_SET" : "KEY_MISSING");
  
  const result = await writeProofToNear({
    session_id: "test_123",
    agent_id: "safiya2.testnet",
    decision: "test proof",
    confidence_score: 0.95,
    timestamp: new Date().toISOString()
  });
  
  console.log("RESULT:", JSON.stringify(result, null, 2));
}

main();
