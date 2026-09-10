import { useEffect, useMemo, useState } from "react";
import {
  addDoc,
  collection,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import "./App.css";

const categories = [
  "All",
  "Electronics",
  "Clothing",
  "Bottle",
  "School Supplies",
  "Other",
];

function App() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [type, setType] = useState("ALL");

  const [showModal, setShowModal] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [successMessage, setSuccessMessage] = useState("");

  // =========================
  // READ ITEMS FROM FIRESTORE
  // =========================

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "items"),

      (snapshot) => {
        const firestoreItems = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setItems(firestoreItems);
        setLoading(false);
        setError("");
      },

      (err) => {
        console.error("Firestore read error:", err);

        setError("Could not load items from Firebase.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // =========================
  // FILTER ITEMS
  // =========================

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();

    return items
      .filter((item) => {
        if (type === "ALL") return true;

        return item.type === type;
      })

      .filter((item) => {
        if (category === "All") return true;

        return item.category === category;
      })

      .filter((item) => {
        if (!query) return true;

        const text = [
          item.title,
          item.location,
          item.description,
          item.category,
        ]
          .join(" ")
          .toLowerCase();

        return text.includes(query);
      })

      .sort((a, b) => {
        const dateA = new Date(a.date || 0);
        const dateB = new Date(b.date || 0);

        return dateB - dateA;
      });
  }, [items, search, category, type]);

  // =========================
  // ADD ITEM TO FIRESTORE
  // =========================

  async function addItem(formData) {
    try {
      await addDoc(collection(db, "items"), {
        ...formData,

        createdAt: serverTimestamp(),
      });

      // CLOSE MODAL AFTER SUCCESS
      setShowModal(false);

      // SUCCESS MESSAGE
      setSuccessMessage("Report posted successfully.");

      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);

      return true;
    } catch (err) {
      console.error("Firestore write error:", err);

      throw err;
    }
  }

  return (
    <div className="app-shell">
      {/* =========================
          HEADER
      ========================= */}

      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">LF</div>

          <div>
            <p className="eyebrow">SCHOOL COMMUNITY</p>

            <h1>Lost & Found</h1>
          </div>
        </div>

        <button
          className="primary-btn"
          onClick={() => setShowModal(true)}
        >
          + Report Item
        </button>
      </header>

      <main>
        {/* =========================
            HERO
        ========================= */}

        <section className="hero">
          <p className="eyebrow hero-eyebrow">
            FIND IT. RETURN IT.
          </p>

          <h2>Lost something at school?</h2>

          <p>
            Search reported items or post what you lost or found.
            Keep reports short, clear, and useful.
          </p>
        </section>

        {/* =========================
            SUCCESS MESSAGE
        ========================= */}

        {successMessage && (
          <div
            style={{
              marginTop: "20px",
              padding: "15px 18px",
              background: "#e7f4ed",
              borderRadius: "12px",
              color: "#246444",
              fontWeight: "700",
            }}
          >
            {successMessage}
          </div>
        )}

        {/* =========================
            SEARCH + FILTER
        ========================= */}

        <section className="controls">
          <input
            className="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search item, location, or description..."
          />

          <div className="filter-row">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {categories.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>

            <div className="segmented">
              <button
                className={type === "ALL" ? "active" : ""}
                onClick={() => setType("ALL")}
              >
                All
              </button>

              <button
                className={type === "LOST" ? "active" : ""}
                onClick={() => setType("LOST")}
              >
                Lost
              </button>

              <button
                className={type === "FOUND" ? "active" : ""}
                onClick={() => setType("FOUND")}
              >
                Found
              </button>
            </div>
          </div>
        </section>

        {/* =========================
            ITEM COUNT
        ========================= */}

        <section className="section-heading">
          <div>
            <p className="eyebrow">CURRENT REPORTS</p>

            <h3>
              {filteredItems.length}{" "}
              {filteredItems.length === 1 ? "item" : "items"}
            </h3>
          </div>
        </section>

        {/* =========================
            ITEM LIST
        ========================= */}

        <section className="grid">
          {loading && (
            <div className="empty">
              <h4>Loading items...</h4>
              <p>Connecting to Firebase.</p>
            </div>
          )}

          {error && (
            <div className="empty">
              <h4>Something went wrong.</h4>
              <p>{error}</p>
            </div>
          )}

          {!loading &&
            !error &&
            filteredItems.map((item) => (
              <article className="card" key={item.id}>
                <div className="card-top">
                  <span
                    className={`status ${
                      item.type?.toLowerCase() || ""
                    }`}
                  >
                    {item.type}
                  </span>

                  <span className="category">
                    {item.category}
                  </span>
                </div>

                <h4>{item.title}</h4>

                {item.description && (
                  <p className="description">
                    {item.description}
                  </p>
                )}

                <div className="meta">
                  <span>
                    Location: {item.location}
                  </span>

                  <span>
                    Date: {formatDate(item.date)}
                  </span>
                </div>
              </article>
            ))}

          {!loading &&
            !error &&
            filteredItems.length === 0 && (
              <div className="empty">
                <h4>No matching items.</h4>

                <p>
                  Try another keyword or report a new item.
                </p>
              </div>
            )}
        </section>
      </main>

      <footer>
        Built for the school community
      </footer>

      {/* =========================
          REPORT MODAL
      ========================= */}

      {showModal && (
        <ItemModal
          onClose={() => setShowModal(false)}
          onSubmit={addItem}
        />
      )}
    </div>
  );
}

