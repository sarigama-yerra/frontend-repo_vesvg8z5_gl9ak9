import { useEffect, useRef, useState } from 'react'
import { useLocation, useParams } from 'react-router-dom'

const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

export default function Room() {
  const { room_id } = useParams()
  const { state } = useLocation()
  const name = state?.name || `Guest-${Math.floor(Math.random()*1000)}`

  const [room, setRoom] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [code, setCode] = useState('')
  const endRef = useRef(null)

  const fetchRoom = async () => {
    const res = await fetch(`${baseUrl}/api/room/${room_id}`)
    if (res.ok) {
      const data = await res.json()
      setRoom(data)
      setCode(data.editor_content || '')
    }
  }

  const fetchMessages = async () => {
    const res = await fetch(`${baseUrl}/api/room/${room_id}/messages`)
    if (res.ok) setMessages(await res.json())
  }

  useEffect(() => {
    fetchRoom()
    fetchMessages()
    const iv = setInterval(() => {
      fetchRoom()
      fetchMessages()
    }, 2000)
    return () => clearInterval(iv)
  }, [room_id])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim()) return
    await fetch(`${baseUrl}/api/room/${room_id}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sender: name, content: input })
    })
    setInput('')
    fetchMessages()
  }

  const saveCode = async (value) => {
    setCode(value)
    await fetch(`${baseUrl}/api/room/${room_id}/editor`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: value })
    })
  }

  if (!room) return (
    <div className="min-h-screen grid place-items-center bg-slate-950 text-white">
      <div className="animate-pulse">Loading room...</div>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Room {room.room_id}</h1>
          <div className="text-sm text-slate-300">Players: {room.participants?.join(' vs ')}</div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mt-6">
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <h2 className="font-semibold mb-2">Question</h2>
            {room.question ? (
              <div>
                <div className="text-lg font-bold">{room.question.title}</div>
                <div className="text-xs uppercase tracking-wider text-slate-300 mt-1">{room.question.difficulty}</div>
                <p className="mt-3 text-slate-200 whitespace-pre-wrap">{room.question.statement}</p>
                {room.question.examples?.length > 0 && (
                  <div className="mt-3 text-sm text-slate-300">
                    <div className="font-semibold">Example</div>
                    <pre className="bg-black/40 p-3 rounded mt-1 overflow-auto">{JSON.stringify(room.question.examples[0], null, 2)}</pre>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-slate-300">No question selected</div>
            )}
          </div>

          <div className="flex flex-col gap-4">
            <div className="bg-white/5 border border-white/10 rounded-xl p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="font-semibold">Shared Editor</div>
                <button onClick={() => saveCode(code)} className="text-xs bg-indigo-500 hover:bg-indigo-400 px-3 py-1 rounded">Save</button>
              </div>
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full h-64 bg-black/40 p-3 rounded outline-none font-mono text-sm"
                placeholder="Write your solution here..."
              />
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-3 h-64 flex flex-col">
              <div className="font-semibold mb-2">Chat</div>
              <div className="flex-1 overflow-auto space-y-2 pr-1">
                {messages.map((m, i) => (
                  <div key={i} className="text-sm">
                    <span className="text-slate-300">{m.sender}: </span>
                    <span>{m.content}</span>
                  </div>
                ))}
                <div ref={endRef} />
              </div>
              <div className="mt-2 flex gap-2">
                <input value={input} onChange={(e) => setInput(e.target.value)} className="flex-1 bg-black/40 px-3 py-2 rounded outline-none" placeholder="Type a message" />
                <button onClick={sendMessage} className="bg-indigo-500 hover:bg-indigo-400 px-4 rounded">Send</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
