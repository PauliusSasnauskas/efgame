export interface Resource {
  readonly id: string
  state?: { [k: string]: string|number } // can have a key-value state
}