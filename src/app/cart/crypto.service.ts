import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})

export class CryptoService {
    chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    lookup = new Uint8Array(256);

    constructor() {
        this.initB64();
    }

    async encrypt(pemPublicKey: string, stringData: string): Promise<string> {
        let publicKey;
        try {
            publicKey = await this.importPublicKey(pemPublicKey);
        } catch (e) {
            console.error(e);
        }

        const data = this.stringToArrayBuffer(stringData);

        const encrypted = await window.crypto.subtle.encrypt(
            {
                name: 'RSA-OAEP',
            },
            publicKey,
            data
        );
        const encoded = this.encodeAb(encrypted);
        return encoded;
    }

    async importPublicKey(pemPublicKey): Promise<CryptoKey> {
        const importedKey = await window.crypto.subtle.importKey('spki', this.pemToArrayBuffer(pemPublicKey), {
            name: 'RSA-OAEP',
            hash: {
                name: 'SHA-256'
            }
        }, false, ['encrypt']);
        return importedKey;
    }

    initB64() {
        for (let i = 0; i < this.chars.length; i++) {
            this.lookup[this.chars.charCodeAt(i)] = i;
        }
    }

    removeLines(str: string) {
        return str.replace('\n', '');
    }

    base64ToArrayBuffer(b64) {
        const byteString = window.atob(b64);
        const byteArray = new Uint8Array(byteString.length);
        for (let i = 0; i < byteString.length; i++) {
            byteArray[i] = byteString.charCodeAt(i);
        }
        return byteArray;
    }

    pemToArrayBuffer(pem: string) {
        const b64Lines = this.removeLines(pem);
        const b64Prefix = b64Lines.replace('-----BEGIN PUBLIC KEY-----', '');
        const b64Final = b64Prefix.replace('-----END PUBLIC KEY-----', '');
        return this.base64ToArrayBuffer(b64Final);
    }

    stringToArrayBuffer(str: string) {
        const encoder = new TextEncoder();
        const byteArray = encoder.encode(str);
        return byteArray.buffer;
    }

    encodeAb(arrayBuffer) {
        const bytes = new Uint8Array(arrayBuffer);
        const len = bytes.length;
        let base64 = '';
        for (let i = 0; i < len; i += 3) {
            base64 += this.chars[bytes[i] >> 2];
            base64 += this.chars[((bytes[i] & 3) << 4) | (bytes[i + 1] >> 4)];
            base64 += this.chars[((bytes[i + 1] & 15) << 2) | (bytes[i + 2] >> 6)];
            base64 += this.chars[bytes[i + 2] & 63];
        }
        if ((len % 3) === 2) {
            base64 = base64.substring(0, base64.length - 1) + '=';
        } else if (len % 3 === 1) {
            base64 = base64.substring(0, base64.length - 2) + '==';
        }
        return base64;
    }
}
