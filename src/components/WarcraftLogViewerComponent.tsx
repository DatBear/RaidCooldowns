import React from "react";
import Fight from "../models/response/Fight";
import FightEvent from "../models/response/FightEvent";
import FightPlayer from "../models/response/FightPlayer";
import Report from "../models/response/Report";
import TimeSlot from "../models/TimeSlot";
import WarcraftLogsService from "../services/WarcraftLogsService";
import WowClasses, { WowPlayer } from "../WowData";
import WowBosses from "../WowBosses";
import BaseComponent from "./BaseComponent";

type WarcraftLogViewerProps = {
  players: WowPlayer[],
  timeSlots: TimeSlot[],
  warcraftLogsService: WarcraftLogsService
};

type WarcraftLogViewerState = {
  code: string;
  isEditingCode: boolean;
  report?: Report,
  fightId?: number,
  error?: string | null,
  showAllCooldowns: boolean,
};

class WarcraftLogViewerComponent extends BaseComponent<WarcraftLogViewerProps, WarcraftLogViewerState> {
  codeInput: React.RefObject<HTMLInputElement>;

  constructor(props: WarcraftLogViewerProps){
    super(props);
    this.state = {
      code: '',
      isEditingCode: true,
      showAllCooldowns: false,
    };

    this.codeInput = React.createRef<HTMLInputElement>();

    this.selectFight = this.selectFight.bind(this);
    this.fightLength = this.fightLength.bind(this);
    this.toggleShowAllCooldowns = this.toggleShowAllCooldowns.bind(this);
  }

  toggleCodeEdit() {
    this.setState({ isEditingCode: !this.state.isEditingCode }, () => {
      if(this.state.isEditingCode){
        this.codeInput.current?.focus();
      }
    });
  }

  handleCodeChange() {
    return (x: React.ChangeEvent<HTMLInputElement>) => {
      //todo get fight id from this url if it exists
      let input = x.target.value;
      let end = input.indexOf('#') > 0 ? input.indexOf('#') : input.length;
      input = input.substring(0, end);
      let start = input.lastIndexOf('/') > 0 ? input.lastIndexOf('/') + 1 : 0;
      input = input.substring(start);
      if(input.length > 0){
        this.setState({code: input, isEditingCode: false, report: undefined }, () => {
          this.props.warcraftLogsService.getReportData(this.state.code).then(data => {
            this.setState({ report: data, error: null }, () => {
              (window as any).$WowheadPower.refreshLinks(true);
            });
            return data;
          }).catch(e => {
            this.setState({ report: undefined, code: '', error: e});
          });
        });
      }
    };
  }

  toggleShowAllCooldowns(){
    this.setState({ showAllCooldowns: !this.state.showAllCooldowns });
  }

  selectFight(fightId: number){
    this.setState({ fightId: fightId });
  }

  fightLength(fight: Fight){
    let ms = fight.endTime - fight.startTime;
    let mins = Math.floor((ms/1000/60)).toString().padStart(2, '0');
    let secs = Math.round((ms/1000 % 60)).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  }

  readableTime(ms: number) {
    let mins = Math.floor((ms/1000/60)).toString().padStart(2, '0');
    let secs = Math.round((ms/1000 % 60)).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  }

  componentDidMount() {
    // //a6qbKv2dxcT4gGQp //some random log
    // this.props.warcraftLogsService.getReportData('a6qbKv2dxcT4gGQp').then(data => {
    //   console.log('wcl viewer data', data);
    //   this.setState({ report: data, code: data.code, error: null });
    //   return data;
    // }).then(x => {
    //   (window as any).$WowheadPower.refreshLinks(true);
    // }).catch(e => {
    //   this.setState({ report: undefined, code: '', error: e});
    //   console.log(e);
    // });
  }

