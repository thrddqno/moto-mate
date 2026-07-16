import { useEffect, useState, type FormEvent } from 'react'
import { useScheduleStore } from '../../stores/scheduleStore'
import { useTemplateStore } from '../../stores/templateStore'
import type { IntervalType, Schedule } from '../../types'

interface ScheduleEditorModalProps {
  bikeId: string
  schedule: Schedule | null
  onClose: () => void
}

export function ScheduleEditorModal({ bikeId, schedule, onClose }: ScheduleEditorModalProps) {
  const { createSchedule, deleteSchedule, updateSchedule } = useScheduleStore()
  const { fetchTemplates, templates } = useTemplateStore()
  const [templateId, setTemplateId] = useState(schedule?.templateId || '')
  const [intervalType, setIntervalType] = useState<IntervalType>(schedule?.intervalType || 'MILEAGE')
  const [intervalMileage, setIntervalMileage] = useState(schedule?.intervalMileage?.toString() || '')
  const [intervalDays, setIntervalDays] = useState(schedule?.intervalDays?.toString() || '')
  const [isActive, setIsActive] = useState(schedule?.isActive ?? true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const isEditing = Boolean(schedule)

  useEffect(() => {
    if (!isEditing && templates.length === 0) void fetchTemplates()
  }, [fetchTemplates, isEditing, templates.length])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!templateId && !isEditing) {
      setError('Select a maintenance task.')
      return
    }
    if (intervalType !== 'DATE' && !intervalMileage) {
      setError('Mileage interval is required.')
      return
    }
    if (intervalType !== 'MILEAGE' && !intervalDays) {
      setError('Day interval is required.')
      return
    }

    setSaving(true)
    setError(null)
    try {
      const payload = {
        templateId,
        intervalType,
        intervalMileage: intervalType !== 'DATE' ? Number(intervalMileage) : undefined,
        intervalDays: intervalType !== 'MILEAGE' ? Number(intervalDays) : undefined,
        isActive,
      }
      const saved = schedule
        ? await updateSchedule(bikeId, schedule.id, payload)
        : await createSchedule(bikeId, payload)
      if (saved) onClose()
      else setError('Failed to save schedule.')
    } catch {
      setError('Failed to save schedule.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!schedule) return
    if (!window.confirm(`Delete ${schedule.templateName} schedule? Service logs remain in history.`)) return
    await deleteSchedule(bikeId, schedule.id)
    onClose()
  }

  return (
    <div className="sheet-backdrop" role="presentation" onClick={onClose}>
      <section className="action-sheet card" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
        <button className="sheet-close" onClick={onClose} type="button" aria-label="Close">×</button>
        <p className="eyebrow">Maintenance</p>
        <h2 className="sheet-title">{isEditing ? schedule?.templateName : 'Add Schedule'}</h2>
        <form className="form-stack" onSubmit={handleSubmit}>
          {!isEditing ? (
            <label>
              <span>Task</span>
              <select value={templateId} onChange={(event) => setTemplateId(event.target.value)}>
                <option value="">Select task</option>
                {templates.map((template) => (
                  <option key={template.id} value={template.id}>{template.icon} {template.name}</option>
                ))}
              </select>
            </label>
          ) : null}
          <label>
            <span>Interval Type</span>
            <select value={intervalType} onChange={(event) => setIntervalType(event.target.value as IntervalType)}>
              <option value="MILEAGE">Mileage</option>
              <option value="DATE">Date</option>
              <option value="BOTH">Both</option>
            </select>
          </label>
          {intervalType !== 'DATE' ? (
            <label><span>Every X km</span><input inputMode="numeric" value={intervalMileage} onChange={(event) => setIntervalMileage(event.target.value)} /></label>
          ) : null}
          {intervalType !== 'MILEAGE' ? (
            <label><span>Every X days</span><input inputMode="numeric" value={intervalDays} onChange={(event) => setIntervalDays(event.target.value)} /></label>
          ) : null}
          {isEditing ? (
            <label className="checkbox-row">
              <input checked={isActive} onChange={(event) => setIsActive(event.target.checked)} type="checkbox" />
              <span>Schedule active</span>
            </label>
          ) : null}
          {error ? <p className="form-error">{error}</p> : null}
          <button className="button" disabled={saving} type="submit">{saving ? 'Saving...' : 'Save Schedule'}</button>
          {isEditing ? <button className="button button--danger" onClick={() => void handleDelete()} type="button">Delete Schedule</button> : null}
        </form>
      </section>
    </div>
  )
}
