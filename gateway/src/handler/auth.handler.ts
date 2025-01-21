import { Contract } from "@hyperledger/fabric-gateway";
import { RequestHandler } from "express";

// TODO: implement auth handler using jwt
export function getAuthHandler(contract: Contract): RequestHandler {
    return async (req, res) => {

    }
}