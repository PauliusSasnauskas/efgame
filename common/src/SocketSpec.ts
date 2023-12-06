export interface ServerEvents {
  welcome: (message: string) => void
  chat: (message: Message) => void
}

export interface ClientEvents {
  welcome: (data: { name: string, color: string }) => void
  chat: (message: string) => void
  // chatPrivate: (message: string, to: number) => void
}

export interface Message {
  text: string
  from?: string
  fromColor?: string
  private?: boolean
}
