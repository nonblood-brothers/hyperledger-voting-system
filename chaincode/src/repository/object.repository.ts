import { ObjectDoesNotExistException } from '../exception/object-does-not-exist.exception';
import { ObjectAlreadyExistsException } from '../exception/object-already-exists.exception';

import { Context } from 'fabric-contract-api';
import sortKeysRecursive from 'sort-keys-recursive';

export abstract class ObjectRepository {
    protected async saveObject(ctx: Context, objectIdentifier: string, id: string, object: object): Promise<void> {
        await ctx.stub.putState(`${objectIdentifier}:${id}`, Buffer.from(JSON.stringify(sortKeysRecursive({ ...object }))))
    }

    protected async updateObject<T extends object>(ctx: Context, objectIdentifier: string, id: string, object: Partial<T>): Promise<T | null> {
        const oldObject = await this.getObject<T>(ctx, objectIdentifier, id)
        if (!oldObject) return null

        await this.saveObject(ctx, objectIdentifier, id, { ...oldObject, ...object })

        return await this.getObject<T>(ctx, objectIdentifier, id) as T;
    }

    protected async deleteObject(ctx: Context, objectIdentifier: string, id:string): Promise<void> {
        await ctx.stub.deleteState(`${objectIdentifier}:${id}`)
    }

    protected async getObject<T>(ctx: Context, objectIdentifier: string, id: string): Promise<T | null> {
        const data = await ctx.stub.getState(`${objectIdentifier}:${id}`)

        if (!data || data.length === 0) {
            return null
        }

        try {
            return JSON.parse(data.toString()) as T
        } catch (e) {
            if (e instanceof SyntaxError) {
                return null
            }

            throw e;
        }
    }

    protected async incrementAndGetNextSequenceId(ctx: Context, objectIdentifier: string): Promise<number> {
        const { sequence: oldSequence } = await this.getObject<{ sequence: number }>(ctx, `${objectIdentifier}-seq`, 'seq') || { sequence: 0 }

        await this.saveObject(ctx, `${objectIdentifier}-seq`, 'seq', { sequence: oldSequence + 1 })
        return oldSequence + 1;
    }

    protected async *getAllObjectsIterator(ctx: Context, objectIdentifier: string): AsyncIterableIterator<{ key: string, value: unknown }> {
        const startKey = `${objectIdentifier}:`
        const endKey = `${objectIdentifier}:~`

        const iterator = await ctx.stub.getStateByRange(startKey, endKey)

        try {
            let result = await iterator.next();

            while (!result.done) {
                if (result.value && result.value.value && result.value.value.length > 0) {
                    const key = result.value.key;
                    try {
                        const value = JSON.parse(result.value.value.toString()) as unknown;
                        yield { key, value };
                    } catch (e) {
                        console.log(`Error parsing value for key ${key}: ${e}`);
                    }
                }

                result = await iterator.next();
            }
        } finally {
            await iterator.close();
        }
    }

    protected async getAllObjects(ctx: Context, objectIdentifier: string): Promise<{ key: string, value: object }[]> {
        const objects: { key: string, value: object }[] = []
        for await (const { key, value } of this.getAllObjectsIterator(ctx, objectIdentifier)) {
            objects.push({ key, value: value as object })
        }

        return objects
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
