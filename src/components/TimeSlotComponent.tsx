import React, { FocusEvent } from 'react';
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
      this.props.timeSlot.name = x.target.value;
      this.setState({name: x.target.value, isEditingName: false})
      this.forceUpdate();
    }
  }

  selectSpell(spell?: WowSpell){
    return () => {
      console.log('select spell', spell);
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

  render() {
    return <tr>
      {this.props.canRemove && <td className='slot-remove' onClick={() => this.props.removeSlot(this.props.timeSlot)}>-</td>}
      <td>{this.state.isEditingTime ? 
        <input className='timeslot-time' ref={this.timeInput} defaultValue={this.state.formattedTime} onBlur={this.handleTimeChange()}></input> : 
        <span onClick={this.toggleTimeEdit}>{this.props.timeSlot.formattedTime}</span>}
      </td>
      <td>{this.state.isEditingName ? 
        <input className='timeslot-name' ref={this.nameInput} defaultValue={this.state.name} onBlur={this.handleNameChange()}></input>
        : <span onClick={this.toggleNameEdit}>{this.props.timeSlot.name}</span>}
      </td>
      {Array.from(Array(this.props.players.filter(x => x.wowSpec.isHealer).length)).map((_, idx) => {
        var player = this.props.players.find(x => x.column === idx);
        var spells = this.props.timeSlot.spells.filter(x => x.player?.column === idx && x.isHeal);
        var spellNames = spells.map(x => x.name).join('+');
        return <td key={idx}>
          <span className={`text-${player?.wowClass.cssName}`} onClick={this.selectSpell(spells.find(x => x !== undefined))}>{spellNames}</span>
        </td>;
      })}
      <td>
        {this.props.timeSlot.spells.filter(x => !x.isHeal).map((x, idx) => {
          return <a href='#' key={idx} className={`text-${x.player?.wowClass.cssName}`} onClick={this.selectSpell(x)}>{x.player?.name}-{x.name}</a>
        })}
      </td>
      {this.props.selectedSpell != null && <td onClick={this.addSelectedSpell} className={`add-button ${this.props.selectedSpellUsable ? 'usable' : 'unusable'}`}>{this.hasSelectedSpell() ? '-' : '+'}</td>}
      {this.props.selectedSpell == null && <td></td>}
    </tr>
  }
}

export default TimeSlotComponent;