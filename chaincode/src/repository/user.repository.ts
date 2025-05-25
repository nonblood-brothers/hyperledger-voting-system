import { User } from '../object/user.object';

import { ObjectRepository } from './object.repository';

import { Context } from 'fabric-contract-api';

export class UserRepository extends ObjectRepository {
    public async createUser(ctx: Context, user: Omit<User, 'createdAt' | 'updatedAt'>): Promise<void> {
        const currentTimestamp = ctx.stub.getTxTimestamp().seconds.toNumber()

        const newUser = User.create(
            Object.assign(
                { ...user },
                { createdAt: currentTimestamp, updatedAt: currentTimestamp }
            )
        )

        await this.saveObject(ctx, User.objectIdentifier, user.studentIdNumber, newUser)
    }

    public async updateUser(ctx: Context, studentIdNumber: string, user: Partial<User>): Promise<User | null> {
        return await this.updateObject(ctx, User.objectIdentifier, studentIdNumber, user)
    }

    public async deleteUser(ctx: Context, studentIdNumber: string): Promise<void> {
        await this.deleteObject(ctx, User.objectIdentifier, studentIdNumber)
    }

    public async getUser(ctx: Context, studentIdNumber: string): Promise<User | null> {
        return this.getObject<User>(ctx, User.objectIdentifier, studentIdNumber)
    }
}