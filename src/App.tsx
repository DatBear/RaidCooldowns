import React, { Component } from 'react';
import WowClasses, { WowPlayer, WowSpell } from './WowData';
import TimeSlot from './models/TimeSlot';
import AddPlayerComponent from './components/AddPlayerComponent';
import PlayerTableComponent from './components/PlayerTableComponent';
import AddTimeSlotComponent from './components/AddTimeSlotComponent';
import TimeSlotTableComponent from './components/TimeSlotTableComponent';
import LoadSaveComponent from './components/LoadSaveComponent';
import ExportNoteComponent from './components/ExportNoteComponent';
import './App.css';
import SavedTimings from './models/SavedTimings';
import BaseComponent from './components/BaseComponent';
import SavedRoster from './models/SavedRoster';

type AppProps = {
};

type AppState = {
  isDebug: boolean,
  players: WowPlayer[],
  timeSlots: TimeSlot[],
  selectedSpell?: WowSpell,
  isOptimizingPlayers: boolean,
  isOptimizingTimeSlots: boolean,
};

class App extends BaseComponent<AppProps, AppState> {
  constructor(props: AppProps) {
    super(props);
    let isDebug = window.location.href.indexOf('localhost') > -1;

    let savedTimings = this.loadArray('savedTimings', SavedTimings) as SavedTimings[];
    let defaultTimings = savedTimings.find(x => x.name === 'default');
    let defaultTimeSlots = defaultTimings != null ? defaultTimings.timeSlots.map(x => x.toTimeSlot(undefined) ?? TimeSlot.default) : [];

    let savedRosters = this.loadArray('savedRosters', SavedRoster) as SavedRoster[];
    let defaultRoster = savedRosters.find(x => x.name === 'default');
    let defaultPlayers = defaultRoster != null ? defaultRoster.players.map(x => x.toPlayer() ?? WowPlayer.default) : [];

    this.state = {
      isDebug: isDebug,
      players: [...defaultPlayers],
      timeSlots: [...defaultTimeSlots],
      isOptimizingPlayers: false,
      isOptimizingTimeSlots: false,
    };

    this.addPlayer = this.addPlayer.bind(this);
    this.removePlayer = this.removePlayer.bind(this);
    this.addTimeSlot = this.addTimeSlot.bind(this);
    this.removeTimeSlot = this.removeTimeSlot.bind(this);

    this.selectSpell = this.selectSpell.bind(this);
    this.reSort = this.reSort.bind(this);

    this.loadPlayers = this.loadPlayers.bind(this);
    this.loadTimeSlots = this.loadTimeSlots.bind(this);

    this.toggleOptimizingPlayers = this.toggleOptimizingPlayers.bind(this);
    this.toggleOptimizingTimeSlots = this.toggleOptimizingTimeSlots.bind(this);

    this.onKeyDown = this.onKeyDown.bind(this);
  }

  addPlayer(player: WowPlayer) {
    player.column = player.wowSpec.isHealer ? this.state.players.filter(x => x.wowSpec.isHealer).length : 10 + this.state.players.filter(x => !x.wowSpec.isHealer).length;
    let players = [...this.state.players, player].sort((a, b) => a.column - b.column);
    this.setState({ players });
  }

  removePlayer(player: WowPlayer) {
    this.setState({ players: this.state.players.filter(x => x.id !== player.id ) });
  }

  addTimeSlot(timeSlot: TimeSlot) {
    if (timeSlot.id === 0) timeSlot.setId();
    this.setState({ timeSlots: [...this.state.timeSlots, timeSlot].sort((a, b) => a.time - b.time) });
  }

