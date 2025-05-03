import { TextDecoder } from 'node:util';

const utf8Decoder = new TextDecoder();

export function decodeAndParseUtf8Json<T = unknown>(bytes: Uint8Array): T {
    const resultJson = utf8Decoder.decode(bytes);
    return JSON.parse(resultJson) as T;
}