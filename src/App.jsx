import { useEffect, useMemo, useState } from 'react'
import './App.css'

const STORAGE_KEY = 'school-lost-found-items-v1'

const starterItems = [
  {
    id: crypto.randomUUID(),
    title: 'Black Water Bottle',
    type: 'FOUND',
    category: 'Bottle',
    location: 'Gym',
    date: '2026-08-21',
    description: 'Black insulated bottle found near the bleachers.',
  },
  {
    id: crypto.randomUUID(),
    title: 'AirPods Case',
    type: 'LOST',
    category: 'Electronics',
    location: 'Library',
    date: '2026-08-20',
    description: 'White AirPods case. Small scratch on the front.',
  },
  {
    id: crypto.randomUUID(),
    title: 'Blue Hoodie',
    type: 'FOUND',
    category: 'Clothing',
    location: 'Cafeteria',
    date: '2026-08-19',
    description: 'Blue zip-up hoodie left on a chair.',
  },
]

const categories = ['All', 'Electronics', 'Clothing', 'Bottle', 'School Supplies', 'Other']

function App() {
  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : starterItems
  })
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [type, setType] = useState('ALL')
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items])

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase()

    return items
      .filter((item) => type === 'ALL' || item.type === type)
      .filter((item) => category === 'All' || item.category === category)
      .filter((item) => {
        if (!q) return true
        return [item.title, item.location, item.description, item.category]
          .join(' ')
          .toLowerCase()
          .includes(q)
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date))
  }, [items, search, category, type])

  function addItem(formData) {
    setItems((current) => [
      {
        id: crypto.randomUUID(),
        ...formData,
      },
      ...current,
    ])
    setShowModal(false)
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">LF</div>
          <div>
            <p className="eyebrow">SCHOOL COMMUNITY</p>
            <h1>Lost & Found</h1>
          </div>
        </div>

        <button className="primary-btn" onClick={() => setShowModal(true)}>
          + Report Item
        </button>
      </header>

      <main>
        <section className="hero">
          <p className="eyebrow hero-eyebrow">FIND IT. RETURN IT.</p>
          <h2>Lost something at school?</h2>
          <p>
            Search reported items or post what you lost or found.
            Keep reports short, clear, and useful.
          </p>
        </section>

        <section className="controls">
          <input
            className="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search item, location, or description..."
          />

          <div className="filter-row">
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              {categories.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>

            <div className="segmented">
              {[
                ['ALL', 'All'],
                ['LOST', 'Lost'],
                ['FOUND', 'Found'],
              ].map(([value, label]) => (
                <button
                  key={value}
                  className={type === value ? 'active' : ''}
                  onClick={() => setType(value)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="section-heading">
          <div>
            <p className="eyebrow">CURRENT REPORTS</p>
            <h3>{filteredItems.length} item{filteredItems.length === 1 ? '' : 's'}</h3>
          </div>
        </section>

        <section className="grid">
          {filteredItems.map((item) => (
            <article className="card" key={item.id}>
              <div className="card-top">
                <span className={`status ${item.type.toLowerCase()}`}>{item.type}</span>
                <span className="category">{item.category}</span>
              </div>

              <h4>{item.title}</h4>
              <p className="description">{item.description}</p>

              <div className="meta">
                <span>Location: {item.location}</span>
                <span>Date: {formatDate(item.date)}</span>
              </div>
            </article>
          ))}

          {filteredItems.length === 0 && (
            <div className="empty">
              <h4>No matching items.</h4>
              <p>Try a different keyword or filter.</p>
            </div>
          )}
        </section>
      </main>

      <footer>
        Built for the school community · MVP v0.1
      </footer>

      {showModal && (
        <ItemModal
          onClose={() => setShowModal(false)}
          onSubmit={addItem}
        />
      )}
    </div>
  )
}

function ItemModal({ onClose, onSubmit }) {
  const [form, setForm] = useState({
    title: '',
    type: 'LOST',
    category: 'Electronics',
    location: '',
    date: new Date().toISOString().slice(0, 10),
    description: '',
  })

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  function submit(e) {
    e.preventDefault()

    if (!form.title.trim() || !form.location.trim() || !form.description.trim()) {
      return
    }

    onSubmit({
      ...form,
      title: form.title.trim(),
      location: form.location.trim(),
      description: form.description.trim(),
    })
  }

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <p className="eyebrow">NEW REPORT</p>
            <h3>Report an item</h3>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Close">×</button>
        </div>

        <form onSubmit={submit}>
          <label>
            Item name
            <input
              value={form.title}
              onChange={(e) => update('title', e.target.value)}
              placeholder="e.g. Black calculator"
              required
            />
          </label>

          <div className="two-col">
            <label>
              Report type
              <select value={form.type} onChange={(e) => update('type', e.target.value)}>
                <option value="LOST">Lost</option>
                <option value="FOUND">Found</option>
              </select>
            </label>

            <label>
              Category
              <select value={form.category} onChange={(e) => update('category', e.target.value)}>
                {categories.filter((c) => c !== 'All').map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="two-col">
            <label>
              Location
              <input
                value={form.location}
                onChange={(e) => update('location', e.target.value)}
                placeholder="e.g. Library"
                required
              />
            </label>

            <label>
              Date
              <input
                type="date"
                value={form.date}
                onChange={(e) => update('date', e.target.value)}
                required
              />
            </label>
          </div>

          <label>
            Description
            <textarea
              value={form.description}
              onChange={(e) => update('description', e.target.value)}
              placeholder="Color, brand, special marks..."
              rows="4"
              required
            />
          </label>

          <div className="modal-actions">
            <button type="button" className="secondary-btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="primary-btn">Post Report</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function formatDate(value) {
  const date = new Date(`${value}T00:00:00`)
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
}

export default App
