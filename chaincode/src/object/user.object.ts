
import { UserRole } from '../enum/user-role.enum';

import { KycApplicationStatus } from '../enum/kyc-application-statuc.enum';

import { Data } from 'dataclass'

export class User extends Data {
    static objectIdentifier = 'user';

    public studentIdNumber!: string;

    public firstName!: string;

    public lastName!: string;

    public passwordHash!: string;

    public secretKeyHash!: string;

    public kycStatus!: KycApplicationStatus;

    public role!: UserRole;

    public createdAt!: number;

    public updatedAt!: number;
}