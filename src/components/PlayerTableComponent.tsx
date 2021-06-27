import React from 'react';
import BaseComponent from './BaseComponent';
import WowClasses, { WowSpell, WowClass, WowSpec, WowTalent, WowPlayer } from '../WowData';
import TimeSlot from '../models/TimeSlot';
import '../css/player.css';
import { debug } from 'console';


type PlayerTableProps = {
  players: WowPlayer[],
  timeSlots: TimeSlot[],
  selectSpell: (spell?: WowSpell) => void,
  selectedSpell?: WowSpell,
  isOptimizing: boolean,
};

type PlayerTableState = {
};

class PlayerTableComponent extends BaseComponent<PlayerTableProps, PlayerTableState>{
  constructor(props: PlayerTableProps){
    super(props);
    this.selectSpell = this.selectSpell.bind(this);
    this.removePlayer = this.removePlayer.bind(this);
    this.toggleTalent = this.toggleTalent.bind(this);
    this.optimizations = this.optimizations.bind(this);
  }

  selectSpell(spell: WowSpell) {
    return () => {
      WowSpell.equals(this.props.selectedSpell, spell) ?  this.props.selectSpell(undefined) : this.props.selectSpell(spell);
    };
  }

  removePlayer() {
  }

  toggleTalent(player: WowPlayer, talent: WowTalent) {
    return () => {
      let spell = player.cooldowns.find(s => s.spellId === talent.spellId);
      talent.isEnabled = !talent.isEnabled;
      if(spell != null){
        talent.apply(spell, talent.isEnabled);
      }
      this.forceUpdate();
    };
  }

  optimizations(player: WowPlayer, spell: WowSpell) {
    console.log('optimizing', spell.name);
    let currentUses = this.props.timeSlots.filter(ts => ts.spells.find(s => s.spellId == spell.spellId && s.player?.id == player.id)).map(x => x.time);
    console.log(currentUses);
    let remainingTimeSlots = this.props.timeSlots
      .filter(ts => currentUses.find(x => x == ts.time) == null);//timeslot is not already used
    let availableTimes = [];
    for(const time of remainingTimeSlots.map(x => x.time)){
      let maxBefore = Math.max(...currentUses.filter(t => t < time));
      let minAfter = Math.min(...currentUses.filter(t => t > time));
      let usable = time >= maxBefore + spell.cd && time + spell.cd <= minAfter;
      if(usable){
        availableTimes.push(time);
      }
    }
    return [availableTimes.length > 0 ? 'unoptimized' : 'optimized', availableTimes.length];
  }

  componentDidUpdate() {
    (window as any).$WowheadPower.refreshLinks(true);
  }

  render() {
    return <div className='player-container'>
      <table className='table table-dark table-sm vertical-center table-players'>
        <thead>
          <tr>
            <th>Name</th>
            <th>Options</th>
            <th>Cooldowns</th>
          </tr>
        </thead>
        <tbody>
          {this.props.players.map((p, idx) => {
            return <tr key={idx} className={`player-row text-${p.wowClass.cssName}`}>
              <td>{p.name}</td>
              <td>
                {p.wowTalents.map(t => {
                  let wowheadData = `spell=${t.spellId}`;
                  let className = `spell-icon ${t.isEnabled ? 'enabled' : 'disabled'}`;
                  return <a key={t.spellId} href='#' data-wowhead={wowheadData} className={className} onClick={this.toggleTalent(p, t)} data-wh-rename-link='false' data-wh-icon-size='small'></a>
                })}
              </td>
              <td>
                {p.cooldowns.filter(x => x.isEnabled).map((cd, idx_) => {
                  let isSelected = WowSpell.equals(this.props.selectedSpell, cd);
                  let wowheadData = `spell=${cd.spellId}`;
                  let opts = this.optimizations(p, cd);
                  let optimizationClass = this.props.isOptimizing && !isSelected ? `o-${opts[0]}` : '';
                  let className = `spell btn btn-sm ${(isSelected ? `btn-${cd.player?.wowClass.cssName} selected` : 'btn-link')} ${optimizationClass}`
                  return <span key={idx_}>
                    <a href='#' data-wowhead={wowheadData} className={className} onClick={this.selectSpell(cd)}>{cd.name}{this.props.isOptimizing && !isSelected && opts[1] != 0 && <> [{opts[1]}]</>}</a>
                  </span>
                })}
              </td>
            </tr>
          })}
        </tbody>
      </table>
    </div>
  }

}

export default PlayerTableComponent;