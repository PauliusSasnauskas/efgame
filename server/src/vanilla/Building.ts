import { Entity } from "common/src/Tile";
import { StatReq } from "../ConfigSpec";

export class Capitol implements Entity {
  id = 'v:capitol'
  health = 3
}

export class Mine implements Entity {
  id = 'v:mine'
  health = 2
}

export class Barracks implements Entity {
  id = 'v:barracks'
  health = 2
}

export class Tower implements Entity {
  id = 'v:tower'
  health = 2
}

export class WoodWall implements Entity {
  id = 'v:woodwall'
  health = 4
}

export class StoneWall implements Entity {
  id = 'v:stonewall'
  health = 7
}
