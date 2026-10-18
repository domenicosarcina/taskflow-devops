import { useState } from 'react'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { updateTask } from '../api/tasks'
import TaskCard from './TaskCard'
import styles from './Dashboard.module.css'

const COLUMNS = [
  { id: 'OPENED', label: 'Aperti', color: 'opened' },
  { id: 'INPROGRESS', label: 'In corso', color: 'inprogress' },
  { id: 'DONE', label: 'Completati', color: 'done' },
]

export default function Dashboard({ tasks, onEdit, onDelete, onTasksChange }) {
  const [draggingId, setDraggingId] = useState(null)

  const getColumnTasks = (status) =>
    tasks.filter(t => t.status === status)

  const onDragStart = (start) => {
    setDraggingId(start.draggableId)
  }

  const onDragEnd = async (result) => {
    setDraggingId(null)
    if (!result.destination) return

    const taskId = parseInt(result.draggableId)
    const newStatus = result.destination.droppableId

    const task = tasks.find(t => t.id === taskId)
    if (!task || task.status === newStatus) return

    const updatedTask = { ...task, status: newStatus }
    onTasksChange(tasks.map(t => t.id === taskId ? updatedTask : t))

    try {
      await updateTask(taskId, {
        title: task.title,
        description: task.description,
        status: newStatus,
        priority: task.priority,
      })
    } catch {
      onTasksChange(tasks)
    }
  }

  return (
    <div className={styles.dashboard}>
      <DragDropContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
        <div className={styles.columns}>
          {COLUMNS.map(col => {
            const colTasks = getColumnTasks(col.id)
            return (
              <div key={col.id} className={`${styles.column} ${styles[`col_${col.color}`]}`}>
                <div className={styles.colHeader}>
                  <div className={styles.colTitle}>
                    <span className={`${styles.colDot} ${styles[`dot_${col.color}`]}`} />
                    <span className={styles.colLabel}>{col.label}</span>
                  </div>
                  <span className={styles.colCount}>{colTasks.length}</span>
                </div>

                <Droppable droppableId={col.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`${styles.dropZone} ${snapshot.isDraggingOver ? styles.dragOver : ''}`}
                    >
                      {colTasks.map((task, index) => (
                        <Draggable
                          key={task.id}
                          draggableId={String(task.id)}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={styles.draggableItem}
                            >
                              <TaskCard
                                task={task}
                                onEdit={onEdit}
                                onDelete={onDelete}
                                dragging={snapshot.isDragging}
                              />
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                      {colTasks.length === 0 && !snapshot.isDraggingOver && (
                        <div className={styles.emptyCol}>
                          <span>Trascina qui i task</span>
                        </div>
                      )}
                    </div>
                  )}
                </Droppable>
              </div>
            )
          })}
        </div>
      </DragDropContext>
    </div>
  )
}
