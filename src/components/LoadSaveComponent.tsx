import BaseComponent from "./BaseComponent";
import LoadRosterComponent from './LoadRosterComponent';
import React from "react";
import { WowPlayer } from "../WowData";
import TimeSlot from "../models/TimeSlot";
import LoadTimingsComponent from "./LoadTimingsComponent";
import LoadFightComponent from "./LoadFightComponent";
import LoadType from "../models/LoadType";

type LoadSaveProps = {
  players: WowPlayer[];
  timeSlots: TimeSlot[];
  loadPlayers: (players: WowPlayer[]) => void;
  loadTimeSlots: (timeSlots: TimeSlot[]) => void;
}

type LoadSaveState = {
  activeLoadType: LoadType;
}

class LoadSaveComponent extends BaseComponent<LoadSaveProps, LoadSaveState>{
  constructor(props: LoadSaveProps) {
    super(props);
    this.state = {
      activeLoadType: LoadType.Roster,
    }
  }

  setLoadType(type: LoadType) {
    return () => {
      this.setState({ activeLoadType: type });
    }
  }

  render() {
    return <div className="modal fade modal-dark" id="loadSaveModal" aria-labelledby="exampleModalLabel" aria-hidden="true">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              Load/Save
              <div className='btn-group loadtype-buttons'>
                <button className={`btn btn-sm btn-${this.state.activeLoadType === LoadType.Roster ? 'success' : 'danger'}`} onClick={this.setLoadType(LoadType.Roster)}>Roster</button>
                <button className={`btn btn-sm btn-${this.state.activeLoadType === LoadType.Timings ? 'success' : 'danger'}`} onClick={this.setLoadType(LoadType.Timings)}>Timings</button>
                <button className={`btn btn-sm btn-${this.state.activeLoadType === LoadType.Fight ? 'success' : 'danger'}`} onClick={this.setLoadType(LoadType.Fight)}>Fight</button>
              </div>
            </h5>
            <button type="button" className="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div className="modal-body">
            <div className='container-fluid'>
              {this.state.activeLoadType === LoadType.Roster && <LoadRosterComponent players={this.props.players} loadPlayers={this.props.loadPlayers} />}
              {this.state.activeLoadType === LoadType.Timings && <LoadTimingsComponent timeSlots={this.props.timeSlots} loadTimeSlots={this.props.loadTimeSlots} />}
              {this.state.activeLoadType === LoadType.Fight && <LoadFightComponent players={this.props.players} loadPlayers={this.props.loadPlayers} timeSlots={this.props.timeSlots} loadTimeSlots={this.props.loadTimeSlots} />}
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" data-dismiss="modal">Close</button>
          </div>
        </div>
      </div>
    </div>
  }
}

export default LoadSaveComponent;