import { Message } from "./menu/ChatPanel";

export interface ServerEvents {
  welcome: (message: string) => void
  chat: (message: Message) => void
}

export interface ClientEvents {
  chat: (message: string) => void
}
