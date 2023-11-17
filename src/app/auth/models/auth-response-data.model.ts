import { Credentials } from './credentials.model';

export class AuthResponseData {
    credentials: Credentials;
    notifications: {
        new: number;
    };
}
