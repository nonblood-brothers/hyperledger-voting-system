export function getEnv(key: string, defaultValue?: string): string {
    const value = process.env[key];

    if (!value) {
        if (defaultValue) {
            return defaultValue
        } else {
            throw new Error(`Missing environment variable: ${key}`)
        }
    }

    return value
}