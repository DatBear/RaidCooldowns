import React from "react";
import BaseComponent from "./BaseComponent";
import WowClasses, { WowClass, WowPlayer, WowSpec } from '../WowData';
import PlayerTableComponent from "./PlayerTableComponent";
import TimeSlot from "../models/TimeSlot";
import TimeSlotTableComponent from "./TimeSlotTableComponent";

class Player {
  name: string;
  wowClass: WowClass;
  wowSpec: WowSpec;

  constructor(name: string, wowClass: WowClass, wowSpec: WowSpec){
    this.name = name;
    this.wowClass = wowClass;
    this.wowSpec = wowSpec;
  }
}

type ImportProps = {
  loadPlayers: (players: WowPlayer[]) => void;
  loadTimeSlots: (timeSlots: TimeSlot[]) => void;
};

type ImportState = {
  note: string,
  players: WowPlayer[],
  timeSlots: TimeSlot[],
}

class ImportComponent extends BaseComponent<ImportProps, ImportState> {
  constructor(props: ImportProps){
    super(props);

    this.state = {
      note: `{time:00:09}|cffc31d39Anomandër|r{spell:51052}|cfff38bb9Kreesadin|r{spell:316958}|cff006fdcYùnà|r{spell:98008}
{time:00:24}{spell:326851}|cffee5555BP|r |cfffe7b09Koozi|r{spell:33891}|cff006fdcYùnà|r{spell:108280}
{time:00:30}|cffc31d39Nycrotic|r{spell:51052}|cffc59a6cCaketin|r{spell:97462}
{time:01:20}{spell:326851}|cffee5555BP|r |cfff38bb9Kreesadin|r{spell:31821}
{time:01:34}{spell:326851}|cffee5555BP|r Mistyra{spell:62618}
{time:01:42}Adds |cfffe7b09Koozi|r{spell:740}
{time:02:30}|cffc31d39Anomandër|r{spell:51052}|cffa22fc8Hellsyeah|r{spell:196718}
{time:03:40}(|cfffe7b09Nuke Add|r) > |cfffe7b09Koozi|r{spell:33891}
{time:03:45}|cffffff00(Impale1 Personals)|rThru Mirror |cffc59a6cCaketin|r{spell:97462} 
{time:03:55}@Baron |cffc31d39Nycrotic|r{spell:51052}|cff006fdcYùnà|r{spell:108280}
{time:04:20}Thru Mirror |cffffff00Impales2|r Mistyra {spell:109964}|cfff38bb9Kreesadin|r{spell:316958}
{time:05:00}|cffffff00Impale3 |r|cffc31d39Anomandër|r{spell:51052}|cfff38bb9Kreesadin|r{spell:31821}
{time:05:50}|cffffff00Impale4|r Mistyra{spell:62618}
{time:06:20}|cffffff00Impale5 |r|cff006fdcYùnà|r{spell:98008}
{time:06:25}@Gloomveil |cffc31d39Nycrotic|r{spell:51052}|cfffe7b09Koozi|r{spell:740}|cffa22fc8Hellsyeah|r{spell:196718}
P3
{time:07:10}{spell:326851}|cffee5555BP|r1 |cffc59a6cCaketin|r{spell:97462}
{time:07:30}Soaks/|cffff0000Shatter2|r |cffc31d39Anomandër|r{spell:51052}
{time:08:00}|cffff0000Shatter3 |r|cfffe7b09Koozi|r{spell:33891}
{time:08:25}|cffff0000Shatter4|r/{spell:326851}|cffee5555BP|r2 |cfff38bb9Kreesadin|r{spell:31821}
{time:08:45}Soaks/|cffff0000Shatter5|r |cffc31d39Nycrotic|r{spell:51052}Mistyra{spell:62618}|cff006fdcYùnà|r{spell:108280}
{time:09:40}|cffff0000Shatter7|r/{spell:326851}|cffee5555BP|r3 |cff006fdcYùnà|r{spell:98008}|cfffe7b09Koozi|r{spell:740}
{time:10:00}|cff808080WE'RE ALL DEAD|r`,
      players: [],
      timeSlots: [],
    };
    
    this.import = this.import.bind(this);
    this.finishImport = this.finishImport.bind(this);

    this.removePlayer = this.removePlayer.bind(this);
    this.removeTimeSlot = this.removeTimeSlot.bind(this);
  }

  removePlayer(player: WowPlayer) {
    this.setState({ players: this.state.players.filter(x => x.id !== player.id ) });
  }

  removeTimeSlot(timeSlot: TimeSlot) {
    this.setState({ timeSlots: this.state.timeSlots.filter(x => x.id !== timeSlot.id) })
  }

