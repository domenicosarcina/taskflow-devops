import styles from './TaskCard.module.css'

const STATUS_LABELS = { OPENED: 'Aperto', INPROGRESS: 'In corso', DONE: 'Completato' }
const PRIORITY_LABELS = { LOW: 'Bassa', MEDIUM: 'Media', HIGH: 'Alta' }
const PRIORITY_ICONS = { LOW: '↓', MEDIUM: '→', HIGH: '↑' }

export default function TaskCard({ task, onEdit, onDelete, dragging }) {
  return (
    <div className={`${styles.card} ${dragging ? styles.dragging : ''}`}>
      <div className={styles.cardTop}>
        <span className={`${styles.status} ${styles[`status_${task.status.toLowerCase()}`]}`}>
          {STATUS_LABELS[task.status]}
        </span>
        <span className={`${styles.priority} ${styles[`pri_${task.priority.toLowerCase()}`]}`}>
          {PRIORITY_ICONS[task.priority]} {PRIORITY_LABELS[task.priority]}
        </span>
      </div>

      <h3 className={styles.title}>{task.title}</h3>

      {task.description && (
        <p className={styles.description}>{task.description}</p>
      )}

      <div className={styles.cardFooter}>
        <span className={styles.taskId}>#{task.id}</span>
        <div className={styles.actions}>
          <button
            className={styles.actionBtn}
            onClick={() => onEdit(task)}
            title="Modifica"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
          <button
            className={`${styles.actionBtn} ${styles.deleteBtn}`}
            onClick={() => {
              if (window.confirm(`Eliminare "${task.title}"?`)) onDelete(task.id)
            }}
            title="Elimina"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
              <path d="M10 11v6"/><path d="M14 11v6"/>
              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
