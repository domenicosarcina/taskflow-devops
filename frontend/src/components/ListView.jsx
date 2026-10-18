import { useState, useMemo } from 'react'
import TaskCard from './TaskCard'
import styles from './ListView.module.css'

const STATUSES = ['', 'OPENED', 'INPROGRESS', 'DONE']
const PRIORITIES = ['', 'LOW', 'MEDIUM', 'HIGH']
const STATUS_LABELS = { '': 'Tutti gli stati', OPENED: 'Aperto', INPROGRESS: 'In corso', DONE: 'Completato' }
const PRIORITY_LABELS = { '': 'Tutte le priorità', LOW: 'Bassa', MEDIUM: 'Media', HIGH: 'Alta' }

export default function ListView({ tasks, onEdit, onDelete, onCreate }) {
  const [filterStatus, setFilterStatus] = useState('')
  const [filterPriority, setFilterPriority] = useState('')
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    return tasks.filter(t => {
      if (filterStatus && t.status !== filterStatus) return false
      if (filterPriority && t.priority !== filterPriority) return false
      if (search && !t.title.toLowerCase().includes(search.toLowerCase()) &&
          !t.description?.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
  }, [tasks, filterStatus, filterPriority, search])

  const counts = useMemo(() => ({
    opened: tasks.filter(t => t.status === 'OPENED').length,
    inprogress: tasks.filter(t => t.status === 'INPROGRESS').length,
    done: tasks.filter(t => t.status === 'DONE').length,
  }), [tasks])

  return (
    <div className={styles.listView}>
      <div className={styles.statsRow}>
        <div className={`${styles.stat} ${styles.statOpened}`}>
          <span className={styles.statNum}>{counts.opened}</span>
          <span className={styles.statLabel}>Aperti</span>
        </div>
        <div className={`${styles.stat} ${styles.statInprogress}`}>
          <span className={styles.statNum}>{counts.inprogress}</span>
          <span className={styles.statLabel}>In corso</span>
        </div>
        <div className={`${styles.stat} ${styles.statDone}`}>
          <span className={styles.statNum}>{counts.done}</span>
          <span className={styles.statLabel}>Completati</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statNum}>{tasks.length}</span>
          <span className={styles.statLabel}>Totali</span>
        </div>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.searchWrap}>
          <svg className={styles.searchIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            className={styles.searchInput}
            type="text"
            placeholder="Cerca task..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button className={styles.clearSearch} onClick={() => setSearch('')}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          )}
        </div>

        <div className={styles.filters}>
          <select
            className={styles.filterSelect}
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
          >
            {STATUSES.map(s => (
              <option key={s} value={s}>{STATUS_LABELS[s]}</option>
            ))}
          </select>

          <select
            className={styles.filterSelect}
            value={filterPriority}
            onChange={e => setFilterPriority(e.target.value)}
          >
            {PRIORITIES.map(p => (
              <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>
            ))}
          </select>

          {(filterStatus || filterPriority || search) && (
            <button
              className={styles.clearFilters}
              onClick={() => { setFilterStatus(''); setFilterPriority(''); setSearch('') }}
            >
              Reset filtri
            </button>
          )}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className={styles.empty}>
          {tasks.length === 0 ? (
            <>
              <div className={styles.emptyIcon}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                  <path d="M9 11l3 3L22 4"/>
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                </svg>
              </div>
              <p className={styles.emptyTitle}>Nessun task ancora</p>
              <p className={styles.emptyText}>Inizia creando il tuo primo task</p>
              <button className={styles.emptyBtn} onClick={onCreate}>
                Crea il primo task
              </button>
            </>
          ) : (
            <>
              <div className={styles.emptyIcon}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
              </div>
              <p className={styles.emptyTitle}>Nessun risultato</p>
              <p className={styles.emptyText}>Prova a cambiare i filtri di ricerca</p>
            </>
          )}
        </div>
      ) : (
        <div className={styles.grid}>
          {filtered.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
}
