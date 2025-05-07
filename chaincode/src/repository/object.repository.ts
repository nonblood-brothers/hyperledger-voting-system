import { ObjectDoesNotExistException } from '../exception/object-does-not-exist.exception';

import { ObjectAlreadyExistsException } from '../exception/object-already-exists.exception';

import { Context } from 'fabric-contract-api';
import sortKeysRecursive from 'sort-keys-recursive';

export abstract class ObjectRepository {
    protected async saveObject(ctx: Context, objectIdentifier: string, id: string, object: object): Promise<void> {
        await ctx.stub.putState(`${objectIdentifier}:${id}`, Buffer.from(JSON.stringify(sortKeysRecursive(object))))
    }

    protected async deleteObject(ctx: Context, objectIdentifier: string, id:string): Promise<void> {
        await ctx.stub.deleteState(`${objectIdentifier}:${id}`)
    }

    protected async getObject<T>(ctx: Context, objectIdentifier: string, id: string): Promise<T | null> {
        const data = await ctx.stub.getState(`${objectIdentifier}:${id}`).then(data => data.toString())

        try {
            return JSON.parse(data) as T
        } catch (e) {
            if (e instanceof SyntaxError) {
                return null
            }

            throw e;
        }
    }

    protected async changeObjectId(ctx: Context, objectIdentifier: string, oldId: string, newId: string): Promise<void> {
        const oldData = await this.getObject(ctx, objectIdentifier, oldId)
        if (!oldData) {
            throw new ObjectDoesNotExistException(`Object ${objectIdentifier}:${oldId} does not exist`)
        }

        const isNewIdAvailable = await this.getObject(ctx, objectIdentifier, newId).then(data => data === null)
        if (!isNewIdAvailable) {
            throw new ObjectAlreadyExistsException(`Object ${objectIdentifier}:${newId} already exists`)
        }

        await this.deleteObject(ctx, objectIdentifier, oldId)
        await this.saveObject(ctx, objectIdentifier, newId, oldData)
    }
}