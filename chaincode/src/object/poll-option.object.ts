import { Data } from 'dataclass';

export class PollOption extends Data {
    static objectIdentifier = 'poll-option';

    public id!: string;

    public pollId!: string;

    public text!: string;

    public voteCount!: number;

    public createdAt!: number;

    public updatedAt!: number;
}