  groupBy = <T, K extends keyof T>(value: T[], key: K) =>
    value.reduce((acc, curr) => {
    if (acc.get(curr[key])) return acc;
    acc.set(curr[key], value.filter(elem => elem[key] === curr[key]));
    return acc;
  }, new Map<T[K], T[]>());

  render(){
    const threshold = 10;
    let fight = this.state.fightId ? this.state.report?.fights.find(x => x.id === this.state.fightId) : null;
    let missingPlayers = [] as string[];
    let timeSlots = [] as TimeSlot[];
    if(fight != null) {
      timeSlots = this.props.timeSlots.filter(x => fight != null && x.time*1000 < fight.endTime-fight.startTime);//typescript pls :(
      missingPlayers = timeSlots.flatMap(x => x.spells).flatMap(x => x.player)
        .filter(x => x != undefined).filter((x, idx, self) => self.indexOf(x) === idx)
        .filter(x => fight?.players.find(fp => fp.player.name === x?.name) == null)
        .map(x => x?.name ?? '');
    }
    return <div className='wcl-container'>
      Log: {this.state.isEditingCode ? <input ref={this.codeInput} defaultValue={this.state.code} onBlur={this.handleCodeChange()} className='wcl-log-input form-control form-control-sm' placeholder='Warcraftlogs Report URL' /> : <span onClick={() => this.toggleCodeEdit()}>{this.state.code} </span>} 
      {!this.state.isEditingCode && <a onClick={() => this.toggleCodeEdit()} className='link-success' target='_new'>Edit </a> }
      {this.state.code && <a href={`https://www.warcraftlogs.com/reports/${this.state.report?.code}`}>[Link] </a> }
      <button className={`btn link-${this.state.showAllCooldowns ? 'success' : 'danger'}`} onClick={this.toggleShowAllCooldowns}>Show All CDs</button>
      <br/>
      {this.state.error && 
        <div style={{marginTop: '10px'}}>
          <span className='text-danger'>{this.state.error.toString()} - check the report link and try again.</span>
        </div>
      }
      {this.state.report?.fights.map(x => x.encounterId).filter((x, idx, self) => self.indexOf(x) === idx).map((eId, idx) => {
        let boss = WowBosses.find(x => x.encounterId === eId);
        return boss && <div key={eId} className={'wcl-boss'}>
          {boss.name}<br/>
          {this.state.report?.fights.filter(x => x.encounterId === eId).sort((a, b) => a.kill === b.kill ? 0 : a.kill ? -1 : 1).map((f, fightIdx) => {
            return <span key={fightIdx} className={`wcl-boss-fight fight-${f.kill ? 'kill' : 'wipe'}${this.state.fightId === f.id ? ' selected' : ''}`} onClick={() => this.selectFight(f.id)}>{fightIdx+1} ({this.fightLength(f)})</span>
          })}
        </div>
      })} <br/>
      {missingPlayers.length > 0 && !this.state.showAllCooldowns &&
        <div>
          <span className='text-danger'>Error - fight is missing players: {missingPlayers.join(', ')}</span>
        </div>
      }
      {fight &&
        <span className='text-success'>
          {fight.players.flatMap(x => x.fightEvents).length} events found
        </span>
      }
      {/* planned cooldowns */}
      {fight && timeSlots.length > 0 && !this.props.players.every(p => missingPlayers.find(name => name === p.name) != null) &&
        <div>
          <div>
            <table className={'table-wcl'}>
              <thead>
                <tr>
                  <th>Player</th>
                  <th>Ability</th>
                  <th>Planned</th>
                  <th>Actual</th>
                </tr>
              </thead>
              <tbody>
              {this.props.players.map((p, playerIdx) => {
                return missingPlayers.every(x => x != p.name) && p.cooldowns.map((cd, cdIdx) => {
                  let plannedUses = timeSlots.filter(x => x.spells.find(s => s.player?.name === p.name && s.spellId === cd.spellId) != null);
                  let actualUses = fight?.players.find(x => x.player.name === p.name)?.fightEvents.filter(x => x.abilityId === cd.spellId);
                  let abilityRowSpan = Math.max(plannedUses.length, actualUses?.length ?? 0);
                  //todo: refactor finding playerRowSpan
                  let spellIds = p.cooldowns.map(x => x.spellId);
                  let groupedSpells = this.groupBy(timeSlots.flatMap(x => x.spells).filter(x => x.player?.name === p.name), 'spellId');
                  let groupedFightSpells = this.groupBy(fight?.players.find(x => x.player.name === p.name)?.fightEvents.filter(x => p.cooldowns.find(cd => cd.spellId === x.abilityId) != null) ?? [], 'abilityId');
                  let playerRowSpan = 0;
                  spellIds.forEach((k) => playerRowSpan += Math.max(groupedSpells.get(k)?.length ?? 0, groupedFightSpells.get(k)?.length ?? 0));
                  return Array.from({ length: abilityRowSpan }).map((_, idx) => {
                    let plannedUse = plannedUses.length > idx ? plannedUses[idx] : null;
                    let actualUse = actualUses != null && actualUses.length > idx ? actualUses[idx] : null;
                    let isPlanned = actualUse != null && plannedUses.find(x => Math.abs(x.time-(actualUse?.timestamp ?? 0)/1000) < threshold) != null;
                    return <tr key={idx} className={`text-${p.wowClass.cssName} text-center wcl-player`}>
                      {cdIdx === 0 && idx === 0 && <td rowSpan={playerRowSpan} className={`wcl-player-name border-${p.wowClass.cssName}`}>{p.name}</td>}
                      {idx === 0  && <td rowSpan={abilityRowSpan} className={`wcl-ability-name border-${p.wowClass.cssName} text-center vertical-center`}>{idx === 0 ? cd.name : ''}</td>}
                      <td>{plannedUse && <>{this.readableTime(plannedUse.time*1000)}</>}</td>
                      <td className={`cd-${isPlanned ? 'planned' : 'unplanned'}`}>{actualUse && <>{this.readableTime(actualUse.timestamp)}</>}</td>
                    </tr>
                  })
                });
              })}
              </tbody>
            </table>
          </div>
        </div>
      }

      {/* unplanned cooldowns */}
      {fight && this.state.showAllCooldowns && 
        <div>
          <table className='table-wcl'>
            <thead>
              <tr>
                <th>Player</th>
                <th>Ability</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {fight.players.filter(x => x.fightEvents.length > 0).map((p, playerIdx) => {
                let allSpells = WowClasses.flatMap(x => x.specs).flatMap(x => x.spells);
                let cooldowns = p.fightEvents.map(x => x.abilityId).filter((x, idx, self) => self.indexOf(x) === idx);
                let wowClass = WowClasses.find(x => x.name === p.player.className);
                return cooldowns.map((abilityId, idx) => {
                  let actualUses = p.fightEvents.filter(x => x.abilityId === abilityId);
                  let abilityRowSpan = actualUses.length;
                  let playerRowSpan = p.fightEvents.length;

                  return actualUses.map((ability, abilityIdx) => {
                    let abilityName = allSpells.find(x => x.spellId === ability.abilityId)?.name ?? '';
                    return <tr key={abilityIdx} className={`text-${wowClass?.cssName} text-center wcl-player`}>
                      {idx === 0 && abilityIdx === 0 && <td rowSpan={playerRowSpan} className={`wcl-player-name border-${wowClass?.cssName}`}>{p.player.name}</td>}
                      {abilityIdx === 0 && <td rowSpan={abilityRowSpan} className={`wcl-ability-name border-${wowClass?.cssName} text-center vertical-center`}>{abilityName}</td>}
                      <td className='wcl-ability-time'>{this.readableTime(ability.timestamp)}</td>
                    </tr>
                  });
                });
              })}
            </tbody>
          </table>
        </div>
      }
    </div>
  }
}

export default WarcraftLogViewerComponent;