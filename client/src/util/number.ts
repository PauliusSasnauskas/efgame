export function getRandomInt(max: number): number {
  max = Math.floor(max)
  return Math.floor(Math.random() * max) // The maximum is exclusive
}
