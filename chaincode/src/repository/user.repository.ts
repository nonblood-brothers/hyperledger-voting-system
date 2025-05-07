import { User } from '../object/user.object';

import { ObjectRepository } from './object.repository';

import { Context } from 'fabric-contract-api';

export class UserRepository extends ObjectRepository {
    public async saveUser(ctx: Context, username: string, user: User): Promise<void> {
        await this.saveObject(ctx, User.objectIdentifier, username, user)
    }

    public async deleteUser(ctx: Context, username: string): Promise<void> {
        await this.deleteObject(ctx, User.objectIdentifier, username)
    }

    public async getUser(ctx: Context, username: string): Promise<User | null> {
        return this.getObject(ctx, User.objectIdentifier, username)
    }
}