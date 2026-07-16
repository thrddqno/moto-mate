import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { BackButton } from '../components/routing/BackButton'
import { useScheduleStore } from '../stores/scheduleStore'
import { useTemplateStore } from '../stores/templateStore'
import type { IntervalType, Schedule } from '../types'

interface ScheduleFormState {
  templateId: string
  intervalType: IntervalType
  intervalMileage: string
  intervalDays: string
  isActive: boolean
}

const initialState: ScheduleFormState = {
  templateId: '',
  intervalType: 'MILEAGE',
  intervalMileage: '',
  intervalDays: '',
  isActive: true,
}

function toFormState(schedule: Schedule): ScheduleFormState {
  return {
    templateId: schedule.templateId,
    intervalType: schedule.intervalType,
    intervalMileage: schedule.intervalMileage?.toString() || '',
    intervalDays: schedule.intervalDays?.toString() || '',
    isActive: schedule.isActive,
  }
}

export default function ScheduleFormPage() {
  const { bikeId, scheduleId } = useParams()
  const navigate = useNavigate()
  const { fetchTemplates, templates } = useTemplateStore()
  const { createSchedule, fetchSchedules, scheduleMap, updateSchedule } = useScheduleStore()
  const [form, setForm] = useState<ScheduleFormState>(initialState)
  const [dirty, setDirty] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const isEditing = Boolean(scheduleId)
  const schedules = bikeId ? scheduleMap[bikeId] || [] : []
  const selectedSchedule = scheduleId ? schedules.find((schedule) => schedule.id === scheduleId) : null
  const currentForm = selectedSchedule && !dirty ? toFormState(selectedSchedule) : form

  useEffect(() => {
    if (templates.length === 0) void fetchTemplates()
  }, [fetchTemplates, templates.length])

  useEffect(() => {
    if (bikeId && schedules.length === 0) void fetchSchedules(bikeId)
  }, [bikeId, fetchSchedules, schedules.length])

  function updateField<K extends keyof ScheduleFormState>(field: K, value: ScheduleFormState[K]) {
    if (!dirty && selectedSchedule) {
      setForm({ ...toFormState(selectedSchedule), [field]: value })
      setDirty(true)
      return
    }
    setForm((current) => ({ ...current, [field]: value }))
    setDirty(true)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!bikeId) return
    setError(null)

    if (!currentForm.templateId && !isEditing) {
      setError('Select a maintenance task.')
      return
    }
    if (currentForm.intervalType !== 'DATE' && !currentForm.intervalMileage) {
      setError('Mileage interval is required for this type.')
      return
    }
    if (currentForm.intervalType !== 'MILEAGE' && !currentForm.intervalDays) {
      setError('Day interval is required for this type.')
      return
    }

    setSaving(true)
    try {
      const payload = {
        templateId: currentForm.templateId,
        intervalType: currentForm.intervalType,
        intervalMileage: currentForm.intervalType !== 'DATE' ? Number(currentForm.intervalMileage) : undefined,
        intervalDays: currentForm.intervalType !== 'MILEAGE' ? Number(currentForm.intervalDays) : undefined,
        isActive: currentForm.isActive,
      }
      const saved = scheduleId
        ? await updateSchedule(bikeId, scheduleId, payload)
        : await createSchedule(bikeId, payload)
      if (saved) navigate(`/bikes/${bikeId}/schedules`, { replace: true })
      else setError('Failed to save schedule.')
    } catch {
      setError('Failed to save schedule. Check your connection and try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className="page">
      <header className="top-bar">
        <BackButton fallback={bikeId ? `/bikes/${bikeId}/schedules` : '/bikes'} label="Back to schedules" />
        <div>
          <p className="eyebrow">Maintenance</p>
          <h1 className="page-title">{isEditing ? 'EDIT SCHEDULE' : 'ADD SCHEDULE'}</h1>
        </div>
        <Link className="icon-button" to={bikeId ? `/bikes/${bikeId}/schedules` : '/bikes'} aria-label="Cancel">×</Link>
      </header>

      <form className="form-stack card form-card" onSubmit={handleSubmit}>
        {!isEditing ? (
          <label>
            <span>Task</span>
            <select value={currentForm.templateId} onChange={(event) => updateField('templateId', event.target.value)}>
              <option value="">Select task</option>
              {templates.map((template) => (
                <option key={template.id} value={template.id}>{template.icon} {template.name}</option>
              ))}
            </select>
          </label>
        ) : null}
        <label>
          <span>Interval Type</span>
          <select value={currentForm.intervalType} onChange={(event) => updateField('intervalType', event.target.value as IntervalType)}>
            <option value="MILEAGE">Mileage</option>
            <option value="DATE">Date</option>
            <option value="BOTH">Both</option>
          </select>
        </label>
        {currentForm.intervalType !== 'DATE' ? (
          <label>
            <span>Every X km</span>
            <input inputMode="numeric" value={currentForm.intervalMileage} onChange={(event) => updateField('intervalMileage', event.target.value)} placeholder="3000" />
          </label>
        ) : null}
        {currentForm.intervalType !== 'MILEAGE' ? (
          <label>
            <span>Every X days</span>
            <input inputMode="numeric" value={currentForm.intervalDays} onChange={(event) => updateField('intervalDays', event.target.value)} placeholder="180" />
          </label>
        ) : null}
        {isEditing ? (
          <label className="checkbox-row">
            <input checked={currentForm.isActive} onChange={(event) => updateField('isActive', event.target.checked)} type="checkbox" />
            <span>Schedule active</span>
          </label>
        ) : null}
        {error ? <p className="form-error">{error}</p> : null}
        <button className="button" disabled={saving} type="submit">
          {saving ? 'Saving...' : 'Save Schedule'}
        </button>
      </form>
    </main>
  )
}
