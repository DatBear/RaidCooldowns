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
  removeTimeSlot: (timeSlot: TimeSlot) => void;
};

type TimeSlotTableState = {
  canRemove: boolean;
};

class TimeSlotTableComponent extends BaseComponent<TimeSlotTableProps, TimeSlotTableState> {
  constructor(props: TimeSlotTableProps) {
    super(props);
    this.state = {
      canRemove: true
    };
  }

  toggleCanRemove() {
    this.setState({ canRemove: !this.state.canRemove });
  }

  updateParents(){
    this.props.updateParents();
  }

  render() {
    return <div>
      <table className='table table-bordered table-dark table-sm vertical-center table-timeslots'>
        <thead>
          <tr>
            {this.state.canRemove && <th>x</th>}
            <th>Time</th>
            <th>Ability</th>
            {this.props.players.filter(x => x.wowSpec.isHealer).map((x, idx) => {
              return <th key={idx} className={`player-th text-${x.wowClass.cssName}`}>{x.name}</th>
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
              let spellTimings = this.props.timeSlots.filter(ts => ts.spells.find(s => s.player?.id === spell.player?.id && s.spellId === spell.spellId)).map(ts => ts.time);
              let maxBefore = Math.max(...spellTimings.filter(t => t < x.time));
              let minAfter = Math.min(...spellTimings.filter(t => t > x.time));
              usable = x.time >= maxBefore + spell.cd && x.time + spell.cd <= minAfter && x.spells.every(x => x.player?.id !== spell.player?.id || x.spellId !== spell.spellId);
            }
            return <TimeSlotComponent key={x.id} canRemove={this.state.canRemove} timeSlot={x} selectedSpell={this.props.selectedSpell} selectedSpellUsable={usable} selectSpell={this.props.selectSpell}
              players={this.props.players} updateParents={this.forceUpdate.bind(this)} reSort={this.props.reSort} removeSlot={this.props.removeTimeSlot} />
          })}
        </tbody>
      </table>
    </div>
  }
}

export default TimeSlotTableComponent;