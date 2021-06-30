import BaseComponent from "./BaseComponent";
import { WowPlayer } from "../WowData";
import SavedFight from "../models/SavedFight";
import TimeSlot from "../models/TimeSlot";
import React from "react";
import SavedTimeSlot from "../models/SavedTimeSlot";
import SavedPlayer from "../models/SavedPlayer";

type LoadFightProps = {
  players: WowPlayer[];
  loadPlayers: (players: WowPlayer[]) => void;
  timeSlots: TimeSlot[];
  loadTimeSlots: (timeSlots: TimeSlot[]) => void;
};

type LoadFightState = {
  fightSaveName: string;
  fights: SavedFight[];
};

class LoadFightComponent extends BaseComponent<LoadFightProps, LoadFightState> {
  constructor(props: LoadFightProps){
    super(props);

    //let fightStorage = JSON.parse(localStorage.getItem('savedFights') ?? '[]');
    //let fights = fightStorage.map((x: any) => plainToClass(SavedFight, x));
    //fights.forEach((x: SavedFight) => x.loadChildren());
    let fights = this.loadArray('savedFights', SavedFight);
    console.log('fights');
    console.log(fights);

    this.state = {
      fightSaveName: '',
      fights: fights,
    };

    this.saveCurrentFight = this.saveCurrentFight.bind(this);
    this.removeFight = this.removeFight.bind(this);
    this.loadFight = this.loadFight.bind(this);
  }

  saveCurrentFight() {
    let fights = this.state.fights.map(x => x);
    let savedFight = this.state.fights.find(x => x.name === this.state.fightSaveName);
    let savedPlayers = this.props.players.map(x => new SavedPlayer(x));
    let savedTimeSlots = this.props.timeSlots.map(x => new SavedTimeSlot(x));
    if(savedFight != null){
      savedFight.players = savedPlayers;
      savedFight.timeSlots = savedTimeSlots;
    } else{
      let newFight = new SavedFight(this.state.fightSaveName, savedPlayers, savedTimeSlots);
      fights.push(newFight);
    }
    this.setState({fights});
    this.saveArray('savedFights', fights);
  }

  removeFight(fight: SavedFight) {
    return (() => {
      let fights = this.state.fights;
      fights = fights.filter(x => x.name !== fight.name);
      this.setState({fights});
      this.saveArray('savedFights', fights);
    });
  }

  loadFight(fight: SavedFight) {
    return (() => {
      let players = fight.players.map(x => x.toPlayer() ?? WowPlayer.default);
      let timeSlots = fight.timeSlots.map(x => x.toTimeSlot(players) ?? TimeSlot.default);
      //console.log('fight load');
      //console.log(players);
      //console.log(timeSlots);
      if(players != null && players.every(x => x !== WowPlayer.default) && timeSlots != null && timeSlots.every(x => x !== TimeSlot.default)){
        this.props.loadPlayers(players);
        this.props.loadTimeSlots(timeSlots);
      }
      setTimeout(() => {
        (window as any).$WowheadPower.refreshLinks(true);
      }, 500);
    });
  }

  render(){
    return <div className='row'>
      {this.state.fights.length > 0 && <>
        <div className='col-12'>
          <h5>Saved Fights:</h5>
        </div>
        <div className='col-12'>
          <table style={{width: '100%', marginLeft: '20px' }}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
                <th>Options</th>
              </tr>
            </thead>
            
            <tbody>
              {this.state.fights.map(x => {
                let timeRange = `${x.timeSlots[0].formattedTime}-${x.timeSlots[x.timeSlots.length-1].formattedTime}`;
                return <tr key={x.name} className='saved-fight'>
                  <td>{x.name}</td>
                  <td>{x.players.map(p => <span key={p.name} className={`text-${p.classCssName}`}>{p.name},</span>)}{x.timeSlots.length} timings, {timeRange}</td>
                  <td>
                    <button onClick={this.loadFight(x)} className='btn btn-sm link-success'>Load</button>
                    <button onClick={this.removeFight(x)} className='btn btn-sm link-danger'>x</button>
                  </td>
                </tr>
              })}
            </tbody>
            
          </table>
        </div>
      </>}
      
      <div className='col-12'>
        <h5>Save Current Fight:</h5>
      </div>
      <div className='col-8'>
        <input value={this.state.fightSaveName} onChange={this.handleInputChange('fightSaveName')} placeholder='Name' className='form-control' />
      </div>
      <div className='col-4'>
        {this.state.fightSaveName && <button onClick={this.saveCurrentFight} className='btn link-success'>Save</button>}
      </div>
    </div>
  }
}

export default LoadFightComponent;