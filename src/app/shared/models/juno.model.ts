import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError } from 'rxjs/operators';

export class Card {
    public mask = {
        DEFAULT_CC: '0000  0000  0000  0000',
        DEFAULT_CVC: '000',
    };

    public type = {
        VISA: {
            name: 'visa',
            detector: /^4/,
            cardLength: 16,
            cvcLength: 3,
            maskCC: this.mask.DEFAULT_CC,
            maskCVC: this.mask.DEFAULT_CVC,
            order: 99
        },
        MASTERCARD: {
            name: 'mastercard',
            detector: /^(5[1-5]|2(2(2[1-9]|[3-9])|[3-6]|7([0-1]|20)))/,
            cardLength: 16,
            cvcLength: 3,
            maskCC: this.mask.DEFAULT_CC,
            maskCVC: this.mask.DEFAULT_CVC,
            order: 99
        },
        AMEX: {
            name: 'amex',
            detector: /^3[47]/,
            cardLength: 15,
            cvcLength: 4,
            maskCC: '0000  000000  00000',
            maskCVC: '0000',
            order: 99
        },
        DISCOVER: {
            name: 'discover',
            detector: /^6(?:011\d{12}|5\d{14}|4[4-9]\d{13}|22(?:1(?:2[6-9]|[3-9]\d)|[2-8]\d{2}|9(?:[01]\d|2[0-5]))\d{10})/,
            cardLength: 16,
            cvcLength: 3,
            maskCC: this.mask.DEFAULT_CC,
            maskCVC: this.mask.DEFAULT_CVC,
            order: 2
        },
        HIPERCARD: {
            name: 'hipercard',
            detector: /^606282|384100|384140|384160/,
            cardLength: 16,
            cvcLength: 3,
            maskCC: this.mask.DEFAULT_CC,
            maskCVC: this.mask.DEFAULT_CVC,
            order: 4
        },
        DINERS: {
            name: 'diners',
            detector: /^(300|301|302|303|304|305|36|38)/,
            cardLength: 14,
            cvcLength: 3,
            maskCC: '0000  000000  0000',
            maskCVC: this.mask.DEFAULT_CVC,
            order: 5
        },
        JCB_15: {
            name: 'jcb_15',
            detector: /^2131|1800/,
            cardLength: 15,
            cvcLength: 3,
            maskCC: this.mask.DEFAULT_CC,
            maskCVC: this.mask.DEFAULT_CVC,
            order: 6
        },
        JCB_16: {
            name: 'jcb_16',
            detector: /^35(?:2[89]|[3-8]\d)/,
            cardLength: 16,
            cvcLength: 3,
            maskCC: this.mask.DEFAULT_CC,
            maskCVC: this.mask.DEFAULT_CVC,
            order: 7
        },
        ELO: {
            name: 'elo',
            // tslint:disable-next-line: max-line-length
            detector: /^(4011(78|79)|43(1274|8935)|45(1416|7393|763(1|2))|50(4175|6699|67([0-6][0-9]|7[0-8])|9\d{3})|627780|63(6297|6368)|650(03([^4])|04([0-9])|05(0|1)|4(0[5-9]|(1|2|3)[0-9]|8[5-9]|9[0-9])|5((3|9)[0-8]|4[1-9]|([0-2]|[5-8])\d)|7(0\d|1[0-8]|2[0-7])|9(0[1-9]|[1-6][0-9]|7[0-8]))|6516(5[2-9]|[6-7]\d)|6550(2[1-9]|5[0-8]|(0|1|3|4)\d))\d*/,
            cardLength: 16,
            cvcLength: 3,
            maskCC: this.mask.DEFAULT_CC,
            maskCVC: this.mask.DEFAULT_CVC,
            order: 1
        },
        AURA: {
            name: 'aura',
            detector: /^((?!5066|5067|50900|504175|506699)50)/,
            cardLength: 19,
            cvcLength: 3,
            maskCC: '0000000000000000000',
            maskCVC: this.mask.DEFAULT_CVC,
            order: 3
        }
    };

