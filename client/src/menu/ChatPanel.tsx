import clsx from "clsx"
import { KeyboardEvent, useEffect, useRef, useState } from "react"
import { Box } from "./Box"

export function ChatPanel ({ active, className, messages, sendMessage }: { active: boolean, className?: string, messages: Message[], sendMessage: (message: string) => void }): JSX.Element {
  const [chatMessage, setChatMessage] = useState('')

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.code !== 'Enter') return
    sendMessage(chatMessage)
    setChatMessage('')
  }

  const input = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!active) return
    input.current?.focus()
  }, [active])
  
  return (
    <Box className={clsx('flex flex-col overflow-y-auto', className)}>
      {messages.map((message, idx) => (
        <p key={idx}>
          {message.from !== undefined && <>{`<`}<span style={{ color: message.fromColor }}>{message.from}</span>{`> `}</>}
          {message.text}
        </p>
      ))}
      {active && (
        <div className='flex items-center gap-2 w-full'>
          <span className='text-gray-400'>{'> '}</span>
          <input
            type='text'
            ref={input}
            value={chatMessage}
            onChange={(e) => setChatMessage(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder='Type your message... (Enter to send, Esc to cancel)'
            className='flex-grow'
          />
        </div>   
      )}
    </Box>
  )
}

export interface Message {
  text: string
  from?: string
  fromColor?: string
}
