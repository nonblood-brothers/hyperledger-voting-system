import { Poll } from '../object/poll.object';
import { PollStatus } from '../enum/poll-status.enum';

import { ObjectRepository } from './object.repository';

import { Context } from 'fabric-contract-api';

export class PollRepository extends ObjectRepository {
    public async createPoll(ctx: Context, poll: Omit<Poll, 'createdAt' | 'updatedAt'>): Promise<void> {
        const currentTimestamp = ctx.stub.getTxTimestamp().seconds.toNumber()

        await this.saveObject(ctx, Poll.objectIdentifier, poll.id,
            Poll.create(
                Object.assign(new Poll(), poll, { createdAt: currentTimestamp, updatedAt: currentTimestamp })
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

    public async updatePoll(ctx: Context, id: string, poll: Partial<Omit<Poll, 'createdAt' | 'updatedAt'>>): Promise<Poll | null> {
        return await this.updateObject<Poll>(ctx, Poll.objectIdentifier, id, { ...poll, updatedAt: ctx.stub.getTxTimestamp().seconds.toNumber() })
    }

    public async getPollById(ctx: Context, id: string): Promise<Poll | null> {
        return await this.getObject<Poll>(ctx, Poll.objectIdentifier, id)
    }
}