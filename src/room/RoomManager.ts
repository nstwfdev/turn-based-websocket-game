import {Room} from './Room';
import {IPlayer} from "../player/Player";

type RoomMap = Map<string, Room>;

export class RoomManager {
    private rooms: RoomMap = new Map();

    joinRoom(player: IPlayer): Room {
        const room = this.findRoomForPlayer(player);

        room.addPlayer(player);

        return room;
    }

    private findRoomForPlayer(player: IPlayer): Room {
        let room: Room | undefined;

        room = Array.from(this.rooms.values()).find(room => !room.isFull());
        if (room) {
            return room;
        }

        room = this.createRoom();
        return room;
    }

    private createRoom(): Room {
        const roomId = this.generateId();
        const room = new Room(roomId);

        this.addRoom(room);

        return room;
    }

    private addRoom(room: Room) {
        this.rooms.set(room.getId(), room);
    }

    private generateId(): string {
        return `room-${Date.now()}`;
    }

    getRooms(): RoomMap {
        return this.rooms;
    }
}
