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
import { PollOptionRepository } from './repository/poll-option.repository';

import { Context, Contract, Info, Returns, Transaction } from 'fabric-contract-api';

@Info({ title: 'VotingSystem', description: 'Smart contract for voting system' })
export class VotingSystemContract extends Contract {
    private userRepository: UserRepository;
    private pollRepository: PollRepository;
    private pollOptionRepository: PollOptionRepository;
    private kycApplicationRepository: KycApplicationRepository;

    constructor() {
        super()
        this.userRepository = new UserRepository()
        this.pollRepository = new PollRepository()
        this.pollOptionRepository = new PollOptionRepository()
        this.kycApplicationRepository = new KycApplicationRepository()
    }

    /**
     * Helper function to check and update poll status based on dates
     * @param ctx The transaction context
     * @param poll The poll to check
     * @returns The poll with updated status if needed, or the original poll if no update needed
     */
    private async checkAndUpdatePollStatus(ctx: Context, poll: Poll): Promise<Poll> {
        const currentTime = ctx.stub.getTxTimestamp().seconds.toNumber();
        let statusChanged = false;

        // Check if an APPROVED_AND_WAITING poll should be ACTIVE based on the plannedStartDate
        if (poll.status === PollStatus.APPROVED_AND_WAITING &&
            poll.plannedStartDate !== null &&
            currentTime >= poll.plannedStartDate)
        {
            poll = poll.copy({ status: PollStatus.ACTIVE });
            statusChanged = true;
        }

        // Check if an ACTIVE poll should be FINISHED based on plannedEndDate
        if (poll.status === PollStatus.ACTIVE &&
            poll.plannedEndDate !== null &&
            currentTime >= poll.plannedEndDate) {
            poll = poll.copy({ status: PollStatus.FINISHED });
            statusChanged = true;
        }

        // Update the poll in the repository if status changed
        if (statusChanged) {
            await this.pollRepository.updatePoll(ctx, poll.id, { status: poll.status });
        }

        return poll;
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
        if (user) throw new Error('User with this student id already exists in the system')

        const newUser = User.create({ firstName, lastName, studentIdNumber, passwordHash, secretKeyHash, kycStatus: KycApplicationStatus.PENDING, role: UserRole.STUDENT })
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
                plannedStartDate: !plannedStartDate || plannedStartDate === 'null' ? null : Number(plannedStartDate),
                plannedEndDate: !plannedEndDate || plannedEndDate === 'null' ? null : Number(plannedEndDate),
                status: PollStatus.REVIEW,
                optionIds: [],
                participantIds: []
            }
        )

        await this.pollRepository.createPoll(ctx, newPoll)
    }

    @Transaction()
    @ProtectedMethod({ roles: [UserRole.STUDENT], kycVerification: true })
    public async AddPollOption(ctx: Context, studentIdNumber: string, pollId: string, text: string): Promise<void> {
        const poll = await this.pollRepository.getPollById(ctx, pollId)
        if (!poll || poll.authorStudentIdNumber !== studentIdNumber) {
            throw new Error(`Poll with id ${pollId} does not exist or you don't have access to it`)
        }

        if (![PollStatus.REVIEW, PollStatus.APPROVED_AND_WAITING, PollStatus.DECLINED].includes(poll.status)) {
            throw new Error(`Poll is in status ${poll.status} and cannot be updated`)
        }

        const option = await this.pollOptionRepository.createPollOption(ctx, pollId, text);

        poll.optionIds.push(option.id)

        if ([PollStatus.APPROVED_AND_WAITING, PollStatus.DECLINED].includes(poll.status)) {
            poll.status = PollStatus.REVIEW;
        }

        await this.pollRepository.updatePoll(ctx, pollId, poll)
    }

    @Transaction()
    @ProtectedMethod({ roles: [UserRole.STUDENT], kycVerification: true })
    public async DeletePollOption(ctx: Context, studentIdNumber: string, pollId: string, optionId: string): Promise<void> {
        let poll = await this.pollRepository.getPollById(ctx, pollId)
        if (!poll || poll.authorStudentIdNumber !== studentIdNumber) {
            throw new Error(`Poll with id ${pollId} does not exist or you don't have access to it`)
        }

        if (![PollStatus.REVIEW, PollStatus.APPROVED_AND_WAITING, PollStatus.DECLINED].includes(poll.status)) {
            throw new Error(`Poll is in status ${poll.status} and cannot be updated`)
        }

        poll = poll.copy({
            optionIds: poll.optionIds.filter(id => id !== optionId),
            status: PollStatus.REVIEW
        })

        await this.pollOptionRepository.deletePollOption(ctx, optionId)
        await this.pollRepository.updatePoll(ctx, pollId, poll)
    }

    @Transaction(false)
    @Returns('string')
    @ProtectedMethod({ roles: [UserRole.ADMIN] })
    public async GetPollsListInReviewStatus(ctx: Context, studentIdNumber: string): Promise<string> {
        const polls = await this.pollRepository.getPollsByStatus(ctx, PollStatus.REVIEW);

        // No need to check dates for polls in REVIEW status as they haven't been approved yet

        return JSON.stringify({ currentStudentId: studentIdNumber, data: polls });
    }

    @Transaction()
    @ProtectedMethod({ roles: [UserRole.ADMIN] })
    public async UpdatePollReviewStatus(ctx: Context, studentIdNumber: string, pollId: string, status: PollStatus): Promise<void> {
        let poll = await this.pollRepository.getPollById(ctx, pollId)

        if (!poll) {
            throw new Error(`Poll with id ${pollId} does not exist`)
        }

        if (poll.status !== PollStatus.REVIEW) {
            throw new Error(`Poll with id ${pollId} is not in review`)
        }

        if (![PollStatus.APPROVED_AND_WAITING, PollStatus.DECLINED].includes(status)) {
            throw new Error(`Poll with id ${pollId} cannot be updated to status ${status} by ADMIN`)
        }

        // Update the poll status
        await this.pollRepository.updatePoll(ctx, pollId, { status });

        // If the poll was approved and has a plannedStartDate that has already passed,
        // we need to check if it should be immediately set to ACTIVE
        if (status === PollStatus.APPROVED_AND_WAITING) {
            // Get the updated poll
            poll = await this.pollRepository.getPollById(ctx, pollId);
            if (poll) {
                // Check and update poll status based on dates
                await this.checkAndUpdatePollStatus(ctx, poll);
            }
        }
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
        let poll = await this.pollRepository.getPollById(ctx, pollId)
        if (!poll) {
            throw new Error(`Poll with id ${pollId} does not exist`)
        }

        if (poll.authorStudentIdNumber !== studentIdNumber) {
            throw new Error(`You can't start poll with id ${pollId} as it was not created by you`)
        }

        // Check if poll status should be updated based on dates
        poll = await this.checkAndUpdatePollStatus(ctx, poll);

        // If poll is already ACTIVE or FINISHED after date check, inform the user
        if (poll.status === PollStatus.ACTIVE) {
            throw new Error(`Poll with id ${pollId} is already active (automatically activated based on plannedStartDate)`)
        }

        if (poll.status === PollStatus.FINISHED) {
            throw new Error(`Poll with id ${pollId} is already finished (automatically finished based on plannedEndDate)`)
        }

        if (poll.status !== PollStatus.APPROVED_AND_WAITING ||
            (poll.plannedStartDate !== null && ctx.stub.getTxTimestamp().seconds.toNumber() < poll.plannedStartDate)
        ) {
            throw new Error(`You can't start a poll that is not in ${PollStatus.APPROVED_AND_WAITING} status or hasn't reached its planned start date yet`)
        }

        await this.pollRepository.updatePoll(ctx, pollId, { status: PollStatus.ACTIVE })
    }

    @Transaction()
    @ProtectedMethod({ roles: [UserRole.STUDENT] })
    public async StopPoll(ctx: Context, studentIdNumber: string, pollId: string): Promise<void> {
        let poll = await this.pollRepository.getPollById(ctx, pollId)
        if (!poll) {
            throw new Error(`Poll with id ${pollId} does not exist`)
        }

        if (poll.authorStudentIdNumber !== studentIdNumber) {
            throw new Error(`You can't stop poll with id ${pollId} as it was not created by you`)
        }

        // Check if poll status should be updated based on dates
        poll = await this.checkAndUpdatePollStatus(ctx, poll);

        // If poll is already FINISHED after date check, inform the user
        if (poll.status === PollStatus.FINISHED) {
            throw new Error(`Poll with id ${pollId} is already finished (automatically finished based on plannedEndDate)`)
        }

        if (poll.status !== PollStatus.ACTIVE ||
            (poll.plannedEndDate !== null && ctx.stub.getTxTimestamp().seconds.toNumber() > poll.plannedEndDate)
        ) {
            throw new Error(`You can't stop a poll that is not in ${PollStatus.ACTIVE} status or has already ended by planned date`)
        }

        await this.pollRepository.updatePoll(ctx, pollId, { status: PollStatus.FINISHED })
    }

    @Transaction()
    @ProtectedMethod()
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

    @Transaction()
    @ProtectedMethod({ roles: [UserRole.STUDENT], kycVerification: true })
    public async GiveVote(ctx: Context, studentIdNumber: string, pollId: string, optionId: string): Promise<void> {
        let poll = await this.pollRepository.getPollById(ctx, pollId)
        if (!poll) {
            throw new Error(`Poll with id ${pollId} does not exist`)
        }

        // Check and update poll status based on dates
        poll = await this.checkAndUpdatePollStatus(ctx, poll);

        if (poll.status !== PollStatus.ACTIVE) {
            throw new Error(`Poll with id ${pollId} is not active`)
        }

        if (poll.participantIds.includes(studentIdNumber)) {
            throw new Error(`User with student ID ${studentIdNumber} has already voted in poll with id ${pollId}`)
        }

        const pollOption = await this.pollOptionRepository.getPollOptionById(ctx, optionId)

        if (!pollOption) {
            throw new Error(`Option with id ${optionId} does not exist`)
        }

        if (pollOption.pollId !== pollId) {
            throw new Error(`Option with id ${optionId} does not belong to poll with id ${pollId}`)
        }

        await this.pollOptionRepository.incrementVoteCount(ctx, optionId)

        await this.pollRepository.updatePoll(ctx, pollId, {
            participantIds: [...poll.participantIds, studentIdNumber]
        })
    }

    @Transaction()
    @Returns('string')
    public async GetPollById(ctx: Context, pollId: string): Promise<string> {
        let poll = await this.pollRepository.getPollById(ctx, pollId)
        if (!poll) {
            throw new Error(`Poll with id ${pollId} does not exist`)
        }

        // Check and update the poll status based on start/end dates
        poll = await this.checkAndUpdatePollStatus(ctx, poll);

        return JSON.stringify(poll)
    }

    @Transaction(false)
    @Returns('string')
    public async GetPollOptionsByPollId(ctx: Context, pollId: string): Promise<string> {
        let poll = await this.pollRepository.getPollById(ctx, pollId)
        if (!poll) {
            throw new Error(`Poll with id ${pollId} does not exist`)
        }

        // Check and update the poll status based on dates
        poll = await this.checkAndUpdatePollStatus(ctx, poll);

        const options = []
        for (const optionId of poll.optionIds) {
            const option = await this.pollOptionRepository.getPollOptionById(ctx, optionId)
            if (option) {
                options.push(option)
            }
        }

        return JSON.stringify(options)
    }

    @Transaction(false)
    @Returns('string')
    public async GetActivePolls(ctx: Context): Promise<string> {
        // Get polls that are already marked as ACTIVE
        const activePolls = await this.pollRepository.getPollsByStatus(ctx, PollStatus.ACTIVE);

        // Get polls that are in APPROVED_AND_WAITING status and might need to be updated
        const approvedAndWaitingPolls = await this.pollRepository.getPollsByStatus(ctx, PollStatus.APPROVED_AND_WAITING);

        const currentTime = ctx.stub.getTxTimestamp().seconds.toNumber();

        // Check each APPROVED_AND_WAITING poll to see if it should be treated as ACTIVE based on dates
        const updatedPolls = [];
        for (const poll of approvedAndWaitingPolls) {
            // Check if a poll should be treated as ACTIVE based on a plannedStartDate
            if (poll.plannedStartDate && currentTime >= poll.plannedStartDate) {
                // If the plannedEndDate has passed, it should be treated as FINISHED, not as ACTIVE
                if (!poll.plannedEndDate || currentTime < poll.plannedEndDate) {
                    // Should be treated as ACTIVE
                    updatedPolls.push(Object.assign({}, poll, { status: PollStatus.ACTIVE }));
                }
            }
        }

        // Check each ACTIVE poll to see if it should be FINISHED based on dates
        const stillActivePolls = [];
        for (const poll of activePolls) {
            // Check if a poll should still be treated as ACTIVE based on plannedEndDate
            if (poll.plannedEndDate && currentTime >= poll.plannedEndDate) {
                continue;
            }

            stillActivePolls.push(poll)
        }

        return JSON.stringify([...stillActivePolls, ...updatedPolls]);
    }

    @Transaction(false)
    @Returns('string')
    public async GetFinishedPolls(ctx: Context): Promise<string> {
        // Get polls that are already marked as FINISHED
        const finishedPolls = await this.pollRepository.getPollsByStatus(ctx, PollStatus.FINISHED);

        // Get polls that are in ACTIVE status and might need to be updated to FINISHED
        const activePolls = await this.pollRepository.getPollsByStatus(ctx, PollStatus.ACTIVE);

        // Get polls that are in APPROVED_AND_WAITING status and might need to be treated as FINISHED
        const approvedAndWaitingPolls = await this.pollRepository.getPollsByStatus(ctx, PollStatus.APPROVED_AND_WAITING);

        const currentTime = ctx.stub.getTxTimestamp().seconds.toNumber();

        // Check each ACTIVE poll to see if it should be treated as FINISHED based on dates
        const newlyFinishedPolls = [];
        for (const poll of activePolls) {
            // Check if a poll should be treated as FINISHED based on plannedEndDate
            if (poll.plannedEndDate && currentTime >= poll.plannedEndDate) {
                newlyFinishedPolls.push(Object.assign({}, poll, { status: PollStatus.FINISHED }));
            }
        }

        // Check each APPROVED_AND_WAITING poll to see if it should be treated as FINISHED based on dates
        const finishedApprovedPolls = [];
        for (const poll of approvedAndWaitingPolls) {
            // Check if a poll should be treated as FINISHED based on plannedStartDate and plannedEndDate
            if (poll.plannedStartDate !== null && poll.plannedEndDate !== null &&
                currentTime >= poll.plannedStartDate && currentTime >= poll.plannedEndDate) {
                finishedApprovedPolls.push(Object.assign({}, poll, { status: PollStatus.FINISHED }));
            }
        }

        return JSON.stringify([...finishedPolls, ...newlyFinishedPolls, ...finishedApprovedPolls]);
    }

    @Transaction(false)
    @Returns('string')
    @ProtectedMethod({ roles: [UserRole.STUDENT], kycVerification: true })
    public async GetMyPendingPolls(ctx: Context, studentIdNumber: string): Promise<string> {
        // Get polls created by this user that are in REVIEW, DECLINED, or APPROVED_AND_WAITING status
        const pendingPolls = await this.pollRepository.getPollsByCreatorAndStatus(ctx, studentIdNumber,
            [PollStatus.REVIEW, PollStatus.DECLINED, PollStatus.APPROVED_AND_WAITING]);

        const currentTime = ctx.stub.getTxTimestamp().seconds.toNumber();

        // Filter out polls that should be treated as ACTIVE based on plannedStartDate
        // Keep polls in DECLINED status regardless of dates
        const filteredPolls = pendingPolls.filter(poll => {
            // Always keep polls in DECLINED status
            if (poll.status === PollStatus.DECLINED) {
                return true;
            }

            // Check if poll should be treated as ACTIVE based on plannedStartDate
            if (poll.status === PollStatus.APPROVED_AND_WAITING &&
                poll.plannedStartDate !== null &&
                currentTime >= poll.plannedStartDate) {

                // If plannedEndDate has passed, it should be treated as FINISHED, not as pending
                if (poll.plannedEndDate !== null && currentTime >= poll.plannedEndDate) {
                    return false;
                }

                // Should be treated as ACTIVE, not as pending
                return false;
            }

            return true;
        });

        return JSON.stringify(filteredPolls);
    }
}
