import { KycApplicationStatus } from '../enum/kyc-application-statuc.enum';

import { Data } from 'dataclass';

export class KYCApplication extends Data {
    static objectIdentifier = 'kyc-application';

    public id!: string;

    public userId!: string;

    public status!: KycApplicationStatus;

    public createdAt!: number;

    public updatedAt!: number;
}