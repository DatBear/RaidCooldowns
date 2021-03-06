import TimeSlot from "./models/TimeSlot";

export class WowClass {
  name: string;
  specs: WowSpec[];
  cssName: string;
  hexColor: string = '';

  constructor(name: string, specs: WowSpec[]) {
    this.name = name;
    this.specs = specs;
    this.cssName = name.replace(' ', '').toLowerCase();
  }

  toString() {
    return this.name + ':';
  }
}

export class WowSpec {
  name: string;
  spells: WowSpell[];
  talents: WowTalent[];
  specId: number;
  isHealer: boolean;

  constructor(name: string, spells: WowSpell[], talents: WowTalent[], specId: number = 0, isHealer = true) {
    this.name = name;
    this.spells = spells;
    this.talents = talents;
    this.specId = specId;
    this.isHealer = isHealer;
  }
}

export class WowTalent {
  //don't add functions to this, it's shallow copied when loading rosters
  name: string;
  spellId: number;
  apply: (spell: WowSpell, enabled: boolean) => void;
  isEnabled: boolean = false;

  constructor(name: string, spellId: number, apply: { (spell: WowSpell, enabled: boolean): void; }) {
    this.name = name;
    this.spellId = spellId;
    this.apply = apply.bind(this);
  }
}

export class WowSpell {
  //don't add functions to this, it's shallow copied around
  static default: WowSpell = new WowSpell('', 0, 0);

  player?: WowPlayer;
  timeSlot?: TimeSlot;
  name: string;
  cd: number;
  spellId: number;
  isTalent: boolean;
  isHeal: boolean;
  isEnabled: boolean;

  constructor(name: string, cd: number, spellId: number, isTalent = false, isHeal = true) {
    this.name = name;
    this.cd = cd;
    this.spellId = spellId;
    this.isTalent = isTalent;
    this.isHeal = isHeal;
    this.isEnabled = !isTalent;
    
  }

  static equals(a?: WowSpell, b?: WowSpell){
    return a?.spellId !== 0 && a?.spellId === b?.spellId && a?.player?.id === b?.player?.id;
  }
}

export class WowPlayer {
  private static nextPlayerId: number = 1;
  static default = new WowPlayer('', new WowClass('', []), new WowSpec('', [], []), []);
  static nextColumn: number = 1;
  id: number;
  name: string;
  wowClass: WowClass;
  wowSpec: WowSpec;
  wowTalents: WowTalent[];
  cooldowns: WowSpell[];
  column: number = 0;

  constructor(name: string, wowClass: WowClass, wowSpec: WowSpec, wowTalents: WowTalent[]) {
    this.id = WowPlayer.nextPlayerId++;
    this.name = name;
    this.wowClass = wowClass;
    this.wowSpec = wowSpec;
    this.wowTalents = wowTalents;

    let player = this;
    this.cooldowns = wowSpec.spells.map(x => x).map(x => {
      let spell = Object.assign({}, x);//clone the spell so the talent isn't applied globally.
      //console.log(x, spell);
      spell.player = player;
      let  talent = wowTalents.find(talent => talent.isEnabled && talent.spellId === x.spellId);
      talent?.apply(spell, true);
      return spell;
    });
  }

  setColumn(players: WowPlayer[]){
    this.column = this.wowSpec.isHealer ? players.filter(x => x.wowSpec.isHealer).length : 10 + players.filter(x => !x.wowSpec.isHealer).length;
  }
}

const SpecIds = {
  RestoDruid: 12,
  RestoShaman: 47,
  HolyPaladin: 29,
  HolyPriest: 36,
  Mistweaver: 25,
  Disc: 34,
  DemonHunter: 8,
  Warrior: 57,
  DeathKnight: 3,
};

const SpellIds = {
  //druid
  Tranquility: 740,
  Flourish: 197721,
  TreeOfLife: 33891,

  //shaman
  SpiritLinkTotem: 98008,
  HealingTideTotem: 108280,
  AncestralProtectionTotem: 207399,

  //paladin
  AuraMastery: 31821,
  AvengingWrath: 31884,
  AshenHallow: 316958,
  //DivineShield: 642,

  //monk
  Revival: 115310,

  //any priest
  LeapOfFaith: 73325,

  //disc priest
  PowerWordBarrier: 62618,
  SpiritShell: 109964,

  //holy priest
  DivineHymn: 64843,
  HolyWordSalvation: 265202,
  
  //dh
  Darkness: 196718,//209426?
  //Metamorphosis: 200166,

  //warrior
  RallyingCry: 97462,

  //dk
  AntiMagicZone: 51052,
};

