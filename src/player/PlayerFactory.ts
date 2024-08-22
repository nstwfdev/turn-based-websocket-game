import {IPlayer, Player} from "./Player";
import {WebSocket} from "ws";

export class PlayerFactory {
    create(ws: WebSocket): IPlayer {
        return new Player(this.generatePlayerId(), ws);
    }

    private generatePlayerId(): string {
        return `player-${Date.now()}`;
    }
}