import BaseComponent from "./BaseComponent";
import React from "react";
import TimeSlot from "../models/TimeSlot";
import SavedTimings from "../models/SavedTimings";
import SavedTimeSlot from "../models/SavedTimeSlot";

type LoadTimingsProps = {
  timeSlots: TimeSlot[];
  loadTimeSlots: (timeSlots: TimeSlot[]) => void;
};

type LoadTimingsState = {
  timingsSaveName: string;
  timings: SavedTimings[];
};

class LoadTimingsComponent extends BaseComponent<LoadTimingsProps, LoadTimingsState>{
  constructor(props: LoadTimingsProps) {
    super(props);

    let timings = this.loadArray('savedTimings', SavedTimings);

    //let timingsStorage = JSON.parse(localStorage.getItem('savedTimings') ?? '[]');
    //let timings = timingsStorage.map((x: any) => plainToClass(SavedTimings, x));
    //timings.forEach((x: SavedTimings) => x.loadChildren());

    this.state = {
      timingsSaveName: '',
      timings: timings,
    };

    this.saveCurrentTimings = this.saveCurrentTimings.bind(this);
    this.removeTimings = this.removeTimings.bind(this);
    this.loadTimings = this.loadTimings.bind(this);
  }

  saveCurrentTimings() {
    let timings = this.state.timings.map(x => x);
    let savedTimings = this.state.timings.find(x => x.name === this.state.timingsSaveName);
    if (savedTimings != null) {
      savedTimings.timeSlots = this.props.timeSlots.map(x => new SavedTimeSlot(x));
    } else {
      let newTimings = new SavedTimings(this.state.timingsSaveName, this.props.timeSlots.map(x => new SavedTimeSlot(x)));
      timings.push(newTimings);
    }
    this.setState({ timings });
    this.saveArray('savedTimings', timings);
    //localStorage.setItem('savedTimings', JSON.stringify(timings));
  }

  removeTimings(timing: SavedTimings) {
    return (() => {
      let timings = this.state.timings;
      timings = timings.filter(x => x.name !== timing.name);
      this.setState({timings});
      this.saveArray('savedTimings', timings);
      //localStorage.setItem('savedTimings', JSON.stringify(timings));
    });
  }

  loadTimings(timing: SavedTimings) {
    return (() => {
      let timeSlots = timing.timeSlots.map(x => x.toTimeSlot(undefined) ?? TimeSlot.default);
      if(timeSlots != null && timeSlots.every(x => x !== TimeSlot.default)) {
        this.props.loadTimeSlots(timeSlots);
      }
    });
  }

  render() {
    return <div className='row'>
      {this.state.timings.length > 0 && <>
        <div className='col-12'>
          <h5>Saved Timings:</h5>
        </div>
        <div className='col-12'>
          <table style={{width: '100%', marginLeft: '20px' }}>
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th>Options</th>
            </tr>
            {this.state.timings.map(x => {
              let timeRange = `${x.timeSlots[0].formattedTime}-${x.timeSlots[x.timeSlots.length-1].formattedTime}`;
              return <tr key={x.name}>
                <td>{x.name}</td>
                <td>{x.timeSlots.length} timings, {timeRange}</td>
                <td>
                  <button onClick={this.loadTimings(x)} className='btn btn-sm link-success'>Load</button>
                  <button onClick={this.removeTimings(x)} className='btn btn-sm link-danger'>x</button>
                </td>
              </tr>
            })}
          </table>
        </div>
      </>}
      
      
      <div className='col-12'>
        <h5>Save Current Timings:</h5>
      </div>
      <div className='col-8'>
        <input value={this.state.timingsSaveName} onChange={this.handleInputChange('timingsSaveName')} placeholder='Name' className='form-control' />
      </div>
      <div className='col-4'>
        {this.state.timingsSaveName && <button onClick={this.saveCurrentTimings} className='btn link-success'>Save</button>}
      </div>
    </div>
  }

}

export default LoadTimingsComponent;