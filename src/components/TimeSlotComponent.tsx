import React, { FocusEvent, Fragment } from 'react';
import BaseComponent from './BaseComponent';
import TimeSlot from '../models/TimeSlot';
import { WowSpell, WowPlayer } from '../WowData';

type TimeSlotProps = {
  canRemove: boolean;
  timeSlot: TimeSlot;
  players: WowPlayer[];
  selectedSpell?: WowSpell;
  selectedSpellUsable: boolean;
  selectSpell: (spell?: WowSpell) => void;
  updateParents: () => void;
  reSort: () => void;
  removeSlot: (slot: TimeSlot) => void;
};

type TimeSlotState = {
  isEditingTime: boolean;
  isEditingName: boolean;
  formattedTime: string;
  name: string;
};

class TimeSlotComponent extends BaseComponent<TimeSlotProps, TimeSlotState> {
  private static nextId: number = 1;
  timeInput: React.RefObject<HTMLInputElement>;
  nameInput: React.RefObject<HTMLInputElement>;

  constructor(props: TimeSlotProps) {
    super(props);
    this.state = {
      isEditingTime: false,
      isEditingName: false,
      formattedTime: props.timeSlot.formattedTime,
      name: props.timeSlot.name,
    };

    this.timeInput = React.createRef<HTMLInputElement>();
    this.nameInput = React.createRef<HTMLInputElement>();
    this.toggleTimeEdit = this.toggleTimeEdit.bind(this);
    this.toggleNameEdit = this.toggleNameEdit.bind(this);
    this.handleTimeChange.bind(this);
    this.handleNameChange.bind(this);
    this.selectSpell = this.selectSpell.bind(this);
    this.addSelectedSpell = this.addSelectedSpell.bind(this);
    this.hasSelectedSpell = this.hasSelectedSpell.bind(this);
  }

  toggleTimeEdit() {
    this.setState({ isEditingTime: !this.state.isEditingTime }, () => {
      if(this.state.isEditingTime){
        this.timeInput.current?.focus();
      }
    });
  }

  toggleNameEdit() {
    this.setState({ isEditingName: !this.state.isEditingName }, () => {
      if(this.state.isEditingName){
        this.nameInput.current?.focus();
      }
    });
  }

  handleTimeChange() {
    return (x: React.ChangeEvent<HTMLInputElement>) => {
      let {formattedTime} = this.props.timeSlot.setTime(x.target.value);
      this.setState({formattedTime, isEditingTime: false});
      this.props.reSort();
    };
  }

  handleNameChange() {
    return (x: React.FocusEvent<HTMLInputElement>) => {
      this.props.timeSlot.setName(x.target.value);
      this.setState({name: x.target.value, isEditingName: false})
      this.forceUpdate();
    }
  }

  selectSpell(spell?: WowSpell){
    return () => {
      WowSpell.equals(this.props.selectedSpell, spell) ?  this.props.selectSpell(undefined) : this.props.selectSpell(spell);
      this.props.updateParents();
    };
  }

  addSelectedSpell() {
    if (this.props.selectedSpell === undefined) return;
    if(this.hasSelectedSpell()){
      this.props.timeSlot.removeSpell(this.props.selectedSpell);
    } else{
      this.props.timeSlot.addSpell(this.props.selectedSpell);
    }
    
    this.props.updateParents();
  }

  hasSelectedSpell() {
    let spell = this.props.selectedSpell;
    return this.props.timeSlot.spells.find(x => x.spellId === spell?.spellId && x.player?.id === spell?.player?.id);
  }

  componentDidUpdate(){
    (window as any).$WowheadPower.refreshLinks(true);
  }

  render() {
    let nonHeals = this.props.timeSlot.spells.filter(x => !x.isHeal);
    return <tr>
      {this.props.canRemove && <td className='slot-remove' onClick={() => this.props.removeSlot(this.props.timeSlot)}><a className='link-danger'>x</a></td>}
      <td>{this.state.isEditingTime ? 
        <input className='timeslot-time' ref={this.timeInput} defaultValue={this.state.formattedTime} onBlur={this.handleTimeChange()}></input> : 
        <span onClick={this.toggleTimeEdit}>{this.props.timeSlot.formattedTime}</span>}
      </td>
      <td onClick={this.state.isEditingName ? () => null : this.toggleNameEdit}>
        {this.state.isEditingName 
          ? <input className='timeslot-name' ref={this.nameInput} defaultValue={this.state.name} onBlur={this.handleNameChange()}></input>
          : <span dangerouslySetInnerHTML={{__html: this.props.timeSlot.formattedName}}></span>}
      </td>
      {Array.from(Array(this.props.players.filter(x => x.wowSpec.isHealer).length)).map((_, idx) => {
        let player = this.props.players.find(x => x.column === idx);
        let spells = this.props.timeSlot.spells.filter(x => x.player?.column === idx && x.isHeal);
        let canAddCurrent = this.props.selectedSpell != null && this.props.selectedSpellUsable && this.props.selectedSpell.player?.column === idx;
        return true &&
          <td key={idx}>
            {spells.map((spell, idx) => {
              let isSelected = this.props.selectedSpell?.spellId == spell.spellId && this.props.selectedSpell.player?.id == spell.player?.id;
              let cssName = player?.wowClass.cssName;
              let className = `${isSelected ? 'btn-'+cssName : 'text-'+cssName} pointer ${isSelected ? 'selected spell' : ''}`;
              return <span key={idx} className={className} onClick={this.selectSpell(spell)}>{spell.name}{idx < spells.length-1 ? ' + ' : ''}</span>
            })}
            {canAddCurrent && <span className={`text-${player?.wowClass.cssName} text-faded pointer`} onClick={this.addSelectedSpell}>{spells.length > 0 ? ' + ' : ''}{this.props.selectedSpell?.name}</span>}
          </td>
      })}
      <td>
        {nonHeals.map((spell, idx) => {
          return <Fragment key={idx}>
            <a className={`text-${spell.player?.wowClass.cssName} pointer`} onClick={this.selectSpell(spell)}>{spell.player?.name}-{spell.name}</a>{idx < nonHeals.length-1 ? <br/> : <></>}
          </Fragment> 
        })}
      </td>
      {this.props.selectedSpell != null && <td onClick={this.addSelectedSpell} className={`add-button ${this.props.selectedSpellUsable ? 'usable' : 'unusable'} pointer`}>{this.hasSelectedSpell() ? '-' : '+'}</td>}
      {this.props.selectedSpell == null && <td></td>}
    </tr>
  }
}

export default TimeSlotComponent;