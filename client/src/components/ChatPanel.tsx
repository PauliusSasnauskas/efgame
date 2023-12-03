import clsx from "clsx"
import { KeyboardEvent, useEffect, useRef, useState } from "react"
import { Box } from "./Box"

export function ChatPanel ({ active, className }: { active: boolean, className?: string }): JSX.Element {
  const [chatMessage, setChatMessage] = useState('')

  const sendChatMessage = () => {
    console.log('send', chatMessage)
    setChatMessage('')
  }

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter') return
    sendChatMessage()
  }

  const input = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!active) return
    input.current?.focus()
  }, [active])
  
  return (
    <Box className={clsx('flex flex-col overflow-y-auto', className)}>
      Log panel
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