declare module 'ws' {
  import { EventEmitter } from 'events';
  import { Duplex } from 'stream';
  import { Agent } from 'http';

  class WebSocket extends EventEmitter {
    static CONNECTING: number;
    static OPEN: number;
    static CLOSING: number;
    static CLOSED: number;

    constructor(address: string | URL, options?: WebSocket.ClientOptions);

    binaryType: 'nodebuffer' | 'arraybuffer' | 'fragments';
    bufferedAmount: number;
    extensions: string;
    protocol: string;
    readyState: number;
    url: string;

    close(code?: number, data?: string | Buffer): void;
    ping(data?: any, mask?: boolean, cb?: (err: Error) => void): void;
    pong(data?: any, mask?: boolean, cb?: (err: Error) => void): void;
    send(data: any, cb?: (err?: Error) => void): void;
    terminate(): void;

    on(event: 'close', listener: (code: number, reason: Buffer) => void): this;
    on(event: 'error', listener: (err: Error) => void): this;
    on(event: 'message', listener: (data: WebSocket.Data) => void): this;
    on(event: 'open', listener: () => void): this;
    on(event: 'ping' | 'pong', listener: (data: Buffer) => void): this;
    on(event: string | symbol, listener: (...args: any[]) => void): this;
  }

  namespace WebSocket {
    export interface ClientOptions {
      protocol?: string | string[];
      followRedirects?: boolean;
      handshakeTimeout?: number;
      maxRedirects?: number;
      perMessageDeflate?: boolean | PerMessageDeflateOptions;
      localAddress?: string;
      protocolVersion?: number;
      headers?: { [key: string]: string };
      origin?: string;
      agent?: Agent;
      host?: string;
      family?: number;
      checkServerIdentity?(servername: string, cert: object): boolean;
      rejectUnauthorized?: boolean;
      maxPayload?: number;
    }

    export interface PerMessageDeflateOptions {
      serverNoContextTakeover?: boolean;
      clientNoContextTakeover?: boolean;
      serverMaxWindowBits?: number;
      clientMaxWindowBits?: number;
      zlibInflateOptions?: {
        chunkSize?: number;
        windowBits?: number;
        level?: number;
        memLevel?: number;
        strategy?: number;
        dictionary?: Buffer | Buffer[] | DataView;
      };
      zlibDeflateOptions?: {
        chunkSize?: number;
        windowBits?: number;
        level?: number;
        memLevel?: number;
        strategy?: number;
        dictionary?: Buffer | Buffer[] | DataView;
      };
      threshold?: number;
      concurrencyLimit?: number;
    }

    export type Data = string | Buffer | ArrayBuffer | Buffer[];
  }

  export = WebSocket;
} 