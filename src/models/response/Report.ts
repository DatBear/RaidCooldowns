import Fight from "./Fight";
import Player from "./Player";

class Report{
  hasAbilityData!: boolean;
  code!: string;
  players!: Player[];
  fights!: Fight[];
}

export default Report;