  removeTimeSlot(timeSlot: TimeSlot) {
    this.setState({ timeSlots: this.state.timeSlots.filter(x => x.id !== timeSlot.id) });
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

  toggleOptimizingPlayers(){
    this.setState({
      isOptimizingPlayers: !this.state.isOptimizingPlayers,
      selectedSpell: !this.state.isOptimizingPlayers ? undefined : this.state.selectedSpell,
    });
  }

  toggleOptimizingTimeSlots() {
    this.setState({
      isOptimizingTimeSlots: !this.state.isOptimizingTimeSlots,
      selectedSpell: !this.state.isOptimizingTimeSlots ? undefined : this.state.selectedSpell,
    });
  }

  onKeyDown(e: KeyboardEvent){
    if(e.target !== document.getElementsByTagName('body')[0]) return;
    console.log('keydown', e.key);
    switch(e.key){
      case 'a':
      case 'ArrowLeft':
        this.selectPreviousSpell();
        break;
      case 'd':
      case 'ArrowRight':
        this.selectNextSpell();
        break;
      case 'w':
      case 'ArrowUp':
        this.selectPreviousPlayer();
        break;
      case 's':
      case 'ArrowDown':
        this.selectNextPlayer();
        break;
    }
  }
  
  
  selectPreviousSpell() {
    if(this.state.players.length === 0) return;
    if(this.state.selectedSpell == null) {
      var cds = this.state.players.flatMap(x => x.cooldowns);
      this.setState({ selectedSpell: cds[cds.length-1]});
      return;
    }

    let spell = this.state.selectedSpell;
    let allCds = this.state.players.flatMap(x => x.cooldowns).filter(x => x.isEnabled);
    let idx = allCds.findIndex(x => x.spellId == spell.spellId && x.player?.id == spell.player?.id);
    let nextSpell = idx < 1 ? allCds[allCds.length-1] : allCds[idx-1];
    this.setState({selectedSpell: nextSpell});
  }

  selectNextSpell() {
    if(this.state.players.length === 0) return;
    if(this.state.selectedSpell == null) {
      this.setState({ selectedSpell: this.state.players[0].cooldowns[0] });
      return;
    }

    let spell = this.state.selectedSpell;
    let allCds = this.state.players.flatMap(x => x.cooldowns).filter(x => x.isEnabled);
    let idx = allCds.findIndex(x => x.spellId == spell?.spellId && x.player?.id == spell.player?.id);
    let nextSpell = idx >= allCds.length-1 ? allCds[0] : allCds[idx+1];
    this.setState({ selectedSpell: nextSpell });
  }

  selectPreviousPlayer() {
    if(this.state.players.length === 0) return;
    if(this.state.selectedSpell == null) {
      var player = this.state.players[this.state.players.length-1];
      this.setState({ selectedSpell: player.cooldowns[0]});
      return;
    }
    if(this.state.players.length < 2) return;

    let spell = this.state.selectedSpell;
    let playerIdx = this.state.players.findIndex(x => x.id === spell.player?.id);
    let nextPlayer = playerIdx < 1 ? this.state.players[this.state.players.length-1] : this.state.players[playerIdx-1];
    this.setState({ selectedSpell: nextPlayer.cooldowns[0] });
  }

  selectNextPlayer() {
    if(this.state.players.length === 0) return;
    if(this.state.selectedSpell == null) {
      this.setState({ selectedSpell: this.state.players[0].cooldowns[0]});
      return;
    }
    if(this.state.players.length < 2) return;

    let spell = this.state.selectedSpell;
    let playerIdx = this.state.players.findIndex(x => x.id === spell.player?.id);
    let nextPlayer = playerIdx >= this.state.players.length-1 ? this.state.players[0] : this.state.players[playerIdx+1];
    this.setState({ selectedSpell: nextPlayer.cooldowns[0] });
  }

  componentDidMount(){
    console.log('app mounted');
    document.addEventListener('keydown', this.onKeyDown);
  }

  render() {

    return (
      <div className="container-fluid">
        <div className='row'>
          <div className='col-6'>
            <div className='row'>
              <div className='col-12'>
                <button type='button' className='btn btn-sm link-success' data-toggle='modal' data-target='#loadSaveModal'>
                  Load/Save
                </button>
                <button type='button' className='btn btn-sm link-success' data-toggle='modal' data-target='#exportNoteModal'>
                  Export To Note
                </button>

                {this.state.isDebug && 
                  <button type='button' className={`btn btn-sm link-${this.state.isOptimizingTimeSlots ? 'success' : 'danger'}`} onClick={this.toggleOptimizingTimeSlots}>
                    Optimize
                  </button>
                }
              </div>

              {this.state.timeSlots.length === 0 && 
                <div className='col-12'>
                  <p className='text-muted font-italic'>Add a fight timing below to get started.</p>
                </div>
              }

              {this.state.timeSlots.length > 0 && 
                <div className='col-12'>
                  <TimeSlotTableComponent timeSlots={this.state.timeSlots} players={this.state.players} selectedSpell={this.state.selectedSpell} selectSpell={this.selectSpell} updateParents={this.forceUpdate.bind(this)} reSort={this.reSort} removeTimeSlot={this.removeTimeSlot}  />
                </div>
              }
              
              <div className='col-12'>
                <AddTimeSlotComponent addTimeSlot={this.addTimeSlot} />
              </div>
            </div>
            
          </div>
          <div className='col-6'>
            <div className='row'>
              <div className='col-12'>
                <button type='button' className={`btn btn-sm link-${this.state.isOptimizingPlayers ? 'success' : 'danger'}`} onClick={this.toggleOptimizingPlayers}>
                  Optimize
                </button>
              </div>
              
              {this.state.players.length === 0 && 
                <div className='col-12'>
                  <p className='text-muted font-italic'>Add a player below to get started.</p>
                </div>
              }
              
              {this.state.players.length > 0 && 
                <div className='col-12'>
                  <PlayerTableComponent players={this.state.players} selectSpell={this.selectSpell} selectedSpell={this.state.selectedSpell} timeSlots={this.state.timeSlots} isOptimizing={this.state.isOptimizingPlayers} removePlayer={this.removePlayer} />
                </div>
              }
              
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
