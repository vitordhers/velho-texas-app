export class Credentials {
    constructor(
        public localId: string,
        public expiresIn: number,
        public accessToken: string,
        public refreshToken?: string
    ) {

    }

}
