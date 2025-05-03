export function getEnv(envName: string): string {
    const env = process.env[envName];

    if (!env) {
        throw new Error(`Env ${envName} is not found`)
    }

    return env;
}