let rdruidSpells = [
  new WowSpell('Tranq', 180, SpellIds.Tranquility),
  new WowSpell('Flourish', 90, SpellIds.Flourish, true),
  new WowSpell('Tree', 180, SpellIds.TreeOfLife, true),
];
let rdruidTalents = [
  new WowTalent('Inner Peace', SpellIds.Tranquility, (spell, enabled) => {
    spell.cd = enabled ? 120 : 180;
  }),
  new WowTalent('Flourish', SpellIds.Flourish, (spell, enabled) => {
    spell.isEnabled = enabled;
  }),
  new WowTalent('Tree of Life', SpellIds.TreeOfLife, (spell, enabled) => {
    spell.isEnabled = enabled;
  }),
];

let druidSpecs = [new WowSpec('Restoration', rdruidSpells, rdruidTalents, SpecIds.RestoDruid)];
const druid = new WowClass('Druid', druidSpecs);

let rshamanSpells = [
  new WowSpell('SLT', 180, SpellIds.SpiritLinkTotem),
  new WowSpell('HTT', 180, SpellIds.HealingTideTotem),
  new WowSpell('APT', 360, SpellIds.AncestralProtectionTotem, true),
];
let rshamanTalents = [
  new WowTalent('APT', SpellIds.AncestralProtectionTotem, (spell, enabled) => {
    spell.isEnabled = enabled;
  }),
];
let shamanSpecs = [new WowSpec('Restoration', rshamanSpells, rshamanTalents, SpecIds.RestoShaman)];
const shaman = new WowClass('Shaman', shamanSpecs);

let hpriestSpells = [
  new WowSpell('Hymn', 180, SpellIds.DivineHymn),
  new WowSpell('Salv', 360, SpellIds.HolyWordSalvation, true),
  new WowSpell('Grip', 90, SpellIds.LeapOfFaith, false, true),
];
let hpriestTalents = [
  new WowTalent('Salv', SpellIds.HolyWordSalvation, (spell, enabled) => {
    spell.isEnabled = enabled;
  }),
];

let dpriestSpells = [
  new WowSpell('Barrier', 180, SpellIds.PowerWordBarrier),
  new WowSpell('Spirit Shell', 60, SpellIds.SpiritShell),
  new WowSpell('Grip', 90, SpellIds.LeapOfFaith, false, true),
];

let priestSpecs = [
  new WowSpec('Holy', hpriestSpells, hpriestTalents, SpecIds.HolyPriest),
  new WowSpec('Discipline', dpriestSpells, [], SpecIds.Disc),
];
const priest = new WowClass('Priest', priestSpecs);

let monkSpells = [
  new WowSpell('Revival', 180, SpellIds.Revival),
];
let monkSpecs = [
  new WowSpec('Mistweaver', monkSpells, [], SpecIds.Mistweaver),
];
const monk = new WowClass('Monk', monkSpecs);

let hpaladinSpells = [
  new WowSpell('AM', 180, SpellIds.AuraMastery),
  new WowSpell('Wings', 120, SpellIds.AvengingWrath),
  new WowSpell('Ashen Hallow', 240, SpellIds.AshenHallow, true),
];
let hpaladinTalents = [
  new WowTalent('Venthyr', SpellIds.AshenHallow, (spell, enabled) => {
    spell.isEnabled = enabled;
  }),
];
let paladinSpecs = [
  new WowSpec('Holy', hpaladinSpells, hpaladinTalents, SpecIds.HolyPaladin),
];
const paladin = new WowClass('Paladin', paladinSpecs);


let havocdhSpells = [
  new WowSpell('Darkness', 180, SpellIds.Darkness, false, false)
];
let dhSpecs = [new WowSpec('Havoc', havocdhSpells, [], SpecIds.DemonHunter, false)]
const dh = new WowClass('DemonHunter', dhSpecs);

let warriorSpells = [
  new WowSpell('Rally', 180, SpellIds.RallyingCry, false, false)
];
let warriorSpecs = [
  new WowSpec('Any', warriorSpells, [], SpecIds.Warrior, false)
];
const warrior = new WowClass('Warrior', warriorSpecs);

let dkSpells = [
  new WowSpell('AMZ', 180, SpellIds.AntiMagicZone, false, false)
];
let dkSpecs = [new WowSpec('Any', dkSpells, [], SpecIds.DeathKnight, false)]
const dk = new WowClass('DeathKnight', dkSpecs);

//setup colors for exorsus... - used in importing

dk.hexColor = 'c31d39';
dh.hexColor = 'a22fc8';
druid.hexColor = 'fe7b09';
//hunter.hexColor = 'A9D271';
//mage.hexColor = '40C7EB';
monk.hexColor = '00FF96';//this is wrong, update it from ert
paladin.hexColor = 'f38bb9';
priest.hexColor = 'FFFFFF';
//rogue.hexColor = 'FFF569';
shaman.hexColor = '006fdc';
//warlock.hexColor = '8787ED';
warrior.hexColor = 'c59a6c';

const classes = [
  druid,
  shaman,
  priest,
  monk,
  paladin,
  dh,
  warrior,
  dk
];

export default classes;