import BaseComponent from "./BaseComponent";
import TimeSlot from "../models/TimeSlot";
import React from "react";
import { WowSpell, WowPlayer } from "../WowData";
import TimeSlotComponent from "./TimeSlotComponent";


type TimeSlotTableProps = {
  timeSlots: TimeSlot[];
  players: WowPlayer[];
  selectedSpell?: WowSpell;
  selectSpell: (spell?: WowSpell) => void;
  updateParents: () => void;
  reSort: () => void;
};

type TimeSlotTableState = {

};

class TimeSlotTableComponent extends BaseComponent<TimeSlotTableProps, TimeSlotTableState> {
  constructor(props: TimeSlotTableProps) {
    super(props);
    this.state = {};
  }

  updateParents(){
    this.props.updateParents();
  }

  render() {
    return <div>
      <table className='table table-bordered table-dark table-sm' style={{display: 'inline-block'}}>
        <thead>
          <tr>
            <th>Time</th>
            <th>Ability</th>
            {this.props.players.filter(x => x.wowSpec.isHealer).map(x => {
              return <th key={x.name} className={`player-th text-${x.wowClass.cssName}`}>{x.name}</th>
            })}
            <th>Non-Healing</th>
            <th>+</th>
          </tr>
        </thead>
        <tbody>
          {this.props.timeSlots.map(x => {
            let usable = false;
            if(this.props.selectedSpell != null){
              let spell = this.props.selectedSpell;
              var spellTimings = this.props.timeSlots.filter(ts => ts.spells.find(s => s.player?.id === spell.player?.id && s.spellId === spell.spellId)).map(ts => ts.time);
              var maxBefore = Math.max(...spellTimings.filter(t => t < x.time));
              var minAfter = Math.min(...spellTimings.filter(t => t > x.time));
              usable = x.time >= maxBefore + spell.cd && x.time + spell.cd <= minAfter && x.spells.every(x => x.player?.id !== spell.player?.id || x.spellId !== spell.spellId);
            }
            return <TimeSlotComponent key={x.id} timeSlot={x} selectedSpell={this.props.selectedSpell} selectedSpellUsable={usable} selectSpell={this.props.selectSpell}
            players={this.props.players} updateParents={this.forceUpdate.bind(this)} reSort={this.props.reSort} />
          })}
        </tbody>
      </table>
    </div>
  }
}

export default TimeSlotTableComponent;