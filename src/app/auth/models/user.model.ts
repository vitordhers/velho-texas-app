export class User {
    constructor(
        private localId: string,
        private _accessToken: string,
        private _refreshToken: string,
        private tokenExpiry: number
    ) { }

    get token() {
        if (!this.tokenExpiry || new Date(this.tokenExpiry) <= new Date()) {
            return null;
        }
        return this._accessToken;
    }

    get refreshToken() {
        return this._refreshToken;
    }

    get tokenDuration() {
        if (!this.token) {
            return 0;
        }
        return this.tokenExpiry - new Date().getTime();
    }

    get id() {
        return this.localId;
    }
}
