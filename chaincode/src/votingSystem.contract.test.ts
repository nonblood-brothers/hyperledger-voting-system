import { VotingSystemContract } from './votingSystem.contract';
import { User } from './object/user.object';
import { KYCApplication } from './object/kyc-application.object';
import { UserRepository } from './repository/user.repository';
import { KycApplicationRepository } from './repository/kyc-application.repository';
import { KycApplicationStatus } from './enum/kyc-application-status.enum';
import { UserRole } from './enum/user-role.enum';

import { Context } from 'fabric-contract-api';

// Mock the dependencies
jest.mock('./repository/user.repository');
jest.mock('./repository/kyc-application.repository');

describe('VotingSystemContract', () => {
    let contract: VotingSystemContract;
    let mockContext: Context;
    let mockUserRepository: jest.Mocked<UserRepository>;
    let mockKycApplicationRepository: jest.Mocked<KycApplicationRepository>;

    beforeEach(() => {
        // Reset all mocks
        jest.clearAllMocks();

        // Create mock context
        mockContext = {
            stub: {
                getTxTimestamp: jest.fn().mockReturnValue({
                    seconds: {
                        toNumber: jest.fn().mockReturnValue(1234567890)
                    }
                }),
                putState: jest.fn(),
                getState: jest.fn()
            }
        } as unknown as Context;

        // Create mock repositories
        mockUserRepository = new UserRepository() as jest.Mocked<UserRepository>;
        mockKycApplicationRepository = new KycApplicationRepository() as jest.Mocked<KycApplicationRepository>;

        // Create contract instance with mocked repositories
        contract = new VotingSystemContract();
        // Replace the repositories with mocks
        (contract as unknown as { userRepository: unknown }).userRepository = mockUserRepository;
        (contract as unknown as { kycApplicationRepository: unknown }).kycApplicationRepository = mockKycApplicationRepository;
    });

    describe('RegisterUser', () => {
        const testFirstName = 'John';
        const testLastName = 'Doe';
        const testStudentIdNumber = '12345';
        const testPasswordHash = 'hashedPassword';
        const testSecretKeyHash = 'hashedSecretKey';

        it('should successfully register a new user', async () => {
            // Setup: User does not exist yet
            mockUserRepository.getUser.mockResolvedValue(null);
            mockUserRepository.createUser.mockResolvedValue();
            mockKycApplicationRepository.createKycApplication.mockResolvedValue();

            // Execute
            await contract.RegisterUser(
                mockContext,
                testFirstName,
                testLastName,
                testStudentIdNumber,
                testPasswordHash,
                testSecretKeyHash
            );

            // Verify
            // eslint-disable-next-line @typescript-eslint/unbound-method
            expect(mockUserRepository.getUser).toHaveBeenCalledWith(mockContext, testStudentIdNumber);

            // Verify user creation
            // eslint-disable-next-line @typescript-eslint/unbound-method
            expect(mockUserRepository.createUser).toHaveBeenCalledWith(
                mockContext,
                expect.objectContaining({
                    firstName: testFirstName,
                    lastName: testLastName,
                    studentIdNumber: testStudentIdNumber,
                    passwordHash: testPasswordHash,
                    secretKeyHash: testSecretKeyHash,
                    kycStatus: KycApplicationStatus.PENDING,
                    role: UserRole.STUDENT
                })
            );

            // Verify KYC application creation
            // eslint-disable-next-line @typescript-eslint/unbound-method
            expect(mockKycApplicationRepository.createKycApplication).toHaveBeenCalledWith(
                mockContext,
                expect.objectContaining({
                    userId: testStudentIdNumber,
                    status: KycApplicationStatus.PENDING
                })
            );
        });

        it('should throw an error if user already exists', async () => {
            // Setup: User already exists
            const existingUser = User.create({
                firstName: 'Existing',
                lastName: 'User',
                studentIdNumber: testStudentIdNumber,
                passwordHash: 'existingHash',
                secretKeyHash: 'existingSecretHash',
                kycStatus: KycApplicationStatus.PENDING,
                role: UserRole.STUDENT,
                createdAt: 1234567890,
                updatedAt: 1234567890
            });

            mockUserRepository.getUser.mockResolvedValue(existingUser);

            // Execute & Verify
            await expect(
                contract.RegisterUser(
                    mockContext,
                    testFirstName,
                    testLastName,
                    testStudentIdNumber,
                    testPasswordHash,
                    testSecretKeyHash
                )
            ).rejects.toThrow('User with this student id already exists in the system');

            // Verify that createUser and createKycApplication were not called
            // eslint-disable-next-line @typescript-eslint/unbound-method
            expect(mockUserRepository.createUser).not.toHaveBeenCalled();

            // eslint-disable-next-line @typescript-eslint/unbound-method
            expect(mockKycApplicationRepository.createKycApplication).not.toHaveBeenCalled();
        });

        it('should handle edge case with empty strings', async () => {
            // Setup: User does not exist yet
            mockUserRepository.getUser.mockResolvedValue(null);
            mockUserRepository.createUser.mockResolvedValue();
            mockKycApplicationRepository.createKycApplication.mockResolvedValue();

            // Execute with empty strings
            await contract.RegisterUser(
                mockContext,
                '',  // empty firstName
                '',  // empty lastName
                testStudentIdNumber,
                testPasswordHash,
                testSecretKeyHash
            );

            // Verify user creation with empty strings
            // eslint-disable-next-line @typescript-eslint/unbound-method
            expect(mockUserRepository.createUser).toHaveBeenCalledWith(
                mockContext,
                expect.objectContaining({
                    firstName: '',
                    lastName: '',
                    studentIdNumber: testStudentIdNumber,
                    passwordHash: testPasswordHash,
                    secretKeyHash: testSecretKeyHash,
                    kycStatus: KycApplicationStatus.PENDING,
                    role: UserRole.STUDENT
                })
            );
        });
    });
});