// =====================================
// REPORT ITEM MODAL
// =====================================

function ItemModal({ onClose, onSubmit }) {
  const [form, setForm] = useState({
    title: "",
    type: "LOST",
    category: "Electronics",
    location: "",
    date: new Date().toISOString().slice(0, 10),
    description: "",
  });

  const [submitting, setSubmitting] = useState(false);

  function update(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function submit(e) {
    e.preventDefault();

    // VALIDATION

    if (!form.title.trim()) {
      alert("Please enter an item name.");
      return;
    }

    if (!form.location.trim()) {
      alert("Please enter a location.");
      return;
    }

    if (!form.date) {
      alert("Please select a date.");
      return;
    }

    try {
      setSubmitting(true);

      await onSubmit({
        ...form,

        title: form.title.trim(),

        location: form.location.trim(),

        description: form.description.trim(),
      });
    } catch (err) {
      console.error(err);

      alert(
        "Failed to post report. Please check Firebase and try again."
      );

      setSubmitting(false);
    }
  }

  return (
    <div
      className="modal-backdrop"
      onMouseDown={() => {
        if (!submitting) onClose();
      }}
    >
      <div
        className="modal"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* HEADER */}

        <div className="modal-header">
          <div>
            <p className="eyebrow">
              NEW REPORT
            </p>

            <h3>Report an item</h3>
          </div>

          <button
            type="button"
            className="icon-btn"
            onClick={onClose}
            disabled={submitting}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* FORM */}

        <form onSubmit={submit}>
          <label>
            Item name

            <input
              value={form.title}
              onChange={(e) =>
                update("title", e.target.value)
              }
              placeholder="e.g. Blue Hoodie"
              disabled={submitting}
            />
          </label>

          <div className="two-col">
            <label>
              Report type

              <select
                value={form.type}
                onChange={(e) =>
                  update("type", e.target.value)
                }
                disabled={submitting}
              >
                <option value="LOST">
                  Lost
                </option>

                <option value="FOUND">
                  Found
                </option>
              </select>
            </label>

            <label>
              Category

              <select
                value={form.category}
                onChange={(e) =>
                  update(
                    "category",
                    e.target.value
                  )
                }
                disabled={submitting}
              >
                {categories
                  .filter(
                    (category) =>
                      category !== "All"
                  )
                  .map((option) => (
                    <option
                      key={option}
                      value={option}
                    >
                      {option}
                    </option>
                  ))}
              </select>
            </label>
          </div>

          <div className="two-col">
            <label>
              Location

              <input
                value={form.location}
                onChange={(e) =>
                  update(
                    "location",
                    e.target.value
                  )
                }
                placeholder="e.g. Library"
                disabled={submitting}
              />
            </label>

            <label>
              Date

              <input
                type="date"
                value={form.date}
                onChange={(e) =>
                  update("date", e.target.value)
                }
                disabled={submitting}
              />
            </label>
          </div>

          <label>
            Description

            <textarea
              value={form.description}
              onChange={(e) =>
                update(
                  "description",
                  e.target.value
                )
              }
              placeholder="Color, brand, special marks..."
              rows="4"
              disabled={submitting}
            />
          </label>

          <div className="modal-actions">
            <button
              type="button"
              className="secondary-btn"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="primary-btn"
              disabled={submitting}
            >
              {submitting
                ? "Posting..."
                : "Post Report"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// =====================================
// DATE FORMAT
// =====================================

function formatDate(value) {
  if (!value) {
    return "Unknown";
  }

  const date = new Date(
    `${value}T00:00:00`
  );

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export default App;