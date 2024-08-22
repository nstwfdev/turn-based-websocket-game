import {IPlayer} from './Player';

export class PlayerManager {
    private players: Map<string, IPlayer> = new Map();

    addPlayer(player: IPlayer) {
        this.players.set(player.id, player);
    }

    removePlayer(player: IPlayer) {
        this.players.delete(player.id);
    }

    playersCount(): number {
        return this.players.size;
    }
}
