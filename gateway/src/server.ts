import { Contract } from "@hyperledger/fabric-gateway"
import express from 'express'
import { getApiRouter } from "./router/api.router"
import config from "./config"

export function server(contract: Contract) {
    const app = express()

    app.use('/api', getApiRouter(contract))
    app.get('/', (req, res) => {
        res.setHeader('Content-Type', 'application/json')
        res.status(403).send({ message: 'You shall not pass!' })
    })

    app.listen(config.port, (err) => {
        if (err) {
            throw new Error('Failed to start server: ', err)
        }

        console.log('Successfully started gateway on port', config.port)
    })
}