/**
 * This decorator is used solely for debugging purposes and must be removed after implementation is considered complete
 */
export function ExceptionLog() {
    return function (target: unknown, propertyKey: string, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value as ((...args: unknown[]) => Promise<unknown>);

        descriptor.value = async function(...args: unknown[]) {
            try {
                return await originalMethod.call(this, ...args)
            } catch (e) {
                console.log('Error:', e)
                throw e
            }
        }
    }
}