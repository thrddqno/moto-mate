import { useEffect, useState } from 'react'
import { useBikeStore } from '../../stores/bikeStore'
import { LogServiceModal } from './LogServiceModal'
import { MileageModal } from './MileageModal'

type Step = 'bike' | 'action' | null
type Action = 'mileage' | 'service'

interface QuickActionFabProps {
  bikeId?: string
}

export function QuickActionFab({ bikeId }: QuickActionFabProps) {
  const { bikes, fetchBikes } = useBikeStore()
  const [step, setStep] = useState<Step>(null)
  const [selectedBikeId, setSelectedBikeId] = useState<string | null>(bikeId || null)
  const [activeAction, setActiveAction] = useState<Action | null>(null)

  useEffect(() => {
    if (step === 'bike' && bikes.length === 0) {
      void fetchBikes()
    }
  }, [bikes.length, fetchBikes, step])

  function openFlow() {
    setSelectedBikeId(bikeId || null)
    setStep(bikeId ? 'action' : 'bike')
  }

  function closeSheet() {
    setStep(null)
  }

  function selectAction(action: Action) {
    setActiveAction(action)
    closeSheet()
  }

  return (
    <>
      <button className="fab" onClick={openFlow} type="button" aria-label="Quick log action">
        +
      </button>

      {step ? (
        <div className="sheet-backdrop" role="presentation" onClick={closeSheet}>
          <section className="action-sheet card" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
            <button className="sheet-close" onClick={closeSheet} type="button" aria-label="Close">×</button>
            {step === 'bike' ? (
              <>
                <p className="eyebrow">Quick Action</p>
                <h2 className="sheet-title">Select Bike</h2>
                <div className="sheet-options">
                  {bikes.map((bike) => (
                    <button
                      className="sheet-option"
                      key={bike.id}
                      onClick={() => {
                        setSelectedBikeId(bike.id)
                        setStep('action')
                      }}
                      type="button"
                    >
                      <span>🏍</span>
                      <strong>{bike.name}</strong>
                      <small>{bike.currentMileage.toLocaleString()} km</small>
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <>
                <p className="eyebrow">Quick Action</p>
                <h2 className="sheet-title">What do you want to log?</h2>
                <div className="sheet-options">
                  <button className="sheet-option" onClick={() => selectAction('mileage')} type="button">
                    <span>↗</span>
                    <strong>Update Mileage</strong>
                    <small>Refresh current odometer reading</small>
                  </button>
                  <button className="sheet-option" onClick={() => selectAction('service')} type="button">
                    <span>🔧</span>
                    <strong>Log Service</strong>
                    <small>Record completed maintenance</small>
                  </button>
                </div>
              </>
            )}
          </section>
        </div>
      ) : null}

      <MileageModal bikeId={selectedBikeId} open={activeAction === 'mileage'} onClose={() => setActiveAction(null)} />
      <LogServiceModal bikeId={selectedBikeId} open={activeAction === 'service'} onClose={() => setActiveAction(null)} />
    </>
  )
}
