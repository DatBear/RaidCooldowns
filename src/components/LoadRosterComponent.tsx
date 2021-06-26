import SavedRoster from "../models/SavedRoster";
import BaseComponent from "./BaseComponent";
import { WowPlayer } from "../WowData";
import SavedPlayer from "../models/SavedPlayer";
import React from "react";

type LoadRosterProps = {
  players: WowPlayer[];
  loadPlayers: (players: WowPlayer[]) => void;
};

type LoadRosterState = {
  rosterSaveName: string;
  rosters: SavedRoster[];
}



class LoadRosterComponent extends BaseComponent<LoadRosterProps, LoadRosterState> {

  constructor(props: LoadRosterProps) {
    super(props);

    // let rosterStorage = JSON.parse(localStorage.getItem('savedRosters') ?? '[]');
    // let rosters = rosterStorage.map((x: any) => plainToClass(SavedRoster, x));
    // rosters.forEach((x: SavedRoster) => x.loadChildren());

    let rosters = this.loadArray('savedRosters', SavedRoster);
    this.state = {
      rosterSaveName: '',
      rosters: rosters
    };

    this.saveCurrentRoster = this.saveCurrentRoster.bind(this);
    this.removeRoster = this.removeRoster.bind(this);
    this.loadRoster = this.loadRoster.bind(this);
  }

  saveCurrentRoster() {
    let rosters = this.state.rosters.map(x => x);
    let savedRoster = this.state.rosters.find(x => x.name === this.state.rosterSaveName);
    if (savedRoster != null) {
      savedRoster.players = this.props.players.map(x => new SavedPlayer(x));
    } else {
      var newRoster = new SavedRoster(this.state.rosterSaveName, this.props.players.map(x => new SavedPlayer(x)));
      rosters.push(newRoster);
    }
    this.setState({ rosters });
    this.saveArray('savedRosters', rosters);
    // localStorage.setItem('savedRosters', JSON.stringify(rosters));
  }

  removeRoster(roster: SavedRoster) {
    return (() => {
      let rosters = this.state.rosters;
      rosters = rosters.filter(x => x.name !== roster.name);
      this.setState({ rosters });
      this.saveArray('savedRosters', rosters);
      //localStorage.setItem('savedRosters', JSON.stringify(rosters));
    });
  }

  loadRoster(roster: SavedRoster) {
    return (() => {
      let players = roster.players.map(x => x.toPlayer() ?? WowPlayer.default);
      if (players != null && players.every(x => x !== WowPlayer.default)) {
        this.props.loadPlayers(players);
      }
    });
  }

  render() {
    return <div className='row'>
      <div className='col-12'>
        <h5>Saved Rosters:</h5>
      </div>
      <div className='col-12'>
        {this.state.rosters.map((x, idx) => {
          return <div key={idx} className='row'>
            <div className='col-3'>{x.name}</div>
            <div className='col-5'>{x.players.map((p, idx_) => <span key={idx_} className={`text-${p.classCssName}`}>{p.name},</span>)}</div>
            <div className='col-4'>
              <button onClick={this.loadRoster(x)} className='btn btn-sm btn-success'>Load</button>
              <button onClick={this.removeRoster(x)} className='btn btn-sm btn-danger'>x</button>
            </div>
          </div>
        })}
        {this.state.rosters.length === 0 && <div className='text-muted'>No saved rosters found.</div>}
      </div>
      <div className='col-12'>
        <h5>Save Current Roster:</h5>
      </div>
      <div className='col-8'>
        <input value={this.state.rosterSaveName} onChange={this.handleInputChange('rosterSaveName')} placeholder='Name' className='form-control' />
      </div>
      <div className='col-4'>
        {this.state.rosterSaveName && <button onClick={this.saveCurrentRoster} className='btn btn-success'>Save</button>}
      </div>
    </div>
  }
}

export default LoadRosterComponent;