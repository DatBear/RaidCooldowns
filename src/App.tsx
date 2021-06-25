import React, { Component } from 'react';
import WowClasses, { WowPlayer, WowSpell } from './WowData';
import TimeSlot from './models/TimeSlot';
import AddPlayerComponent from './components/AddPlayerComponent';
import PlayerListComponent from './components/PlayerListComponent';
import PlayerTableComponent from './components/PlayerTableComponent';
import AddTimeSlotComponent from './components/AddTimeSlotComponent';
import './App.css';
import TimeSlotTableComponent from './components/TimeSlotTableComponent';
import { plainToClass } from "class-transformer"; 
import LoadSaveComponent from './components/LoadSaveComponent';
import ExportNoteComponent from './components/ExportNoteComponent';


type AppProps = {
};

type AppState = {
  players: WowPlayer[],
  timeSlots: TimeSlot[],
  selectedSpell?: WowSpell,
};

class App extends Component<AppProps, AppState> {
  constructor(props: AppProps) {
    super(props);
    let nzothTimeSlots = [
      new TimeSlot('Torment #1', '00:25').setId(),
      new TimeSlot('Torment #2', '00:55').setId(),
      new TimeSlot('Mindgate #1', '01:00').setId(),
      new TimeSlot('Torment #3', '01:15').setId(),
      new TimeSlot('Torment #4', '02:05').setId(),
      new TimeSlot('Torment #5', '03:25').setId(),
      new TimeSlot('Torment #6', '03:50').setId(),
      new TimeSlot('Mindgate #2', '04:00').setId(),
      new TimeSlot('Torment #7', '04:15').setId(),
      new TimeSlot('Torment #8', '05:05').setId(),
      new TimeSlot('Anguish #1', '06:30').setId(),
      new TimeSlot('Anguish #2', '06:50').setId(),
      new TimeSlot('Anguish #3', '07:25').setId(),
      new TimeSlot('Anguish #4', '07:45').setId(),
      // new TimeSlot('C. Protocol #1', '09:13').setId(),
      // new TimeSlot('C. Protocol #2', '09:29').setId(),
      // new TimeSlot('C. Protocol #3', '09:53').setId(),
      // new TimeSlot('C. Protocol #4', '10:20').setId(),
      // new TimeSlot('Anguish #5', '10:50').setId(),
      // new TimeSlot('Anguish #6', '11:10').setId(),
      // new TimeSlot('Anguish #7', '11:45').setId(),
      // new TimeSlot('Anguish #8', '12:05').setId(),
    ].sort((a, b) => a.time - b.time);

    console.log();
    let json = JSON.stringify(nzothTimeSlots);
    let deserialized = plainToClass(TimeSlot, JSON.parse(json));
    console.log('deserialized', deserialized);

    this.state = {
      players: [],
      timeSlots: [...deserialized],
    };
    console.log(WowClasses);
    this.addPlayer = this.addPlayer.bind(this);
    this.addTimeSlot = this.addTimeSlot.bind(this);

    this.selectSpell = this.selectSpell.bind(this);
    this.reSort = this.reSort.bind(this);

    this.loadPlayers = this.loadPlayers.bind(this);
    this.loadTimeSlots = this.loadTimeSlots.bind(this);
  }

  addPlayer(player: WowPlayer) {
    console.log('app.addPlayer:', player);
    player.column = player.wowSpec.isHealer ? this.state.players.filter(x => x.wowSpec.isHealer).length : 10 + this.state.players.filter(x => !x.wowSpec.isHealer).length;
    let players = [...this.state.players, player].sort((a, b) => a.column - b.column);
    this.setState({ players });
  }

  addTimeSlot(timeSlot: TimeSlot) {
    if (timeSlot.id === 0) timeSlot.setId();
    this.setState({ timeSlots: [...this.state.timeSlots, timeSlot].sort((a, b) => a.time - b.time) });
  }

  selectSpell(spell?: WowSpell) {
    this.setState({ selectedSpell: spell });
    this.forceUpdate();
  }

  reSort(){
    this.setState({ 
      timeSlots: this.state.timeSlots.sort((a, b) => a.time - b.time),
      players: this.state.players.sort((a, b) => a.column - b.column)
    });
  }

  loadPlayers(players: WowPlayer[]){
    this.setState({ players, timeSlots: [] });
  }

  loadTimeSlots(timeSlots: TimeSlot[]){
    this.setState({timeSlots: timeSlots});
  }

  render() {

    return (
      <div className="container-fluid">
        <div className='row'>
          <div className='col-12'>
          <button type="button" className="btn btn-sm btn-success" data-toggle="modal" data-target="#loadSaveModal">
            Load/Save
          </button>
          <button type='button' className='btn btn-sm btn-success' data-toggle='modal' data-target='#exportNoteModal'>
            Export To Note
          </button>
          </div>
          <div className='col-6'>
            <div className='row'>
              <div className='col-12'>
                <TimeSlotTableComponent timeSlots={this.state.timeSlots} players={this.state.players} selectedSpell={this.state.selectedSpell} selectSpell={this.selectSpell} updateParents={this.forceUpdate.bind(this)} reSort={this.reSort}  />
              </div>
              <div className='col-12'>
                <AddTimeSlotComponent addTimeSlot={this.addTimeSlot} />
              </div>
            </div>
            
          </div>
          <div className='col-6'>
            <div className='row'>
              <div className='col-12'>
                <PlayerTableComponent players={this.state.players} selectSpell={this.selectSpell} selectedSpell={this.state.selectedSpell} />
              </div>
              <div className='col-12'>
                <AddPlayerComponent addPlayer={this.addPlayer} />
              </div>
            </div>
            
          </div>

          <div className='col-12'>
            <LoadSaveComponent timeSlots={this.state.timeSlots} loadTimeSlots={this.loadTimeSlots} players={this.state.players} loadPlayers={this.loadPlayers} />
          </div>
          <div className='col-12'>
            <ExportNoteComponent players={this.state.players} timeSlots={this.state.timeSlots} />
          </div>
        </div>
        
      </div>
    );
  }
}

export default App;
