import { User } from './object/user.object';
import { UserRepository } from './repository/user.repository';
import { KycApplicationRepository } from './repository/kyc-application.repository';
import { KYCApplication } from './object/kyc-application.object';
import { KycApplicationStatus } from './enum/kyc-application-status.enum';
import { ProtectedMethod } from './decorator/protected-method.decorator';
import { UserRole } from './enum/user-role.enum';
import { Poll } from './object/poll.object';
import { PollStatus } from './enum/poll-status.enum';
import { PollRepository } from './repository/poll.repository';
import { PollQuestionRepository } from './repository/poll-question.repository';

import { Context, Contract, Info, Returns, Transaction } from 'fabric-contract-api';

@Info({ title: 'VotingSystem', description: 'Smart contract for voting system' })
export class VotingSystemContract extends Contract {
    private userRepository: UserRepository;
    private pollRepository: PollRepository;
    private pollQuestionRepository: PollQuestionRepository;
    private kycApplicationRepository: KycApplicationRepository;

    constructor() {
        super()
        this.userRepository = new UserRepository()
        this.pollRepository = new PollRepository()
        this.pollQuestionRepository = new PollQuestionRepository()
        this.kycApplicationRepository = new KycApplicationRepository()
    }

    @Transaction()
    public async InitLedger(ctx: Context): Promise<void> {
        const admin = User.create({ firstName: 'Admin', lastName: 'Admin', studentIdNumber: 'admin', passwordHash: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', secretKeyHash: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', kycStatus: KycApplicationStatus.APPROVED, role: UserRole.ADMIN })
        await this.userRepository.createUser(ctx, admin)
    }

    @Transaction(false)
    @Returns('string')
    @ProtectedMethod({ roles: [UserRole.ADMIN] })
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
    @ProtectedMethod({ roles: [UserRole.STUDENT], kycVerification: true })
    public async CreatePoll(ctx: Context, studentIdNumber: string, title: string, description: string, plannedStartDate: string, plannedEndDate: string): Promise<void> {
        const newPoll = Poll.create(
            {
                title,
                description,
                authorStudentIdNumber: studentIdNumber,
                plannedStartDate: plannedStartDate === 'null' ? null : Number(plannedStartDate),
                plannedEndDate: plannedStartDate === 'null' ? null : Number(plannedEndDate),
                status: PollStatus.REVIEW
            }
        )

        await this.pollRepository.createPoll(ctx, newPoll)
    }

    @Transaction()
    @ProtectedMethod({ roles: [UserRole.STUDENT], kycVerification: true })
    public async AddPollQuestion(ctx: Context, studentIdNumber: string, pollId: string, text: string): Promise<void> {
        const poll = await this.pollRepository.getPollById(ctx, pollId)
        if (!poll || poll.authorStudentIdNumber !== studentIdNumber) {
            throw new Error(`Poll with id ${pollId} does not exist or you don't have access to it`)
        }

        if (![PollStatus.REVIEW, PollStatus.APPROVED_AND_WAITING, PollStatus.DECLINED].includes(poll.status)) {
            throw new Error(`Poll is in status ${poll.status} and cannot be updated`)
        }

        const question = await this.pollQuestionRepository.createPollQuestion(ctx, pollId, text);

        poll.questionIds.push(question.id)
        poll.status = PollStatus.REVIEW;

        await this.pollRepository.updatePoll(ctx, pollId, poll)
    }

    @Transaction()
    @ProtectedMethod({ roles: [UserRole.STUDENT], kycVerification: true })
    public async DeletePollQuestion(ctx: Context, studentIdNumber: string, pollId: string, questionId: string): Promise<void> {
        const poll = await this.pollRepository.getPollById(ctx, pollId)
        if (!poll || poll.authorStudentIdNumber !== studentIdNumber) {
            throw new Error(`Poll with id ${pollId} does not exist or you don't have access to it`)
        }

        if (![PollStatus.REVIEW, PollStatus.APPROVED_AND_WAITING, PollStatus.DECLINED].includes(poll.status)) {
            throw new Error(`Poll is in status ${poll.status} and cannot be updated`)
        }

        poll.questionIds = poll.questionIds.filter(id => id !== questionId)
        poll.status = PollStatus.REVIEW

        await this.pollQuestionRepository.deletePollQuestion(ctx, questionId)
        await this.pollRepository.updatePoll(ctx, pollId, poll)
    }

    @Transaction(false)
    @Returns('string')
    @ProtectedMethod({ roles: [UserRole.ADMIN] })
    public async GetPollsListInReviewStatus(ctx: Context, studentIdNumber: string): Promise<string> {
        const polls = await this.pollRepository.getPollsByStatus(ctx, PollStatus.REVIEW)

        return JSON.stringify({ currentStudentId: studentIdNumber, data: polls })
    }

