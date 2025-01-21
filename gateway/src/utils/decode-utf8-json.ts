import { TextDecoder } from 'util';

const utf8Decoder = new TextDecoder();

export function decodeAndParseUtf8Json(bytes: Uint8Array): unknown {
    const resultJson = utf8Decoder.decode(bytes);
    return JSON.parse(resultJson);
}