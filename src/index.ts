import WebSocket from 'ws';
import {PlayerManager} from './player/PlayerManager';
import {RoomManager} from "./room/RoomManager";
import {IPlayer} from "./player/Player";
import {PlayerFactory} from "./player/PlayerFactory";
import {NextTurn, Room} from "./room/Room";

const wss = new WebSocket.Server({port: 8080});

const playerManager = new PlayerManager();
const roomManager = new RoomManager();
const playerFactory = new PlayerFactory();

wss.on('connection', (ws: WebSocket) => {
    let player: IPlayer | null = null;
    let room: Room | null = null;

    ws.on('message', (message: WebSocket.MessageEvent) => {
        const parsedMessage = JSON.parse(message.toString());

        if (parsedMessage.type === 'join') {
            player = playerFactory.create(ws);
            room = roomManager.joinRoom(player);

            playerManager.addPlayer(player);

            ws.send(JSON.stringify({type: 'assignId', id: player.id, roomId: room.getId()}));
        } else {
            if (player && room)
                room.handleGameEvent(player);
        }
    });

    ws.on('close', () => {
        if (player) {
            playerManager.removePlayer(player);

            if (room) {
                room.removePlayer(player);
            }
        }
    });
});

setInterval(() => {
    const rooms = roomManager.getRooms();

    let nextTurn: NextTurn | null;

    for (const room of rooms.values()) {
        nextTurn = room.getNextTurn();
        if (nextTurn === null) {
            continue;
        }

        if (nextTurn.deadline < Date.now()) {
            room.handleNextTurn(nextTurn);
        }
    }
}, 1000);

console.log('WebSocket server is running on wss://localhost:8080');
