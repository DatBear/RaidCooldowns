import React from 'react';
import BaseComponent from './BaseComponent';
import WowClasses, { WowClass, WowSpec, WowTalent, WowPlayer } from '../WowData';

type AddPlayerProps = {
  addPlayer: (player: WowPlayer) => void
};

type AddPlayerState = {
  name: string;
  selectedClass: string,
  selectedSpec: string,
  selectedTalents: WowTalent[],
};

class AddPlayerComponent extends BaseComponent<AddPlayerProps, AddPlayerState> {

  constructor(props: AddPlayerProps) {
    super(props);
    this.state = {
      name: '',
      selectedClass: '',
      selectedSpec: '',
      selectedTalents: [],
    };
    this.addPlayer = this.addPlayer.bind(this);
    this.selectClass = this.selectClass.bind(this);
    this.selectSpec = this.selectSpec.bind(this);
  }

  addPlayer() {
    if (this.state.selectedClass == null || this.state.selectedSpec == null) {
      console.error('error adding player: class or spec not selected.');
      return;
    }

    var wowClass = WowClasses.find((value: WowClass) => value.name === this.state.selectedClass);
    var spec = wowClass?.specs.find((value: WowSpec) => value.name === this.state.selectedSpec);
    var talents = spec?.talents.map(x => Object.assign({}, x)) ?? [];

    if (wowClass != null && spec != null) {
      let player = new WowPlayer(this.state.name, wowClass, spec, talents)
      this.props.addPlayer(player);
      this.setState({
        name: '',
        selectedClass: '',
        selectedSpec: '',
        selectedTalents: [],
      });
    }
  }

  classChange() {
    return (e: React.ChangeEvent<HTMLSelectElement>) => {
      console.log(e.target);
    };
  }

  selectClass(className: string) {
    return () => {
      this.setState({ selectedClass: className, selectedSpec: '' });
    }
  }

  selectSpec(className: string, specName: string) {
    return () => {
      if(className == null) return;
      this.setState({ 
        selectedClass: className,
        selectedSpec: specName
      });

      
    }
  }

  componentDidUpdate(){
    (window as any).$WowheadPower.refreshLinks(true);
  }

  render() {
    var currentClass = WowClasses.find(x => x.name === this.state.selectedClass);
    var currentSpec = currentClass?.specs.find(x => x.name === this.state.selectedSpec);
    var currentTalents = currentSpec?.talents;
    //console.log('rendering class: ', currentClass?.name, 'spec: ', currentSpec?.name);
    return <div className='row'>
      <div className='col-12'>Add Player:</div>
      <div className='col-4 col-sm-2'>
        <input type='text' value={this.state.name} onChange={this.handleInputChange('name')} placeholder='Name' className='player-name form-control form-control-sm' />
      </div>
      
      <div className='col-12'>
        {this.state.name && WowClasses.map((cls, idx) => {
          return cls.specs.map((spec, idx) => {
            let enabled = cls.name == currentClass?.name && spec.name == currentSpec?.name;
            let className = `spec-icon ${enabled ? 'enabled' : 'disabled'}`;
            return <span key={idx} className={className} style={{backgroundPositionX: `${-36 * spec.specId}px`}} onClick={this.selectSpec(cls.name, spec.name)}></span>
          });
        })}
      </div>

      <div className='col-12'>
        {currentTalents && currentTalents.length > 0 ?
          <>
            {currentTalents.map(x => {
              let wowheadData = `spell=${x.spellId}`;
              let className = `spell-icon ${x.isEnabled ? 'enabled' : 'disabled'}`;
              return <a key={x.spellId} onClick={e => { x.toggle.bind(x)(); this.forceUpdate(); }} href='#' className={className} data-wowhead={wowheadData} data-wh-icon-size='medium'></a>
              return <button key={x.spellId} onClick={e => { x.toggle.bind(x)(); this.forceUpdate(); }} className={' btn btn-sm talent' + (x.isEnabled ? ' btn-success' : ' btn-danger')}>{x.name}</button>;
            })}
          </> : '' }
      </div>
      <div className='col-12'>
        {currentSpec && <div><button onClick={e => this.addPlayer()} className='btn btn-sm btn-success'>Add Player</button></div>}
      </div>
      
    </div>
  }
}

export default AddPlayerComponent;