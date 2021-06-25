import SavedWowSpell from "./SavedWowSpell";
import TimeSlot from "./TimeSlot";
import { WowPlayer, WowSpell } from "../WowData";

class SavedTimeSlot {
  id: number = 0;
  formattedTime: string = '';
  name: string = '';
  spells: SavedWowSpell[] = [];

  constructor(timeSlot?: TimeSlot){
    if(timeSlot == null) return;
    this.id = timeSlot.id;
    this.name = timeSlot.name;
    this.formattedTime = timeSlot.formattedTime;
    this.spells = timeSlot.spells.map(x => new SavedWowSpell(x));
  }

  toTimeSlot(players?: WowPlayer[]){
    let timeSlot = new TimeSlot(this.name, this.formattedTime);
    timeSlot.setId(this.id);  
    if(players != null){
      this.spells.forEach(x => {
        let spell = players.find(p => p.name === x.playerName)?.cooldowns.find(cd => cd.spellId == x.spellId);
        if(spell != null) {
          timeSlot.addSpell(spell);
        }
        else {
          console.error('error loading unknown spell: ', x.spellId, ' for player: ', x.playerName);
        }
      });
    }  
    
    return timeSlot;
  }
}

export default SavedTimeSlot;