import FightPlayer from "./FightPlayer";

class Fight {
  id!: number;
  encounterId!: number;
  startTime!: number;
  endTime!: number;
  kill!: boolean;
  fightPercentage!: number;
  players!: FightPlayer[];
}

export default Fight;