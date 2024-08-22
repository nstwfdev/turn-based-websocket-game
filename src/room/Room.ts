import {broadcast} from '../utils/Utils';
import {IPlayer} from '../player/Player';

export enum State {WaitPlayers, WaitPlayerTurn, RoundEnd, RoundStart}

export class NextTurn {
    public deadline: number;
    public state: State;

    constructor(deadline: number, state: State) {
        this.deadline = deadline;
        this.state = state;
    }
}

export class Room {
    private id: string;

    private players: Map<string, IPlayer> = new Map();
    private currentPlayerIndex: number = 0;
    private nextTurn: NextTurn | null = null;

    constructor(id: string) {
        this.id = id;
    }

    addPlayer(player: IPlayer) {
        this.players.set(player.id, player);

        if (this.isFull()) {
            this.prepareRound();
        }
    }

    getNextTurn(): NextTurn | null {
        return this.nextTurn;
    }

    handleNextTurn(nextTurn: NextTurn): void {
        //TODO: use state machine
        switch (nextTurn.state) {
            case State.RoundStart:
                this.startRound();
                return;
            case State.WaitPlayerTurn:
                this.eliminatePlayer(this.currentPlayer(), 'timed out');
                return;
        }
    }

    handleGameEvent(player: IPlayer): void {
        if (this.currentPlayerIndex === null) {
            player.connection.send(JSON.stringify({error: 'game not started yet'}))
            return;
        }

        let currentPlayer = this.currentPlayer();

        if (currentPlayer.id !== player.id) {
            player.connection.send(JSON.stringify({error: 'not your turn'}))
            return;
        }

        // TODO: implement game logic
        this.turnToNextPlayer(this.currentPlayer());
    }

    setNextTurn(timeout: number, state: State): void {
        const deadline = Date.now() + timeout;

        this.nextTurn = new NextTurn(deadline, state);

        const tsBody = {
            deadline: deadline,
            time: Date.now()
        }

        switch (state) {
            case State.WaitPlayerTurn:
                this.broadcast('nextTurn', {currentPlayer: this.currentPlayer().id, ...tsBody});
                return;
            case State.RoundStart:
                this.broadcast('startRound', {currentPlayer: this.currentPlayer().id, ...tsBody})
                return;
        }
    }

    removePlayer(player: IPlayer) {
        this.eliminatePlayer(player, 'disconnect');
    }

    getId(): string {
        return this.id;
    }

    isFull(): boolean {
        return this.players.size === 2;
    }

    private prepareRound() {
        //TODO: randomize player index
        this.currentPlayerIndex = 0;

        this.setNextTurn(5000, State.RoundStart);
    }

    private startRound(): void {
        this.setNextTurn(6000, State.WaitPlayerTurn);
    }

    private eliminatePlayer(player: IPlayer, reason: string): void {
        if (player) {
            player.connection.send(JSON.stringify({type: 'eliminated', reason}));

            this.players.delete(player.id);

            if (this.players.size === 1) {
                this.broadcast('gameOver', {winner: Array.from(this.players.values())[0].id})
                return;
            }

            this.turnToNextPlayer(player);
        }
    }

    private turnToNextPlayer(player: IPlayer) {
        const playerIndex = this.currentPlayerIndex;

        if (player.id === this.currentPlayer().id) {
            this.currentPlayerIndex = playerIndex % this.players.size;
        } else if (playerIndex > this.players.size - 1) {
            this.currentPlayerIndex = playerIndex - 1;
        }

        this.setNextTurn(6000, State.WaitPlayerTurn);
    }

    private currentPlayer(): IPlayer {
        if (this.currentPlayerIndex === null) {
            throw new Error('Current player index is null')
        }

        const currentPlayerId = Array.from(this.players.values())[this.currentPlayerIndex].id;
        const currentPlayer = this.players.get(currentPlayerId);

        if (!currentPlayer) {
            throw new Error('Current player not found')
        }

        return currentPlayer;
    }

    private broadcast(type: string, message: object) {
        console.log(this.id, type, message);

        broadcast(Array.from(this.players.values()), {type, ...message});
    }
}