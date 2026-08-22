import { useEffect, useMemo, useState } from 'react'
import { addDoc, collection, onSnapshot, serverTimestamp } from 'firebase/firestore'
import { db } from './firebase'
import './App.css'


const categories = ['All', 'Electronics', 'Clothing', 'Bottle', 'School Supplies', 'Other']

function App() {
  const [items, setItems] = useState([])
const [loading, setLoading] = useState(true)
const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [type, setType] = useState('ALL')
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
  const unsubscribe = onSnapshot(
    collection(db, 'items'),

    (snapshot) => {
      const itemData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))

      setItems(itemData)
      setLoading(false)
      setError('')
    },

    (err) => {
      console.error(err)
      setError('Could not load items.')
      setLoading(false)
    }
  )

  return () => unsubscribe()
}, [])

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

  async function addItem(formData) {
  try {
    await addDoc(collection(db, "items"), {
      ...formData,
      createdAt: serverTimestamp(),
    })

    setShowModal(false)
  } catch (error) {
    console.error("POST ERROR:", error)
    alert("Failed to post report.")
  }
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
            {loading && (
  <div className="empty">
    <h4>Loading items...</h4>
  </div>
)}

{error && (
  <div className="empty">
    <h4>{error}</h4>
  </div>
)}
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

          {!loading && !error && filteredItems.length === 0 && (
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

  async function submit(e) {
  e.preventDefault()

  if (!form.title.trim()) {
    alert("Please enter an item name.")
    return
  }

  if (!form.location.trim()) {
    alert("Please enter a location.")
    return
  }

  await onSubmit({
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
