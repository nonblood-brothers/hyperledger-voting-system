import { UserKycStatus } from '../enum/user-kyc-status.enum';

import { Object, Property } from 'fabric-contract-api';

@Object()
export class User {
    static objectIdentifier = 'user';

    @Property()
    public username!: string;

    @Property()
    public passwordHash!: string;

    @Property()
    public secretKeyHash!: string;

    @Property()
    public kycStatus!: UserKycStatus;

    @Property()
    public createdAt!: Date;

    @Property()
    public updatedAt!: Date;
}