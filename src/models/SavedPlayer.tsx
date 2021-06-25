import WowClasses, { WowPlayer } from "../WowData";

class SavedPlayer {
  name: string = '';
  column: number = 0;
  className: string = '';
  classCssName: string = '';
  specName: string = '';
  talentIds: number[] = [];
  constructor(player?: WowPlayer){
    if(player == null) return;
    this.name = player.name;
    this.column = player.column;
    this.className = player.wowClass.name;
    this.classCssName = player.wowClass.cssName;
    this.specName = player.wowSpec.name;
    this.talentIds = player.wowTalents.filter(x => x.isEnabled).map(x => x.spellId);
  }

  toPlayer() {
    let wowClass = WowClasses.find(x => x.name === this.className);
    let spec = wowClass?.specs.find(x => x.name === this.specName);
    let talents = spec?.talents.map(x => {
      x.isEnabled = this.talentIds.find(t => t === x.spellId) != null;
      return x;
    });

    if(wowClass != null && spec != null && talents != null){
      let player = new WowPlayer(this.name, wowClass, spec, talents);
      player.column = this.column;
      return player;
    }
    return null;
  }
}

export default SavedPlayer;