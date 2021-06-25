import { WowSpell } from "../WowData";

class SavedWowSpell {
  spellId: number;
  playerName: string;
  
  constructor(spell: WowSpell) {
    this.spellId = spell.spellId;
    this.playerName = spell.player?.name ?? '';
  }
}

export default SavedWowSpell;