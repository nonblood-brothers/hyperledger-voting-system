class Logger {
    log(message: string, additionalContext: string[] = []) {
        const time = new Date().toUTCString().split('T')[0]
        const context = [time, ...additionalContext].join(':')
        console.log(`[${context}] ${message}`)
    }
}

const loggerInstance = new Logger()
export default loggerInstance