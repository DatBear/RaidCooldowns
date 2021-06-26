import { WowPlayer } from "../WowData";
import BaseComponent from "./BaseComponent";
import React from "react";
import TimeSlot from "../models/TimeSlot";
import NoteAddon from "../models/NoteAddon";

type ExportNoteProps = {
  players: WowPlayer[];
  timeSlots: TimeSlot[];
};

type ExportNoteState = {
  addon: NoteAddon;
  note: string;
};

class ExportNoteComponent extends BaseComponent<ExportNoteProps, ExportNoteState>{
  constructor(props: ExportNoteProps){
    super(props);

    this.state = {
      addon: NoteAddon.None,
      note: '',
    }

    this.export = this.export.bind(this);
  }
  
  export(addon: NoteAddon) {
    let note = this.props.timeSlots.map(x => x.toNote(addon, this.props.players)).join('\n');
    this.setState({addon, note});
    console.log('note', note);
    return note;
  }

  render(){
    return <div className="modal fade modal-dark" id="exportNoteModal" aria-hidden="true">
    <div className="modal-dialog modal-dialog-centered">
      <div className="modal-content">
        <div className="modal-header">
          <h5 className="modal-title">
            Export to Raid Note
          </h5>
          <button type="button" className="close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div className="modal-body">
          <div className='container-fluid'>
            <div className='row'>
              Addon Format:
              <div className='btn-group loadtype-buttons'>
                <button className={`btn btn-sm btn-${this.state.addon === NoteAddon.AngryAssignments ? 'success' : 'danger'}`} onClick={() => this.export(NoteAddon.AngryAssignments)}>AA</button>
                <button className={`btn btn-sm btn-${this.state.addon === NoteAddon.ExorsusRaidTools ? 'success' : 'danger'}`} onClick={() => this.export(NoteAddon.ExorsusRaidTools)}>ERT</button>
              </div>
            </div>
            <div className='row'>
              <div className='col-12'>
                <textarea className='note-area' value={this.state.note} readOnly />
              </div>
            </div>
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

export default ExportNoteComponent;