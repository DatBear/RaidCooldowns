import SavedTimeSlot from "./SavedTimeSlot";
import SavedPlayer from "./SavedPlayer";
import { plainToClass } from "class-transformer";
import ILoadable from "./ILoadable";

class SavedFight implements ILoadable {
  name: string;
  players: SavedPlayer[];
  timeSlots: SavedTimeSlot[];

  constructor(name: string, players: SavedPlayer[], timeSlots: SavedTimeSlot[]) {
    this.name = name;
    this.players = players;
    this.timeSlots = timeSlots;
  }

  loadChildren() {
    this.players = plainToClass(SavedPlayer, this.players);
    this.timeSlots = plainToClass(SavedTimeSlot, this.timeSlots);
  }
}

export default SavedFight;