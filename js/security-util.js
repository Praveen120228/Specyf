// security-util.js
class SecurityUtil {
    // Encryption key (in a real-world scenario, this would be more securely managed)
    static #SECRET_KEY = 'specyf_secure_encryption_2023!';

    // Simple base64 encryption with XOR obfuscation
    static encrypt(data) {
        if (data === null || data === undefined) return '';
        
        const dataString = JSON.stringify(data);
        let result = '';
        
        for (let i = 0; i < dataString.length; i++) {
            const charCode = dataString.charCodeAt(i);
            const keyChar = this.#SECRET_KEY.charCodeAt(i % this.#SECRET_KEY.length);
            const encryptedChar = charCode ^ keyChar;
            result += String.fromCharCode(encryptedChar);
        }
        
        return btoa(result);
    }

    // Decryption method corresponding to the encryption
    static decrypt(encryptedData) {
        if (!encryptedData) return null;
        
        try {
            const decoded = atob(encryptedData);
            let result = '';
            
            for (let i = 0; i < decoded.length; i++) {
                const charCode = decoded.charCodeAt(i);
                const keyChar = this.#SECRET_KEY.charCodeAt(i % this.#SECRET_KEY.length);
                const decryptedChar = charCode ^ keyChar;
                result += String.fromCharCode(decryptedChar);
            }
            
            return JSON.parse(result);
        } catch (error) {
            console.error('Decryption failed:', error);
            return null;
        }
    }

    // Browser-compatible password hashing using SHA-256
    static async hashPassword(password) {
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        
        return hashHex;
    }

    // Validate password strength
    static validatePasswordStrength(password) {
        // At least 8 characters, one uppercase, one lowercase, a number, and a special character
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&])[a-zA-Z\d@$!%*#?&]{8,}$/;
        return passwordRegex.test(password);
    }

    // Generate a secure random token
    static generateToken(length = 32) {
        const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
        let token = '';
        const randomValues = new Uint32Array(length);
        crypto.getRandomValues(randomValues);
        
        for (let i = 0; i < length; i++) {
            const randomIndex = randomValues[i] % charset.length;
            token += charset[randomIndex];
        }
        
        return token;
    }
}

export { SecurityUtil };