    @Transaction()
    @ProtectedMethod({ roles: [UserRole.ADMIN] })
    public async UpdatePollReviewStatus(ctx: Context, studentIdNumber: string, pollId: string, status: PollStatus): Promise<void> {
        const poll = await this.pollRepository.getPollById(ctx, pollId)

        if (!poll) {
            throw new Error(`Poll with id ${pollId} does not exist`)
        }

        if (poll.status !== PollStatus.REVIEW) {
            throw new Error(`Poll with id ${pollId} is not in review`)
        }

        if (![PollStatus.APPROVED_AND_WAITING, PollStatus.DECLINED].includes(status)) {
            throw new Error(`Poll with id ${pollId} cannot be updated to status ${status} by ADMIN`)
        }

        await this.pollRepository.updatePoll(ctx, pollId, { status })
    }

    @Transaction()
    @ProtectedMethod({ roles: [UserRole.STUDENT], kycVerification: true })
    public async UpdatePoll(ctx: Context, studentIdNumber: string, pollId: string, plannedStartDate: string, plannedEndDate: string, title: string, description: string): Promise<void> {
        const poll = await this.pollRepository.getPollById(ctx, pollId)
        if (!poll) {
            throw new Error(`Poll with id ${pollId} does not exist`)
        }

        if (poll.authorStudentIdNumber !== studentIdNumber) {
            throw new Error(`You can't change poll with id ${pollId} as it wasn't created by you`)
        }

        if ([PollStatus.ACTIVE, PollStatus.FINISHED].includes(poll.status)) {
            throw new Error(`Poll is in status ${poll.status} and cannot be updated`)
        }

        const updateData: Partial<Poll> = {}

        if (plannedEndDate === 'null') {
            updateData.plannedEndDate = null;
        } else if (plannedEndDate !== '') {
            updateData.plannedEndDate = Number(plannedEndDate);
        }

        if (plannedStartDate === 'null') {
            updateData.plannedStartDate = null;
        } else if (plannedStartDate !== '') {
            updateData.plannedStartDate = Number(plannedStartDate);
        }

        if (title !== '') updateData.title = title;
        if (description !== '') updateData.description = description


        if (Object.keys(updateData).length === 0) {
            console.log(`Not updating ${pollId} as there is no update data in arguments`)
            return;
        }

        await this.pollRepository.updatePoll(ctx, pollId, { ...updateData,status: PollStatus.REVIEW })
    }

    @Transaction()
    @ProtectedMethod({ roles: [UserRole.STUDENT] })
    public async StartPoll(ctx: Context, studentIdNumber: string, pollId: string): Promise<void> {
        const poll = await this.pollRepository.getPollById(ctx, pollId)
        if (!poll) {
            throw new Error('Poll with id ${pollId} does not exist')
        }

        if (poll.authorStudentIdNumber !== studentIdNumber) {
            throw new Error(`You can't start poll with id ${pollId} as it was not created by you`)
        }

        if (poll.status !== PollStatus.APPROVED_AND_WAITING ||
            ctx.stub.getTxTimestamp().seconds.toNumber() > (poll.plannedStartDate ?? Infinity)
        ) {
            throw new Error(`You can't start a poll that is not in ${PollStatus.APPROVED_AND_WAITING} status or has already been started by planned date`)
        }

        await this.pollRepository.updatePoll(ctx, pollId, { status: PollStatus.ACTIVE })
    }

    @Transaction()
    @ProtectedMethod({ roles: [UserRole.STUDENT] })
    public async StopPoll(ctx: Context, studentIdNumber: string, pollId: string): Promise<void> {
        const poll = await this.pollRepository.getPollById(ctx, pollId)
        if (!poll) {
            throw new Error('Poll with id ${pollId} does not exist')
        }

        if (poll.authorStudentIdNumber !== studentIdNumber) {
            throw new Error(`You can't start poll with id ${pollId} as it was not created by you`)
        }

        if (poll.status !== PollStatus.ACTIVE ||
            ctx.stub.getTxTimestamp().seconds.toNumber() < (poll.plannedEndDate ?? Infinity)
        ) {
            throw new Error(`You can't stop a poll that is not in ${PollStatus.ACTIVE} status or has already been started by planned date`)
        }

        await this.pollRepository.updatePoll(ctx, pollId, { status: PollStatus.FINISHED })
    }

    @Transaction()
    @ProtectedMethod({ roles: [UserRole.STUDENT] })
    public async GetCurrentUserInfo(ctx: Context, studentIdNumber: string): Promise<string> {
        return JSON.stringify(await this.userRepository.getUser(ctx, studentIdNumber))
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