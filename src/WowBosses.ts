import { stringify } from "querystring";

export class WowBoss {
  name: string;
  encounterId: number; //warcraftlogs encounter id

  constructor(name: string, encounterId: number) {
    this.name = name;
    this.encounterId = encounterId;
  }
}

const bosses = [
  //Castle Nathria
  new WowBoss('Shriekwing', 2398),
  new WowBoss('Huntsman Altimor', 2418),
  new WowBoss('Hungering Destroyer', 2383),
  new WowBoss('Sun King\'s Salvation', 2402),
  new WowBoss('Artificer Xy\'mox', 2405),
  new WowBoss('Lady Inerva Darkvein', 2406),
  new WowBoss('The Council of Blood', 2412),
  new WowBoss('Sludgefist', 2399),
  new WowBoss('Stone Legion Generals', 2417),
  new WowBoss('Sire Denathrius', 2407),
  //Sanctum of Domination
  new WowBoss('The Tarragrue', 2423),
  new WowBoss('The Eye of the Jailer', 2433),
  new WowBoss('The Nine', 2429),
  new WowBoss('Remnant of Ner\'zhul', 2432),
  new WowBoss('Soulrender Dormazain', 2434),
  new WowBoss('Painsmith Raznal', 2430),
  new WowBoss('Guardian of the First Ones', 2436),
  new WowBoss('Fatescribe Roh-Kalo', 2431),
  new WowBoss('Kel\'Thuzad', 2422),
  new WowBoss('Sylvanas Windrunner', 2435)
];

export default bosses;