    getType(value) {
        const cardNo = value.replace(/ /g, '');
        for (let key in this.getOrderedTypes()) {
            if (this.number(cardNo, this.type[key])) {
                return this.type[key];
            }
        }
        return false;
    }

    getOrderedTypes() {
        const types = {};
        let order = 1;
        while (order < 100) {
            for (const key in this.type) {
                if (this.type[key].order === order) {
                    types[key] = this.type[key];
                }
            }
            order++;
        }
        return types;
    }

    validateNumber(value) {
        const cardNo = value.replace(/ /g, '');
        const type = this.getType(cardNo);
        return type && type.cardLength === cardNo.length && this.luhn(cardNo);
    }

    validateCvc(cardNo, cvcNo) {
        cardNo = cardNo.replace(/ /g, '');
        const type = this.getType(cardNo);
        return type && this.cvc(cvcNo, type);
    }

    validateExpireDate(expirationMonth: number, expirationYear: number) {
        const today = new Date();
        const month = today.getMonth() + 1;
        const year = today.getFullYear();

        if (expirationMonth > 0 && expirationYear > 0 && expirationYear >= year) {
            if (expirationYear === year) {
                return (expirationMonth > month);
            }
            return true;
        }
        return false;
    }

    number(cardNo, type) {
        return type.detector.test(cardNo);
    }

    luhn(cardNo) {
        let numberProduct, checkSumTotal = 0;
        for (let digitCounter = cardNo.length - 1; digitCounter >= 0; digitCounter = digitCounter - 2) {
            checkSumTotal += parseInt(cardNo.charAt(digitCounter), 10);
            numberProduct = String((cardNo.charAt(digitCounter - 1) * 2));
            for (let productDigitCounter = 0; productDigitCounter < numberProduct.length; productDigitCounter++) {
                checkSumTotal += parseInt(numberProduct.charAt(productDigitCounter), 10);
            }
        }
        return (checkSumTotal % 10 === 0);
    }

    cvc(cvcNo, type) {
        return type.cvcLength === ('' + cvcNo).length;
    }
}


export class TextEncoder {
    encode(e) {
        // let f = e.length;
        // let b = -1;
        // let a;
        // if ('undefined' === typeof Uint8Array) {
        //     a = Array(1.5 * f);
        // } else {
        //     a = new Uint8Array(3 * f)
        // }
        // let c = 0;
        // let g = 0;
        // let d = 0;
        for (var f = e.length, b = -1, a = 'undefined' === typeof Uint8Array ? Array(1.5 * f) : new Uint8Array(3 * f)
            , c, g, d = 0; d !== f;) {
            c = e.charCodeAt(d);
            d += 1;
            if (55296 <= c && 56319 >= c) {
                if (d === f) {
                    a[b += 1] = 239;
                    a[b += 1] = 191;
                    a[b += 1] = 189;
                    break;
                }
                g = e.charCodeAt(d);
                if (56320 <= g && 57343 >= g) {
                    // tslint:disable-next-line: no-conditional-assignment
                    if (c = 1024 * (c - 55296) + g - 56320 + 65536, d += 1, 65535 < c) {
                        // tslint:disable-next-line: no-bitwise
                        a[b += 1] = 240 | c >>> 18;
                        // tslint:disable-next-line: no-bitwise
                        a[b += 1] = 128 | c >>> 12 & 63;
                        // tslint:disable-next-line: no-bitwise
                        a[b += 1] = 128 | c >>> 6 & 63;
                        // tslint:disable-next-line: no-bitwise
                        a[b += 1] = 128 | c & 63;
                        continue;
                    }
                } else {
                    a[b += 1] = 239;
                    a[b += 1] = 191;
                    a[b += 1] = 189;
                    continue;
                }
            }
            // tslint:disable-next-line: no-bitwise
            127 >= c ? a[b += 1] = 0 | c : (2047 >= c ? a[b += 1] = 192 |
                // tslint:disable-next-line: no-bitwise
                c >>> 6 : (a[b += 1] = 224 | c >>> 12, a[b += 1] = 128 |
                    // tslint:disable-next-line: no-bitwise
                    c >>> 6 & 63), a[b += 1] = 128 | c & 63);
        }
        if ('undefined' !== typeof Uint8Array && a instanceof Uint8Array) {
            return a.subarray(0, b + 1);
        }
        // a.length = b + 1;
        return a;
    }

