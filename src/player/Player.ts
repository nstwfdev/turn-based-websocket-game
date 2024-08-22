import {WebSocket} from "ws";

export interface IPlayer {
    id: string;
    connection: WebSocket;
}

export class Player implements IPlayer {
    constructor(
        public id: string,
        public connection: WebSocket
    ) {
    }
}
