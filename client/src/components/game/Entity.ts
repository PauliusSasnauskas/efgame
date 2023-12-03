export interface Entity {
  readonly id: string
  health?: number // can have a numeric health value
  state?: { [k: string]: string|number } // can have a key-value state
}