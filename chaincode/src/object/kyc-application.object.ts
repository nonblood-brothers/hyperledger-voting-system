import { KycApplicationStatus } from '../enum/kyc-application-statuc.enum';

import { Object, Property } from 'fabric-contract-api';


@Object()
export class KYCApplication {
    static objectIdentifier = 'kyc-application';

    @Property()
    public userId!: string;

    @Property()
    public status!: KycApplicationStatus;

    @Property()
    public createdAt!: Date;

    @Property()
    public updatedAt!: Date;
}