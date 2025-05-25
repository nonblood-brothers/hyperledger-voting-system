import { PollOption } from '../object/poll-option.object';

import { ObjectRepository } from './object.repository';

import { Context } from 'fabric-contract-api';

export class PollOptionRepository extends ObjectRepository {
    public async createPollOption(ctx: Context, pollId: string, text: string): Promise<PollOption> {
        const currentTimestamp = ctx.stub.getTxTimestamp().seconds.toNumber()

        const pollOption = PollOption.create({
            id: await this.incrementAndGetNextSequenceId(ctx, PollOption.objectIdentifier).then(String),
            pollId,
            voteCount: 0,
            text,
            createdAt: currentTimestamp,
            updatedAt: currentTimestamp,
        })

        await this.saveObject(ctx, PollOption.objectIdentifier, pollOption.id, pollOption)

        return pollOption
    }

    public async deletePollOption(ctx: Context, optionId: string): Promise<void> {
        await this.deleteObject(ctx, PollOption.objectIdentifier, optionId)
    }

    public async incrementVoteCount(ctx: Context, optionId: string): Promise<PollOption | null> {
        const pollOption = await this.getObject<PollOption>(ctx, PollOption.objectIdentifier, optionId)
        if (!pollOption) return null

        return await this.updateObject<PollOption>(ctx, PollOption.objectIdentifier, optionId, { 
            voteCount: pollOption.voteCount + 1,
            updatedAt: ctx.stub.getTxTimestamp().seconds.toNumber()
        })
    }

    public async getPollOptionById(ctx: Context, optionId: string): Promise<PollOption | null> {
        return await this.getObject<PollOption>(ctx, PollOption.objectIdentifier, optionId)
    }
}