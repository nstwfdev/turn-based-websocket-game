import {IPlayer} from '../player/Player';

export function broadcast(players: IPlayer[], message: any) {
    players.forEach(player => {
        player.connection.send(JSON.stringify(message));
    });
}
