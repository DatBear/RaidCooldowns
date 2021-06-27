import { WowSpell, WowPlayer } from "../WowData";
import NoteAddon from "./NoteAddon";

class TimeSlot {
  public static default: TimeSlot = new TimeSlot('', '0');
  private static nextId: number = 1;
  id: number;
  name: string;
  formattedTime: string;
  time: number;
  spells: WowSpell[];

  constructor(name?: string, formattedTime?: string) {
    this.id = 0;
    this.name = name ?? '';
    this.formattedTime = '';
    this.time = 0;
    this.spells = [];

    if(formattedTime !== undefined){
      this.setTime(formattedTime);
    }
  }

  setId(id?: number) {
    this.id = id ?? TimeSlot.nextId++;
    return this;
  }

  setTime(formattedTime: string) {
    let time = 0;
    let parts = formattedTime.split(':');
    for (let i = parts.length; i > 0; i--) {
      let num = parseInt(parts[i - 1]);
      num = isNaN(num) ? 0 : num;
      time += num * Math.pow(60, parts.length - i);
    }
    //console.log('time:', time);
    formattedTime = Math.floor(time / 60).toString().padStart(2, '0') + ':' + (time % 60).toString().padStart(2, '0');
    this.formattedTime = formattedTime;
    this.time = time;
    return { formattedTime, time };
  }

  addSpell(spell: WowSpell) {
    let clone = Object.assign({}, spell);
    clone.timeSlot = this;
    this.spells.push(clone);
  }

  removeSpell(spell: WowSpell){
    this.spells = this.spells.filter(x => x.player?.id !== spell.player?.id || x.spellId !== spell.spellId)
  }

  toNote(addon: NoteAddon, players?: WowPlayer[]){
    let note = '';
    let cooldowns:string[] = [];
    switch(addon){
      case NoteAddon.AngryAssignments:
        console.log('aa note');
        cooldowns = this.spells.map(s => {
          let className = s.player?.wowClass.cssName;
          let showPlayerName = (players?.filter(p => s.player != null && p.wowSpec.name === s.player.wowSpec.name).length ?? 0) > 1;
          return `|c${className}${showPlayerName ? s.player?.name + '-' : ''}${s.name}|r`;
        });
        note = `${this.formattedTime} ${this.name}: ${cooldowns.join(',')}`;
        console.log(note);
      break;
      case NoteAddon.ExorsusRaidTools:
        cooldowns = this.spells.map(s => {
          let classColor = s.player?.wowClass.hexColor;
          let showPlayerName = (players?.filter(p => s.player != null && p.wowSpec.name === s.player.wowSpec.name).length ?? 0) > 1;
          return `|cFF${classColor}${showPlayerName ? s.player?.name + '-' : ''}${s.name}|r`;
        })
        note = `${this.formattedTime} ${this.name}: ${cooldowns.join(',')}`;
        break;

    }
    return note;
  }
}

export default TimeSlot;