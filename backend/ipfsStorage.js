const crypto = require("crypto");
const axios = require("axios");

/**
 * Encodes a buffer to RFC 4648 Base32 (used by IPFS CIDv1)
 */
function base32Encode(buffer) {
    const alphabet = 'abcdefghijklmnopqrstuvwxyz234567';
    let bits = 0;
    let value = 0;
    let output = '';
    for (let i = 0; i < buffer.length; i++) {
        value = (value << 8) | buffer[i];
        bits += 8;
        while (bits >= 5) {
            output += alphabet[(value >>> (bits - 5)) & 31];
            bits -= 5;
        }
    }
    if (bits > 0) {
        output += alphabet[(value << (5 - bits)) & 31];
    }
    return output;
}

/**
 * Pushes reasoning logs to IPFS.
 * If PINATA_JWT is in .env, it performs a real upload.
 * Otherwise, it generates a mathematically valid CIDv1 for local verification.
 */
async function pushToIpfs(content) {
    try {
        const payload = JSON.stringify(content);
        const hash = crypto.createHash("sha256").update(payload).digest();
        
        // CIDv1 Header: 01 (version) 55 (raw codec) 12 (sha2-256) 20 (32 bytes length)
        const cidPrefix = Buffer.from([0x01, 0x55, 0x12, 0x20]);
        const cidv1Bytes = Buffer.concat([cidPrefix, hash]);
        const cid = "b" + base32Encode(cidv1Bytes);

        const pinataJwt = process.env.PINATA_JWT;
        let isRealUpload = false;

        if (pinataJwt && pinataJwt !== "your_pinata_jwt_here") {
            try {
                console.log("📤 Pinning real data to IPFS via Pinata...");
                await axios.post("https://api.pinata.cloud/pinning/pinJSONToIPFS", content, {
                    headers: {
                        Authorization: `Bearer ${pinataJwt}`,
                        "Content-Type": "application/json"
                    }
                });
                isRealUpload = true;
                console.log("✅ Data successfully pinned to IPFS!");
            } catch (pinError) {
                console.warn("⚠️ Pinata upload failed (using local CID):", pinError.message);
            }
        }

        return {
            cid,
            gatewayUrl: `https://ipfs.io/ipfs/${cid}`,
            content,
            isRealUpload,
            timestamp: new Date().toISOString()
        };
    } catch (error) {
        console.error("IPFS process failed:", error);
        return { error: error.message };
    }
}

module.exports = { pushToIpfs };
