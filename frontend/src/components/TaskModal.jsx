import { useState, useEffect, useRef } from 'react'
import styles from './TaskModal.module.css'

const STATUSES = ['OPENED', 'INPROGRESS', 'DONE']
const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH']

const STATUS_LABELS = { OPENED: 'Aperto', INPROGRESS: 'In corso', DONE: 'Completato' }
const PRIORITY_LABELS = { LOW: 'Bassa', MEDIUM: 'Media', HIGH: 'Alta' }

export default function TaskModal({ task, onSave, onClose }) {
  const [form, setForm] = useState({
    title: task?.title || '',
    description: task?.description || '',
    status: task?.status || 'OPENED',
    priority: task?.priority || 'MEDIUM',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const titleRef = useRef(null)

  useEffect(() => {
    titleRef.current?.focus()
    const handleKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) { setError('Il titolo è obbligatorio'); return }
    try {
      setSaving(true)
      setError(null)
      await onSave(form)
    } catch (err) {
      setError(err.message || 'Errore durante il salvataggio')
      setSaving(false)
    }
  }

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>
            {task ? 'Modifica Task' : 'Nuovo Task'}
          </h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label className={styles.label}>Titolo *</label>
            <input
              ref={titleRef}
              className={styles.input}
              type="text"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="Nome del task..."
              maxLength={200}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Descrizione</label>
            <textarea
              className={styles.textarea}
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Descrizione opzionale..."
              rows={3}
            />
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label}>Stato</label>
              <div className={styles.segmented}>
                {STATUSES.map(s => (
                  <button
                    key={s}
                    type="button"
                    className={`${styles.segBtn} ${styles[`seg_${s.toLowerCase()}`]} ${form.status === s ? styles.segActive : ''}`}
                    onClick={() => setForm(f => ({ ...f, status: s }))}
                  >
                    {STATUS_LABELS[s]}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Priorità</label>
              <div className={styles.segmented}>
                {PRIORITIES.map(p => (
                  <button
                    key={p}
                    type="button"
                    className={`${styles.segBtn} ${styles[`pri_${p.toLowerCase()}`]} ${form.priority === p ? styles.segActive : ''}`}
                    onClick={() => setForm(f => ({ ...f, priority: p }))}
                  >
                    {PRIORITY_LABELS[p]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {error && <p className={styles.errorMsg}>{error}</p>}

          <div className={styles.actions}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>
              Annulla
            </button>
            <button type="submit" className={styles.saveBtn} disabled={saving}>
              {saving ? (
                <><span className={styles.btnSpinner} /> Salvataggio...</>
              ) : (
                task ? 'Salva modifiche' : 'Crea Task'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
