import { User } from './user';

import { Context, Contract, Info, Returns, Transaction } from 'fabric-contract-api';
import sortKeysRecursive from 'sort-keys-recursive';

@Info({ title: 'VotingSystem', description: 'Smart contract for voting system' })
export class VotingSystemContract extends Contract {
    @Transaction(false)
    @Returns('string')
    public async GetExistingUser(ctx: Context, username: string): Promise<string> {
        const user = await ctx.stub.getState(`user:${username}`)
        if (user.length === 0) throw new Error(`User ${username} does not exist`)

        return user.toString()
    }

    @Transaction()
    public async RegisterUser(ctx: Context, username: string, passwordHash: string, secretKeyHash: string): Promise<void> {
        const user = await ctx.stub.getState(`user:${username}`)
        if (user.length > 0) throw new Error(`User ${username} already exists`)

        await ctx.stub.putState(`user:${username}`, Buffer.from(JSON.stringify(sortKeysRecursive({ username, passwordHash, secretKeyHash } satisfies User))))
    }

    @Transaction(false)
    @Returns('string')
    public IsAuthenticated(ctx: Context, currentUsername: string): string {
        if (currentUsername.length > 0) return JSON.stringify({ authenticated: true, username: currentUsername })

        throw new Error('User is not authenticated')
    }
}