import { PollQuestion } from '../object/poll-question.object';

import { ObjectRepository } from './object.repository';

import { Context } from 'fabric-contract-api';

export class PollQuestionRepository extends ObjectRepository {
    public async createPollQuestion(ctx: Context, pollId: string, text: string): Promise<PollQuestion> {
        const currentTimestamp = ctx.stub.getTxTimestamp().seconds.toNumber()

        const pollQuestion = PollQuestion.create({
            id: await this.incrementAndGetNextSequenceId(ctx, PollQuestion.objectIdentifier).then(String),
            pollId,
            voteCount: 0,
            text,
            createdAt: currentTimestamp,
            updatedAt: currentTimestamp,
        })

        await this.saveObject(ctx, PollQuestion.objectIdentifier, pollQuestion.id, pollQuestion)

        return pollQuestion
    }

    public async deletePollQuestion(ctx: Context, questionId: string): Promise<void> {
        await this.deleteObject(ctx, PollQuestion.objectIdentifier, questionId)
    }
}