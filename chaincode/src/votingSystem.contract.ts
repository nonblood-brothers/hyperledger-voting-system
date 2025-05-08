import { User } from './object/user.object';
import { UserRepository } from './repository/user.repository';

import { KycApplicationRepository } from './repository/kyc-application.repository';

import { KYCApplication } from './object/kyc-application.object';

import { KycApplicationStatus } from './enum/kyc-application-statuc.enum';

import { ProtectedMethod } from './decorator/protected-method.decorator';

import { UserRole } from './enum/user-role.enum';

import { Context, Contract, Info, Returns, Transaction } from 'fabric-contract-api';

@Info({ title: 'VotingSystem', description: 'Smart contract for voting system' })
export class VotingSystemContract extends Contract {
    private userRepository: UserRepository;
    private kycApplicationRepository: KycApplicationRepository;

    constructor() {
        super()
        this.userRepository = new UserRepository()
        this.kycApplicationRepository = new KycApplicationRepository()
    }

    @Transaction()
    public async InitLedger(ctx: Context): Promise<void> {
        const admin = User.create({ firstName: 'Admin', lastName: 'Admin', studentIdNumber: 'admin', passwordHash: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', secretKeyHash: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', kycStatus: KycApplicationStatus.APPROVED, role: UserRole.ADMIN })
        await this.userRepository.createUser(ctx, admin)
    }

    @Transaction(false)
    @Returns('string')
    public async GetExistingUser(ctx: Context, studentIdNumber: string): Promise<string> {
        const user = await this.userRepository.getUser(ctx, studentIdNumber)
        if (!user) throw new Error(`User with student id ${studentIdNumber} does not exist`)

        return JSON.stringify(user)
    }

    @Transaction()
    public async RegisterUser(ctx: Context, firstName: string, lastName: string, studentIdNumber: string, passwordHash: string, secretKeyHash: string): Promise<void> {
        const user = await this.userRepository.getUser(ctx, studentIdNumber)
        if (user) throw new Error(`User with student ID ${studentIdNumber} already exists`)

        const newUser = User.create({ firstName, lastName, studentIdNumber, passwordHash, secretKeyHash, kycStatus: KycApplicationStatus.PENDING })
        const newKycApplication = KYCApplication.create({ userId: studentIdNumber, status: KycApplicationStatus.PENDING })

        await this.userRepository.createUser(ctx, newUser)
        await this.kycApplicationRepository.createKycApplication(ctx, newKycApplication)
    }

    @Transaction()
    @ProtectedMethod({ roles: [UserRole.ADMIN] })
    @Returns('string')
    public async GetKycApplicationListByStatus(ctx: Context, studentIdNumber: string, status: KycApplicationStatus): Promise<string> {
        const data = await this.kycApplicationRepository.getKycApplicationsByStatus(ctx, status)

        return JSON.stringify({ currentStudentId: studentIdNumber, data })
    }

    @Transaction()
    @ProtectedMethod({ roles: [UserRole.ADMIN] })
    public async UpdateKycApplicationStatus(ctx: Context, studentIdNumber: string, kycApplicationId: string, status: KycApplicationStatus): Promise<void> {
        const kycApplication = await this.kycApplicationRepository.updateKycApplication(ctx, kycApplicationId, { status })
        await this.userRepository.updateUser(ctx, kycApplication.userId, { kycStatus: status })
    }

    @Transaction()
    @ProtectedMethod({ kycVerification: true })
    public IsKycVerified(ctx: Context, studentIdNumber: string): string {
        return JSON.stringify({ kycVerified: true, studentIdNumber })
    }

    @Transaction()
    @ProtectedMethod()
    @Returns('string')
    public IsAuthenticated(ctx: Context, studentIdNumber: string): string {
        return JSON.stringify({ authenticated: true, studentIdNumber })
    }
}