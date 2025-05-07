import { User } from './object/user.object';
import { UserKycStatus } from './enum/user-kyc-status.enum';
import { UserRepository } from './repository/user.repository';

import { Context, Contract, Info, Returns, Transaction } from 'fabric-contract-api';

@Info({ title: 'VotingSystem', description: 'Smart contract for voting system' })
export class VotingSystemContract extends Contract {
    private userRepository: UserRepository;

    constructor() {
        super()
        this.userRepository = new UserRepository()
    }

    @Transaction(false)
    @Returns('string')
    public async GetExistingUser(ctx: Context, username: string): Promise<string> {
        const user = await this.userRepository.getUser(ctx, username)
        if (user) throw new Error(`User ${username} does not exist`)

        return JSON.stringify(user)
    }

    @Transaction()
    public async RegisterUser(ctx: Context, username: string, passwordHash: string, secretKeyHash: string): Promise<void> {
        const user = await this.userRepository.getUser(ctx, username)
        if (user) throw new Error(`User ${username} already exists`)

        const newUser = { username, passwordHash, secretKeyHash, kycStatus: UserKycStatus.PENDING, createdAt: new Date(), updatedAt: new Date() } satisfies User
        await this.userRepository.saveUser(ctx, username, newUser)
    }

    @Transaction(false)
    @Returns('string')
    public IsAuthenticated(ctx: Context, currentUsername: string): string {
        if (currentUsername.length > 0) return JSON.stringify({ authenticated: true, username: currentUsername })

        throw new Error('User is not authenticated')
    }
}