import React from 'react';
import BaseComponent from './BaseComponent';
import {WowSpell, WowPlayer} from '../WowData';
import '../css/player.css';

type PlayerListProps = {
  players: WowPlayer[],
  selectSpell: (spell?: WowSpell) => void,
  selectedSpell?: WowSpell,
};

type PlayerListState = {
};

class PlayerListComponent extends BaseComponent<PlayerListProps, PlayerListState> {
  constructor(props: PlayerListProps){
    super(props);
    this.selectSpell = this.selectSpell.bind(this);
    this.removePlayer = this.removePlayer.bind(this);
  }

  selectSpell(spell: WowSpell) {
    return () => {
      WowSpell.equals(this.props.selectedSpell, spell) ?  this.props.selectSpell(undefined) : this.props.selectSpell(spell);
      //this.props.selectedSpell?.spellId === spell?.spellId ? this.props.selectSpell(undefined) : this.props.selectSpell(spell);
    };
  }

  removePlayer() {

  }

  render() {
    return <div className='player-container'>
      Players:<br/>
      {this.props.players.length === 0 && <div className='text-muted'>No Players found. Add a player to get started.</div>}
      
        {this.props.players.map(x => {
          return <div key={x.name} className={`player bold text-${x.wowClass.cssName} border-${x.wowClass.cssName} rounded`}>
            <div>{x.name}</div>
            {x.cooldowns.map(cd => {
              let wowheadData = `spell=${cd.spellId}`;
              let className = `spell btn btn-sm ${(WowSpell.equals(this.props.selectedSpell, cd) ? `btn-${cd.player?.wowClass.cssName} selected` : 'btn-link')}`
              //`spell btn btn-sm btn-link ${(this.props.selectedSpell === cd ? 'selected' : '')}`
              return <a key={cd.spellId} href='#' data-wowhead={wowheadData} className={className} onClick={this.selectSpell(cd)}>{cd.name}</a>
            })}
          </div>;
        })}
    </div>;
  }
}

export default PlayerListComponent;