import SavedTimeSlot from "./SavedTimeSlot";
import { plainToClass } from "class-transformer";
import ILoadable from "./ILoadable";

class SavedTimings implements ILoadable{
  name: string;
  timeSlots: SavedTimeSlot[];
  
  constructor(name: string, timeSlots: SavedTimeSlot[]){
    this.name = name;
    this.timeSlots = timeSlots;
  }

  loadChildren(){
    this.timeSlots = plainToClass(SavedTimeSlot, this.timeSlots);
  }
}

export default SavedTimings;