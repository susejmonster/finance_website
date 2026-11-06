import crypto from 'node:crypto';
import 'dotenv/config';

const ALGORITHM = 'aes-256-gcm';
// Ensure ENCRYPTION_KEY is a 32-byte string stored in your .env file
const keyString = process.env.ENCRYPTION_KEY;

if (!keyString) {
  throw new Error("ENCRYPTION_KEY is undefined. Check your environment variables.");
}

const KEY = Buffer.from(keyString, 'hex');


function decryptMiddleware(req, res, next) {
  // Skip if request has no encrypted payload
  if (!req.body || !req.body.encryptedData || !req.body.iv || !req.body.tag) {
    return next();
  }

  try {
    const decipher = crypto.createDecipheriv(
      ALGORITHM,
      KEY,
      Buffer.from(req.body.iv, 'hex')
    );
    decipher.setAuthTag(Buffer.from(req.body.tag, 'hex'));

    let decrypted = decipher.update(req.body.encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    req.body = JSON.parse(decrypted); // Replace body with decrypted data
    console.log(req.body)
    next();
  } catch (err) {
    return res.status(400).json({ error: 'Decryption failed. Invalid payload or key.' });
  }
}


export default decryptMiddleware;