    toString() {
        return '[object TextEncoder]';
    }

    enconding() {
        return 'utf-8';
    }
    constructor(a) {
        // undefined !== typeof Symbol &&
        //     (TextEncoder.prototype[Symbol.toStringTag] = "TextEncoder");

    }

}

export class Crypto {
    private chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    private lookup = new Uint8Array(256);
    constructor() {
        this.initB64();
    }

    encrypt(pemPublicKey: string, stringData) {
        return this.importPublicKey(pemPublicKey).then((publicKey: CryptoKey) => {
            return new Promise((resolve, reject) => {
                const data = this.stringToArrayBuffer(stringData);
                window.crypto.subtle.encrypt({
                    name: 'RSA-OAEP',
                }, publicKey, data).then((encrypted) => {
                    const encoded = this.encodeAb(encrypted);
                    resolve(encoded);
                });
            }).catch((err) => {
                console.log(err);
            });
        });
    }

    importPublicKey(pemPublicKey) {
        return new Promise((resolve, reject) => {
            window.crypto.subtle.importKey('spki', this.pemToArrayBuffer(pemPublicKey), {
                name: 'RSA-OAEP',
                hash: {
                    name: 'SHA-256'
                }
            }, false, ['encrypt']).then((importedKey) => {
                resolve(importedKey);
            });
        }).catch((err) => {
            console.log(err);
        });
    }

    initB64() {
        for (let i = 0; i < this.chars.length; i++) {
            this.lookup[this.chars.charCodeAt(i)] = i;
        }
    }

    removeLines(str: string) {
        return str.replace('\n', '');
    }
    base64ToArrayBuffer(b64: string) {
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
        const encoder = new TextEncoder('utf-8');
        const byteArray = encoder.encode(str);
        if (byteArray instanceof Uint8Array) {
            return byteArray.buffer;
        }
    }

