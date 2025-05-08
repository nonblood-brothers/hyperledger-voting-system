import { KYCApplication } from '../object/kyc-application.object';

import { KycApplicationStatus } from '../enum/kyc-application-status.enum';

import { ObjectRepository } from './object.repository';

import { Context } from 'fabric-contract-api';

export class KycApplicationRepository extends ObjectRepository {
    public async createKycApplication(ctx: Context, kycApplication: Omit<KYCApplication, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> {
        const nextId = await this.incrementAndGetNextSequenceId(ctx, KYCApplication.objectIdentifier)

        const newKycApplication = KYCApplication.create({ ...kycApplication, id: nextId.toString(), createdAt: ctx.stub.getTxTimestamp().seconds.toNumber(), updatedAt: ctx.stub.getTxTimestamp().seconds.toNumber() })

        await this.saveObject(ctx, KYCApplication.objectIdentifier, nextId.toString(), newKycApplication)
    }

    public async updateKycApplication(ctx: Context, id: string, kycApplication: Partial<KYCApplication>): Promise<KYCApplication> {
        const result = await this.updateObject(ctx, KYCApplication.objectIdentifier, id, { ...kycApplication, updatedAt: ctx.stub.getTxTimestamp().seconds.toNumber() })

        if (!result) {
            throw new Error('Kyc application not found')
        }

        return result
    }

    public async getKycApplicationsByStatus(ctx: Context, status: KycApplicationStatus): Promise<KYCApplication[]> {
        const iterator = this.getAllObjectsIterator(ctx, KYCApplication.objectIdentifier)
        const result: KYCApplication[] = []

        for await (const iteratorElement of iterator) {
            if ((iteratorElement.value as KYCApplication | undefined)?.status === status) {
                result.push(iteratorElement.value as KYCApplication)
            }
        }

        return result
    }
}