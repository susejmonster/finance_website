import crypto from 'crypto';
import jwt from 'jsonwebtoken';
const SECRET_KEY = process.env.JWT_SECRET || 'your_super_secret_key';

class TokenManager {
    constructor() {
        this.existing = ["123469", "123468", "9"];
        this.existing.sort((a, b) => Number(a) - Number(b));
        
        this.algorithm = 'aes-256-cbc';
        // Note: In production, store these keys in .env so they persist across server restarts
        this.secretKey = crypto.randomBytes(32); 
        this.iv = crypto.randomBytes(16);        
    }

    
  
    Find(token) {
        let l = 0;
        let r = this.existing.length - 1;
        let targetNum = Number(token); 
        
        while (l <= r) {
            let mid = Math.floor((l + r) / 2);
            let midNum = Number(this.existing[mid]); 

            if (midNum < targetNum) {
                l = mid + 1;
            } else if (midNum > targetNum) {
                r = mid - 1;
            } else {
                return true;
            }
        }
        return false;
    }
    Validate(str) {
        let valid = false;
        if (!str || !str.Token) return false;
        valid = this.Find(str.Token)
        return valid;
    }
    encryptData(text) {
        const cipher = crypto.createCipheriv(this.algorithm, this.secretKey, this.iv);
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        
        return {
            iv: this.iv.toString('hex'),
            encryptedData: encrypted
        };
    }

    decryptData(encryptedObject) {
        const decipher = crypto.createDecipheriv(
            this.algorithm, 
            this.secretKey, 
            Buffer.from(encryptedObject.iv, 'hex')
        );
        let decrypted = decipher.update(encryptedObject.encryptedData, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    }

    ValidateToken = async(req,res,next) => {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; 

        if (!token) {
            return res.status(401).json({ error: 'Access denied, token missing' });
        }

        try {
            const verified = jwt.verify(token, SECRET_KEY);
            req.user = verified; 
            next();
        } catch (error) {
            res.status(403).json({ error: 'Invalid or expired token' });
        }
    }

    AssignToken  = async(req,res)=>{
            const payload = { user: req.body.name || 'user' };
            const token = jwt.sign(payload, SECRET_KEY, { expiresIn: '1h' });
            res.json({ NEW_TOKEN: token });
    }
}

const manager = new TokenManager();
let res = {"Token":"9","name":"John Doe","text":"hi how are you","message":"I need vactions"};
console.log(manager.Validate(res)); 
export default TokenManager;