import clsx from "clsx"
import { KeyboardEvent, useEffect, useRef, useState } from "react"
import { Box } from "./Box"
import { Message } from "common/src/SocketSpec";

export function ChatPanel ({ active, className, messages, sendMessage, recipient, recipientColor }: { active: boolean, className?: string, messages: Message[], sendMessage: (message: string, recipient?: string) => void, recipient?: string, recipientColor?: string }): JSX.Element {
  const [chatMessage, setChatMessage] = useState('')
  const messageRef = useRef<HTMLElement>(null);

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.code !== 'Enter') return
    if (chatMessage !== '') sendMessage(chatMessage.trim(), recipient)
    setChatMessage('')
  }

  const input = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!active) return
    input.current?.focus()
  }, [active])

  useEffect(() => {
    messageRef?.current?.scrollIntoView({ block: "end", inline: "end" })
  }, [messages])

  const MessageElement = ({ message }: { message: Message }): JSX.Element => {
    let describerElement;
    
    if (message.private && message.from !== undefined && message.to !== undefined) describerElement = <>{`<`}<span style={{ color: `rgb(${message.fromColor})` }}>{message.from}</span><span className='text-grey-lighter'> to </span><span style={{ color: `rgb(${message.toColor})` }}>{message.to}</span>{`> `}</>
    else if (message.from !== undefined) describerElement = <>{`<`}<span style={{ color: `rgb(${message.fromColor})` }}>{message.from}</span>{`> `}</>

    return (
      <p>
        {describerElement}
        <span className={clsx(message.private && 'text-grey-lighter')}>{message.text}</span>
      </p>
    );
  }
  
  return (
    <Box className={clsx('flex flex-col overflow-y-auto', className)} ref={messageRef}>
      {messages.map((message, idx) => (<MessageElement message={message} key={idx} />))}
      {active && (
        <div className='flex items-center gap-2 w-full'>
          <span className='text-gray-400'>{recipient !== undefined ? <>To <span style={{ color: `rgb(${recipientColor})` }}>{recipient}</span> {`>`}</> : '> '}</span>
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
