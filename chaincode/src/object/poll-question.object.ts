import { Data } from 'dataclass';

export class PollQuestion extends Data {
    static objectIdentifier = 'poll-question';

    public id!: string;

    public pollId!: string;

    public text!: string;

    public voteCount!: number;

    public createdAt!: number;

    public updatedAt!: number;
}