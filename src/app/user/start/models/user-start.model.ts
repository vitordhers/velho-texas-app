import { UserStatus } from '../../../shared/enums/user-status.enum';
import { Address } from '../../address/models/address.model';

export interface UserStart {
    name: string;
    status: UserStatus;
    _id?: string;
    email?: string;
    password?: boolean;
    googleUserId?: string;
    facebookUserId?: string;
    birthday?: Date;
    celphoneNumber?: string;
    whatsapp?: boolean;
    communication?: { mailcomm: boolean, wppcomm: boolean };
    addresses?: [Address];
}
