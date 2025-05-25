import { Poll } from '../object/poll.object';
import { PollStatus } from '../enum/poll-status.enum';

import { ObjectRepository } from './object.repository';

import { Context } from 'fabric-contract-api';

export class PollRepository extends ObjectRepository {
    public async createPoll(ctx: Context, poll: Omit<Poll, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> {
        const currentTimestamp = ctx.stub.getTxTimestamp().seconds.toNumber()
        const id = await this.incrementAndGetNextSequenceId(ctx, Poll.objectIdentifier)

        await this.saveObject(ctx, Poll.objectIdentifier, id.toString(),
            Poll.create(
                Object.assign({ ...poll }, { id: id.toString(), createdAt: currentTimestamp, updatedAt: currentTimestamp })
            )
        )
    }

    public async getPollsByStatus(ctx: Context, status: PollStatus): Promise<Poll[]> {
        const iterator = this.getAllObjectsIterator(ctx, Poll.objectIdentifier)
        const result: Poll[] = []

        for await (const iteratorElement of iterator) {
            if ((iteratorElement.value as Poll | undefined)?.status === status) {
                result.push(iteratorElement.value as Poll)
            }
        }

        return result
    }

    public async getPollsByCreatorAndStatus(ctx: Context, creatorId: string, status: PollStatus | PollStatus[]): Promise<Poll[]> {
        const iterator = this.getAllObjectsIterator(ctx, Poll.objectIdentifier)
        const result: Poll[] = []
        const statuses = Array.isArray(status) ? status : [status];

        for await (const iteratorElement of iterator) {
            const poll = iteratorElement.value as Poll | undefined;
            if (poll && statuses.includes(poll.status) && poll.authorStudentIdNumber === creatorId) {
                result.push(poll)
            }
        }

        return result
    }

    public async updatePoll(ctx: Context, id: string, poll: Partial<Omit<Poll, 'createdAt' | 'updatedAt'>>): Promise<Poll | null> {
        return await this.updateObject<Poll>(ctx, Poll.objectIdentifier, id, { ...poll, updatedAt: ctx.stub.getTxTimestamp().seconds.toNumber() })
    }

    public async getPollById(ctx: Context, id: string): Promise<Poll | null> {
        const result = await this.getObject<Poll>(ctx, Poll.objectIdentifier, id)

        return result ? Poll.create(result) : null
    }
}