    encodeAb(arrayBuffer: ArrayBuffer) {
        const bytes = new Uint8Array(arrayBuffer), len = bytes.length;
        let base64 = '';
        for (let i = 0; i < len; i += 3) {
            // tslint:disable-next-line: no-bitwise
            base64 += this.chars[bytes[i] >> 2];
            // tslint:disable-next-line: no-bitwise
            base64 += this.chars[((bytes[i] & 3) << 4) | (bytes[i + 1] >> 4)];
            // tslint:disable-next-line: no-bitwise
            base64 += this.chars[((bytes[i + 1] & 15) << 2) | (bytes[i + 2] >> 6)];
            // tslint:disable-next-line: no-bitwise
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

export class DirectCheckout {
    // tslint:disable-next-line: variable-name
    private _version = '0.0.2';
    // tslint:disable-next-line: variable-name
    private _url = 'https://' + (this.prod ? 'www' : 'sandbox') + '.boletobancario.com/boletofacil/integration/api/';
    // tslint:disable-next-line: variable-name
    private _publicKey = null;
    // tslint:disable-next-line: variable-name
    private _countAwaitingPublicKey = 0;
    // tslint:disable-next-line: variable-name
    private _crypto = new Crypto();
    // tslint:disable-next-line: variable-name
    private _card = new Card();
    // tslint:disable-next-line: variable-name
    constructor(private _publicToken: string, private prod = true, private http: HttpClient) {

    }

    getCardType(cardNumber: string) {
        return (this.isValidCardNumber(cardNumber)) ? this._card.getType(cardNumber).name : false;
    }

    isValidCardNumber(cardNumber: string) {
        return this._card.validateNumber(cardNumber);
    }

    isValidSecurityCode(cardNumber: string, securityCode: string) {
        return this._card.validateCvc(cardNumber, securityCode);
    }

    isValidExpireDate(expirationMonth, expirationYear) {
        return this._card.validateExpireDate(expirationMonth, expirationYear);
    }

    isValidCardData(cardData, error: (n: Error) => void) {
        if (!this._publicKey) {
            error(Error('Invalid public key'));
            return false;
        }

        if (!cardData) {
            error(Error('Invalid card data'));
            return false;
        }
        if (!cardData.holderName || cardData.holderName === '') {
            error(Error('Invalid holder name'));
            return false;
        }
        if (!this.isValidCardNumber(cardData.cardNumber)) {
            error(Error('Invalid card number'));
            return false;
        }
        if (!this.isValidSecurityCode(cardData.cardNumber, cardData.securityCode)) {
            error(Error('Invalid security code'));
            return false;
        }
        if (!this.isValidExpireDate(cardData.expirationMonth, cardData.expirationYear)) {
            error(Error('Invalid expire date'));
            return false;
        }
        return true;
    }

    getCardHash(cardData, success, error) {
        this._checkPublicKey(() => {
            if (this.isValidCardData(cardData, error)) {
                this._internalGetCardHash(cardData).then((cardHash) => {
                    success(cardHash);
                }, (e) => {
                    error(e);
                });
            }
        });
    }

    private _internalGetCardHash(cardData) {
        return new Promise((resolve, reject) => {
            cardData = JSON.stringify(cardData);
            this._crypto.encrypt(this._publicKey, cardData).then((encoded: string) => {
                const url = this._url + 'get-credit-card-hash.json';
                let params = 'publicToken=' + this._publicToken;
                // params += '&encryptedData=' + window.encodeURIComponent(encoded);
                this._ajax('POST', url, params).then((response: { success?: 'string', errorMessage?: 'string', data?: 'string' }) => {
                    // response = JSON.parse(response)
                    if (response.success) {
                        resolve(response.data);
                    } else {
                        reject(Error(response.errorMessage));
                    }
                }, (error) => {
                    reject(Error('Error on retrieve public key: ' + error));
                });
            }, (error) => {
                reject(Error('Error on encrypt data: ' + error));
            });
        });
    }

    private _loadPublicKey() {
        const url = this._url + 'get-public-encryption-key.json';
        const params = 'publicToken=' + this._publicToken + '&version=' + this._version;;
        this._ajax('POST', url, params).then((response: { success?: 'string', errorMessage?: 'string', data?: 'string' }) => {
            // response = JSON.parse(response);
            if (response.success) {
                this._publicKey = response.data;
            } else {
                throw Error(response.errorMessage);
            }
        }, (error) => {
            throw Error('Error on retrieve public key');
        });
    }

    private _ajax(type, url, params) {
        return new Promise((resolve, reject) => {
            const headers = new HttpHeaders({
                'Content-type': 'application/x-www-form-urlencoded'
            });
            const req = this.http.post<{ success?: 'string', errorMessage?: 'string', data?: 'string' }>(url, params, { headers });
            console.log(req);
            return req;
            // const req = new XMLHttpRequest();
            // req.open(type, url);
            // req.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
            // req.onload = () => {
            //     if (req.status === 200) {
            //         resolve(req.response);
            //     } else {
            //         reject(Error(req.statusText));
            //     }
            // };
            // req.onerror = () => {
            //     reject(Error('Network Error'));
            // };
            // req.send(params);
        });
    }
    private _checkPublicKey(callback) {
        if (!this._publicKey && this._countAwaitingPublicKey < 100) {
            setTimeout(function () {
                this._countAwaitingPublicKey++;
                this._checkPublicKey(callback);
            }.bind(this), 100);
        } else {
            callback();
        }
    }
}
