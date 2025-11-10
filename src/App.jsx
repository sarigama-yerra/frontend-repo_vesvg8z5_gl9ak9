import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

function App() {
  const [name, setName] = useState('')
  const [status, setStatus] = useState('idle')
  const [message, setMessage] = useState('')
  const [backendOk, setBackendOk] = useState(false)
  const navigate = useNavigate()

  const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

  useEffect(() => {
    // quick health check
    fetch(`${baseUrl}`)
      .then(r => r.json())
      .then(() => setBackendOk(true))
      .catch(() => setBackendOk(false))
  }, [])

  const seedQuestions = async () => {
    setMessage('Seeding questions...')
    try {
      const res = await fetch(`${baseUrl}/api/seed-questions`, { method: 'POST' })
      const data = await res.json()
      setMessage(data.message || (data.seeded ? 'Seeded sample questions' : 'Questions already exist'))
    } catch (e) {
      setMessage('Failed to seed questions')
    }
  }

  const joinMatchmaking = async () => {
    if (!name.trim()) {
      setMessage('Please enter your display name')
      return
    }
    setStatus('joining')
    setMessage('Finding you a match...')
    try {
      const res = await fetch(`${baseUrl}/api/matchmaking/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      })
      const data = await res.json()
      if (data.status === 'waiting') {
        setStatus('waiting')
        setMessage('Waiting for another participant... Leave this tab open.')
        // Poll until paired
        const iv = setInterval(async () => {
          try {
            // Naive approach: if room created for us, server returns paired immediately only to the second user.
            // For demo, provide a CTA to open another tab or use seed button and try again with another name.
          } catch {}
        }, 3000)
        // stop after 60s
        setTimeout(() => clearInterval(iv), 60000)
      } else if (data.status === 'paired') {
        navigate(`/room/${data.room_id}`, { state: { name } })
      } else {
        setMessage('Unexpected response. Try again.')
        setStatus('idle')
      }
    } catch (e) {
      setMessage('Could not connect to server')
      setStatus('idle')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900 text-white">
      <div className="max-w-5xl mx-auto px-6 py-16">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">DSA Duel</h1>
          <div className={`text-sm ${backendOk ? 'text-emerald-400' : 'text-red-400'}`}>
            {backendOk ? 'Backend Connected' : 'Backend Offline'}
          </div>
        </header>

        <section className="mt-16 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="text-4xl md:text-5xl font-extrabold leading-tight">
              Battle 1v1 on real placement questions
            </h2>
            <p className="mt-4 text-slate-300">
              Instant matchmaking, shared editor, and live chat. Practice algorithms the fun way.
            </p>
            <div className="mt-8 flex items-center gap-3">
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Your display name"
                className="w-full max-w-xs bg-white/10 border border-white/20 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-400 placeholder-slate-300"
              />
              <button
                onClick={joinMatchmaking}
                className="bg-indigo-500 hover:bg-indigo-400 active:bg-indigo-600 transition-colors px-5 py-2 rounded-lg font-semibold shadow-lg shadow-indigo-900/40"
              >
                {status === 'joining' ? 'Joining...' : status === 'waiting' ? 'Waiting...' : 'Find Match'}
              </button>
            </div>
            {message && <p className="mt-3 text-slate-300">{message}</p>}
            <div className="mt-6 flex items-center gap-3">
              <button onClick={seedQuestions} className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded">
                Seed sample questions
              </button>
              <a href="/test" className="text-xs underline text-slate-300">Connection test</a>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-tr from-indigo-500 to-fuchsia-500 blur-2xl opacity-20 rounded-3xl" />
            <div className="relative bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl">
              <div className="flex items-center justify-between mb-3">
                <div className="h-3 w-3 rounded-full bg-red-400" />
                <div className="h-3 w-3 rounded-full bg-yellow-400" />
                <div className="h-3 w-3 rounded-full bg-emerald-400" />
              </div>
              <pre className="text-slate-200 text-sm overflow-auto max-h-80">
{`// Example: Two Sum
function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const need = target - nums[i];
    if (map.has(need)) return [map.get(need), i];
    map.set(nums[i], i);
  }
  return [];
}`}
              </pre>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default App
