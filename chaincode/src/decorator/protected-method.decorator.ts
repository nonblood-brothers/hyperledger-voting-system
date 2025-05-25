import { UserRole } from '../enum/user-role.enum';
import { UserRepository } from '../repository/user.repository';
import { KycApplicationStatus } from '../enum/kyc-application-status.enum';

import { Context } from 'fabric-contract-api';

export interface ProtectedMethodOptions {
    roles?: UserRole[]
    kycVerification?: boolean
}

const userRepository = new UserRepository()

export function ProtectedMethod(options?: ProtectedMethodOptions) {
    return function (target: unknown, propertyKey: string, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value as ((...args: unknown[]) => Promise<unknown>);

        descriptor.value = async function(ctx: Context, studentIdNumber: string, ...args: unknown[]) {
            const user = await userRepository.getUser(ctx, studentIdNumber)

            if (!user) {
                throw new Error(`User with student ID ${studentIdNumber} does not exist`)
            }

            if (options?.roles?.length && !options.roles.includes(user.role)) {
                throw new Error(`Forbidden by role, ${options.roles.join(', ')} are allowed, ${user.role} provided`);
            }

            if (options?.kycVerification && user.kycStatus !== KycApplicationStatus.APPROVED) {
                throw new Error('Forbidden by KYC status')
            }

            return await originalMethod.call(this, ctx, studentIdNumber, ...args)
        }
    }
}
