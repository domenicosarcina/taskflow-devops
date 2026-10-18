import { useState, useEffect, useCallback } from 'react'
import { getTasks, createTask, updateTask, deleteTask } from './api/tasks'
import { useAuth } from './context/AuthContext'
import LoginPage from './components/LoginPage'
import ListView from './components/ListView'
import Dashboard from './components/Dashboard'
import TaskModal from './components/TaskModal'
import styles from './App.module.css'

export default function App() {
  const { isAuth, logout } = useAuth()

  const [view, setView] = useState('list')
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState(null)

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const { data } = await getTasks()
      setTasks(data)
    } catch {
      setError('Impossibile caricare i task. Verifica che il backend sia attivo.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (isAuth) fetchTasks()
  }, [isAuth, fetchTasks])

  if (!isAuth) return <LoginPage />

  const handleCreate = () => {
    setEditingTask(null)
    setModalOpen(true)
  }

  const handleEdit = (task) => {
    setEditingTask(task)
    setModalOpen(true)
  }

  const handleSave = async (formData) => {
    try {
      if (editingTask) {
        const { data } = await updateTask(editingTask.id, formData)
        setTasks(prev => prev.map(t => t.id === data.id ? data : t))
      } else {
        const { data } = await createTask(formData)
        setTasks(prev => [...prev, data])
      }
      setModalOpen(false)
    } catch {
      throw new Error('Errore durante il salvataggio')
    }
  }

  const handleDelete = async (id) => {
    try {
      await deleteTask(id)
      setTasks(prev => prev.filter(t => t.id !== id))
    } catch {
      alert('Errore durante l\'eliminazione')
    }
  }

  const handleTasksChange = (updatedTasks) => {
    setTasks(updatedTasks)
  }

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.brand}>
            <span className={styles.brandDot} />
            <span className={styles.brandName}>TaskFlow</span>
          </div>
          <nav className={styles.nav}>
            <button
              className={`${styles.navBtn} ${view === 'list' ? styles.active : ''}`}
              onClick={() => setView('list')}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/>
                <line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/>
                <line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
              </svg>
              Lista
            </button>
            <button
              className={`${styles.navBtn} ${view === 'dashboard' ? styles.active : ''}`}
              onClick={() => setView('dashboard')}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
              </svg>
              Dashboard
            </button>
          </nav>
          <button className={styles.createBtn} onClick={handleCreate}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Nuovo Task
          </button>
          <button className={styles.logoutBtn} onClick={logout} title="Esci">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Esci
          </button>
        </div>
      </header>

      <main className={styles.main}>
        {loading ? (
          <div className={styles.loadingState}>
            <div className={styles.spinner} />
            <p>Caricamento task...</p>
          </div>
        ) : error ? (
          <div className={styles.errorState}>
            <span className={styles.errorIcon}>⚠</span>
            <p>{error}</p>
            <button className={styles.retryBtn} onClick={fetchTasks}>Riprova</button>
          </div>
        ) : view === 'list' ? (
          <ListView
            tasks={tasks}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onCreate={handleCreate}
          />
        ) : (
          <Dashboard
            tasks={tasks}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onTasksChange={handleTasksChange}
          />
        )}
      </main>

      {modalOpen && (
        <TaskModal
          task={editingTask}
          onSave={handleSave}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  )
}
