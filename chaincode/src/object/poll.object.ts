import { PollStatus } from '../enum/poll-status.enum';

import { Data } from 'dataclass';

export class Poll extends Data {
    static objectIdentifier = 'poll';

    public id!: string;

    public title!: string;

    public description!: string;

    public authorStudentIdNumber!: string;

    public optionIds!: string[];

    public participantIds!: string[];

    public plannedStartDate!: number | null;

    public plannedEndDate!: number | null;

    public status!: PollStatus;

    public createdAt!: number;

    public updatedAt!: number;
}