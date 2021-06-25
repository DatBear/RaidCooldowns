import React from 'react';
import BaseComponent from './BaseComponent';
import TimeSlot from '../models/TimeSlot';

type AddTimeSlotProps = {
  addTimeSlot: (timeSlot: TimeSlot) => void;
};

type AddTimeSlotState = {
  name: string;
  formattedTime: string;
  time: number;
};

class AddTimeSlotComponent extends BaseComponent<AddTimeSlotProps, AddTimeSlotState> {
  constructor(props: AddTimeSlotProps) {
    super(props);
    this.state = {
      name: '',
      formattedTime: '',
      time: 0
    }

    this.handleTimeChange = this.handleTimeChange.bind(this);
    this.addTimeSlot = this.addTimeSlot.bind(this);
  }

  handleTimeChange() {
    let timeSlot = new TimeSlot();
    return (x: React.FocusEvent<HTMLInputElement>) => {
      timeSlot.setTime(x.target.value);
      this.setState({ formattedTime: timeSlot.formattedTime, time: timeSlot.time });
    };
  }

  addTimeSlot() {
    let timeSlot = new TimeSlot(this.state.name);
    timeSlot.setTime(this.state.formattedTime);
    this.props.addTimeSlot(timeSlot);
    this.setState({ name: '', formattedTime: '', time: 0 })
  }

  render() {
    return <div className='form-inline'>
      <input type='text' placeholder='Time' className='timeslot-time form-control form-control-sm' value={this.state.formattedTime} onChange={this.handleInputChange('formattedTime')} onBlur={this.handleTimeChange()} />
      <input type='text' placeholder='Name' className='timeslot-name form-control form-control-sm' value={this.state.name} onChange={this.handleInputChange('name')} />
      <button onClick={this.addTimeSlot} className='btn btn-sm btn-success'>+</button>
    </div>
  }
}

export default AddTimeSlotComponent;