  import(){
    let timeRegex = /\{time:(\d{2}:\d{2})\}/;
    let spellPlayerRegex = /\|cff([0-9a-fA-F]{6})([a-zA-Z\u00C0-\u017F]+?)\|r\s?\{spell:(\d+)\}|([a-zA-Z\u00C0-\u017F]+?)\s?\{spell:(\d+)\}/g

    let splitNote = this.state.note.split('\n').filter(x => x.length > 1);
    let players = [] as WowPlayer[];
    let timeSlots = [] as TimeSlot[];

    for(const line of splitNote) {
      let timeMatch = timeRegex.exec(line);
      let time = timeMatch != null ? timeMatch[1] : 'not found';
      console.log(line, time);
      if(time != null) {
        let slotName = line.replace(timeRegex, '').replace(spellPlayerRegex, '');
        console.log('slot name', slotName);
        let timeSlot = new TimeSlot(slotName);
        timeSlot.setTime(time);
        timeSlot.setId();
        timeSlots.push(timeSlot);
        console.log('time', timeSlot.time);

        let playerMatches = line.matchAll(spellPlayerRegex);
        let match = playerMatches.next();
        
        while(match != null && !match.done) {
          let color = match.value[1] ?? 'ffffff';
          let playerName = match.value[2] ?? match.value[4];
          let spellId = match.value[3] ?? match.value[5];
          let wowClass = WowClasses.find(x => x.hexColor.toLowerCase() === color.toLowerCase());
          let spec = wowClass?.specs.length == 1 ? wowClass.specs[0] : wowClass?.specs.find(x => x.spells.find(s => s.spellId.toString() === spellId) != null);
          if(playerName != null && wowClass != null && spec != null){
            let player = players.find(x => x.name === playerName);
            if(player == null) {
              player = new WowPlayer(playerName, wowClass, spec, spec.talents.map(x => Object.assign({}, x)));

              player.setColumn(players);
              players.push(player);
            }
            

            console.log('spell id', spellId);
            if(spellId != null && parseInt(spellId) != NaN){
              let spell = player.cooldowns.find(x => x.spellId.toString() === spellId);
              if(spell != null){
                timeSlot.addSpell(spell);
              }
            }
            
          }
          match = playerMatches.next();
        }
      }
    }

    players.sort((a, b) => (b.wowSpec.isHealer ? 1 : 0) - (a.wowSpec.isHealer ? 1 : 0))
    players.forEach(x => console.log(x.name, x.wowSpec.name, x.wowClass.name));
    this.setState({
      players: players,//players.map(x => new WowPlayer(x.name, x.wowClass, x.wowSpec, x.wowSpec.talents.map(talent => Object.assign({}, talent)))),
      timeSlots: timeSlots
    });
    setTimeout(() => {
      (window as any).$WowheadPower.refreshLinks(true);
    }, 500);
  }

  finishImport() {
    this.props.loadPlayers(this.state.players);
    this.props.loadTimeSlots(this.state.timeSlots);
    this.setState({
      note: '',
      players: [],
      timeSlots: [],
    });
  }

  render() {
    return <div className="modal fade modal-dark" id="importModal" aria-hidden="true">
      <div className="modal-dialog modal-dialog-centered modal-xl">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              Import from Raid Note
            </h5>
            <button type="button" className="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div className="modal-body">
            <div className='container-fluid'>
              <div className='row'>
                <div className='col-12'>
                  <textarea className='import-note-area' value={this.state.note} onChange={this.handleInputChange('note')} style={{width: '100%'}} />
                </div>
                <div className='col-12'>
                  <a onClick={this.import} className='link-success'>Import</a>
                </div>
                {this.state.timeSlots.length > 0 &&
                  <div className='col-12'>
                    <h5>Preview:</h5>
                  </div>
                }

                {this.state.timeSlots.length > 0 && 
                  <div className='col-12'>
                    <TimeSlotTableComponent players={this.state.players} reSort={()=> null} removeTimeSlot={x => this.removeTimeSlot(x)} selectSpell={() => null} timeSlots={this.state.timeSlots} updateParents={() => null} />
                  </div>
                }

                {this.state.players.length > 0 && 
                  <div className='col-12'>
                    <div className='players-preview'>
                      <PlayerTableComponent players={this.state.players} removePlayer={x => this.removePlayer(x)} selectSpell={x => null} timeSlots={[]} isOptimizing={false} />
                    </div>
                  </div>
                }

                {this.state.players.length > 0 && this.state.timeSlots.length > 0 &&
                  <div className='col-12'>
                    <a className='link-success' onClick={this.finishImport} data-dismiss='modal'>Finish Import</a>
                  </div>
                }

              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" data-dismiss="modal">Close</button>
          </div>
        </div>
      </div>
    </div>
  }

}

export default ImportComponent;