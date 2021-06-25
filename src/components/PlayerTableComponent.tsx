import React from 'react';
import BaseComponent from './BaseComponent';
import WowClasses, { WowSpell, WowClass, WowSpec, WowTalent, WowPlayer } from '../WowData';
import '../css/player.css';

type PlayerTableProps = {
  players: WowPlayer[],
  selectSpell: (spell?: WowSpell) => void,
  selectedSpell?: WowSpell,
};

type PlayerTableState = {
};

class PlayerTableComponent extends BaseComponent<PlayerTableProps, PlayerTableState>{
  constructor(props: PlayerTableProps){
    super(props);
    this.selectSpell = this.selectSpell.bind(this);
    this.removePlayer = this.removePlayer.bind(this);
    this.toggleTalent = this.toggleTalent.bind(this);
  }

  selectSpell(spell: WowSpell) {
    return () => {
      WowSpell.equals(this.props.selectedSpell, spell) ?  this.props.selectSpell(undefined) : this.props.selectSpell(spell);
      //this.props.selectedSpell?.spellId === spell?.spellId ? this.props.selectSpell(undefined) : this.props.selectSpell(spell);
    };
  }

  removePlayer() {
  }

  toggleTalent(player: WowPlayer, talent: WowTalent) {
    return () => {
      var spell = player.cooldowns.find(s => s.spellId === talent.spellId);
      talent.isEnabled = !talent.isEnabled;
      if(spell != null){
        talent.apply(spell, talent.isEnabled);
      }
      console.log(`toggling ${talent.name} ${talent.isEnabled} ${spell?.name}`);
      this.forceUpdate();
    };
  }

  componentDidUpdate() {
    (window as any).$WowheadPower.refreshLinks(true);
  }

  render() {
    return <div className='player-container'>
      Players: <br/>
      <table>
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
                {p.cooldowns.filter(x => x.isEnabled).map(cd => {
                  let wowheadData = `spell=${cd.spellId}`;
                  let className = `spell btn btn-sm ${(WowSpell.equals(this.props.selectedSpell, cd) ? `btn-${cd.player?.wowClass.cssName} selected` : 'btn-link')}`
                  return <a key={cd.spellId} href='#' data-wowhead={wowheadData} className={className} onClick={this.selectSpell(cd)}>{cd.name}</a>
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