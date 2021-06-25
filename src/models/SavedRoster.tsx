import { WowPlayer } from "../WowData";
import SavedPlayer from "./SavedPlayer";
import { plainToClass } from "class-transformer";
import ILoadable from "./ILoadable";

class SavedRoster implements ILoadable {
  name: string;
  players: SavedPlayer[];

  constructor(name: string, players: SavedPlayer[]) {
    this.name = name;
    this.players = players;
  }

  loadChildren() {
    this.players = plainToClass(SavedPlayer, this.players);
  }
}

export default SavedRoster;