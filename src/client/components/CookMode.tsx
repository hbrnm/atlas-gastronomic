import React, { useState, useEffect } from 'react';
import { Recipe, RecipeStep } from '../../shared/types.js';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  RotateCcw,
  Thermometer,
  ShieldAlert,
  CheckCircle,
  Clock,
  Sparkles,
  GitFork,
} from 'lucide-react';

interface CookModeProps {
  recipe: Recipe;
  servings?: number;
  onExit: () => void;
}

function playCompletionChime() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.3); // A5
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.8);
  } catch (e) {
    // Audio might be blocked by browser autoplay policy
  }
}

export const CookMode: React.FC<CookModeProps> = ({ recipe, servings, onExit }) => {
  const steps = recipe.steps || [];
  const baseYield = recipe.yield?.quantity || 4;
  const currentServings = servings && servings > 0 ? servings : baseYield;
  const scaleFactor = currentServings / baseYield;

  const formatScaledQuantity = (qty: number | null | undefined): string => {
    if (qty === null || qty === undefined) return '';
    const scaled = qty * scaleFactor;
    if (Number.isInteger(scaled)) return scaled.toString();
    if (scaled < 1) return scaled.toFixed(2).replace(/\.?0+$/, '');
    return scaled.toFixed(1).replace(/\.?0+$/, '');
  };
  
  // Load saved cook step from localStorage if available across page reloads
  const [currentStepIdx, setCurrentStepIdx] = useState(() => {
    try {
      const saved = localStorage.getItem(`atlas_cook_progress_${recipe.id}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.stepIdx === 'number' && parsed.stepIdx >= 0 && parsed.stepIdx < steps.length) {
          return parsed.stepIdx;
        }
      }
    } catch {}
    return 0;
  });

  // Timer states for the current step
  const currentStep: RecipeStep | undefined = steps[currentStepIdx];
  const defaultSeconds = (currentStep?.duration_minutes || 0) * 60;
  const [secondsRemaining, setSecondsRemaining] = useState<number>(defaultSeconds);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>(() => {
    try {
      const saved = localStorage.getItem(`atlas_cook_progress_${recipe.id}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.completed) return parsed.completed;
      }
    } catch {}
    return {};
  });
  const [isCompleted, setIsCompleted] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(`atlas_cook_progress_${recipe.id}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        return Boolean(parsed.isCompleted);
      }
    } catch {}
    return false;
  });

  // Save cook progress on change
  useEffect(() => {
    try {
      localStorage.setItem(`atlas_cook_progress_${recipe.id}`, JSON.stringify({
        stepIdx: currentStepIdx,
        completed: completedSteps,
        isCompleted,
      }));
    } catch {}
  }, [recipe.id, currentStepIdx, completedSteps, isCompleted]);

  const handleExitCookMode = () => {
    try {
      localStorage.removeItem(`atlas_cook_progress_${recipe.id}`);
    } catch {}
    onExit();
  };

  // Reset timer when step changes
  useEffect(() => {
    const s = (currentStep?.duration_minutes || 0) * 60;
    setSecondsRemaining(s);
    setIsTimerRunning(false);
  }, [currentStepIdx, currentStep?.duration_minutes]);

  // Interval ticker
  useEffect(() => {
    let timer: any = null;
    if (isTimerRunning && secondsRemaining > 0) {
      timer = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setIsTimerRunning(false);
            playCompletionChime();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isTimerRunning, secondsRemaining]);

  const formatTimer = (totalSec: number) => {
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleNext = () => {
    setCompletedSteps((prev) => ({ ...prev, [currentStepIdx]: true }));
    if (currentStepIdx < steps.length - 1) {
      setCurrentStepIdx((i: number) => i + 1);
    }
  };

  const handleFinish = () => {
    setCompletedSteps((prev) => ({ ...prev, [currentStepIdx]: true }));
    setIsCompleted(true);
    playCompletionChime();
  };

  const handlePrev = () => {
    if (currentStepIdx > 0) {
      setCurrentStepIdx((i: number) => i - 1);
    }
  };

  const isLastStep = currentStepIdx === steps.length - 1;
  const progressPercent = steps.length > 0 ? ((currentStepIdx + 1) / steps.length) * 100 : 0;

  // Human-friendly parallel info
  const isParallelRoot = Array.isArray(currentStep?.depends_on) && currentStep.depends_on.length === 0;

  return (
    <div
      className="cook-mode-overlay cook-mode-container"
      style={{
        minHeight: '100vh',
        background: '#1c1917', // Dark slate contrast for kitchen readability
        color: '#fcfbf9',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Cook Mode Header Bar */}
      <header
        style={{
          background: '#292524',
          borderBottom: '1px solid #44403c',
          padding: '0.85rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <button
          type="button"
          className="btn-cook-exit"
          onClick={handleExitCookMode}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#d6d3d1',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: 600,
          }}
        >
          <ArrowLeft size={18} />
          Ieși din Cook Mode
        </button>

        <div style={{ textAlign: 'center', flex: 1, padding: '0 1rem' }}>
          <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#a8a29e' }}>
            {recipe.title}
          </div>
          <div className="cook-step-indicator" style={{ fontFamily: 'var(--font-serif)', fontSize: '1rem', color: '#ffedd5', fontWeight: 600 }}>
            Pasul {currentStepIdx + 1} din {steps.length} {scaleFactor !== 1 ? `(${currentServings} porții)` : ''}
          </div>
        </div>

        <div style={{ width: '80px', textAlign: 'right', fontSize: '0.85rem', color: '#fb923c', fontWeight: 700 }}>
          {Math.round(progressPercent)}%
        </div>
      </header>

      {/* Progress Bar */}
      <div style={{ width: '100%', height: '4px', background: '#44403c' }}>
        <div
          style={{
            width: `${progressPercent}%`,
            height: '100%',
            background: 'var(--accent-primary)',
            transition: 'width 0.3s ease',
          }}
        />
      </div>

      {/* Step Body Container */}
      <main
        style={{
          flex: 1,
          maxWidth: '820px',
          width: '100%',
          margin: '0 auto',
          padding: '2rem 1.5rem 6rem 1.5rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        {isCompleted ? (
          <div className="cook-completion-screen" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
            <div
              style={{
                width: '84px',
                height: '84px',
                borderRadius: '50%',
                background: 'rgba(34, 197, 94, 0.2)',
                color: '#4ade80',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.5rem auto',
                border: '2px solid #22c55e',
              }}
            >
              <CheckCircle size={48} />
            </div>
            <h1
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '2.5rem',
                color: '#fef3c7',
                marginBottom: '0.85rem',
              }}
            >
              Poftă Bună!
            </h1>
            <p
              style={{
                fontSize: '1.15rem',
                color: '#d6d3d1',
                marginBottom: '2.5rem',
                lineHeight: 1.6,
                maxWidth: '540px',
                margin: '0 auto 2.5rem auto',
              }}
            >
              Ai completat cu succes toți cei {steps.length} pași pentru <strong>{recipe.title}</strong>. Preparatul este gata pentru servire!
            </p>
            <button
              type="button"
              className="btn btn-primary btn-cook-exit"
              style={{
                padding: '0.85rem 2.25rem',
                fontSize: '1.05rem',
                fontWeight: 700,
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
              }}
              onClick={handleExitCookMode}
            >
              Înapoi la Detalii Rețetă
            </button>
          </div>
        ) : currentStep ? (
          <div>
            {/* Context Notice / Parallel Tracking in plain human language */}
            {isParallelRoot ? (
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.35rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(3, 105, 161, 0.25)',
                  color: '#38bdf8',
                  border: '1px solid #0284c7',
                  fontSize: '0.82rem',
                  marginBottom: '1rem',
                }}
              >
                <GitFork size={14} />
                <strong>Ramură Independentă:</strong> Se poate pregăti în paralel sau în avans
              </div>
            ) : Array.isArray(currentStep.depends_on) && currentStep.depends_on.length > 0 ? (
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.35rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(217, 119, 6, 0.2)',
                  color: '#fbbf24',
                  border: '1px solid #b45309',
                  fontSize: '0.82rem',
                  marginBottom: '1rem',
                }}
              >
                <GitFork size={14} />
                Continuă după pașii:{' '}
                {currentStep.depends_on
                  .map((dep) => {
                    const found = steps.find((s) => s.step_id === dep);
                    return found ? `Pasul ${found.step_number}` : dep;
                  })
                  .join(', ')}
              </div>
            ) : null}

            {/* Giant Instruction */}
            <div
              className="cook-instruction"
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '1.65rem',
                lineHeight: 1.55,
                color: '#fafaf9',
                marginBottom: '1.75rem',
                letterSpacing: '-0.01em',
              }}
            >
              {currentStep.instruction}
            </div>

            {/* Step Thermal Constraint Highlight */}
            {currentStep.thermal_constraints && currentStep.thermal_constraints.length > 0 && (
              <div
                style={{
                  marginBottom: '1.5rem',
                  padding: '0.85rem 1.1rem',
                  borderRadius: 'var(--radius-md)',
                  background: '#292524',
                  borderLeft: '4px solid #f59e0b',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                }}
              >
                <Thermometer size={22} style={{ color: '#f59e0b', flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#a8a29e', letterSpacing: '0.06em' }}>
                    Control Termic Critic
                  </div>
                  <div style={{ fontSize: '1rem', fontWeight: 600, color: '#fef3c7' }}>
                    {currentStep.thermal_constraints.map((tc, idx) => (
                      <span key={idx}>
                        {tc.notes || 'Temperatură'}:{' '}
                        {tc.target_c ? `${tc.target_c}°C` : `${tc.min_c ?? ''}-${tc.max_c ?? ''}°C`} (
                        {tc.measurement_point === 'product_core'
                          ? 'miez produs'
                          : tc.measurement_point === 'surface'
                          ? 'suprafață vas'
                          : 'cuptor/aparat'}
                        )
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step Risk Warnings */}
            {currentStep.risks && currentStep.risks.length > 0 && (
              <div style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {currentStep.risks.map((risk, rIdx) => (
                  <div
                    key={rIdx}
                    style={{
                      padding: '0.75rem 1rem',
                      borderRadius: 'var(--radius-sm)',
                      background:
                        risk.warning_type === 'irreversible_risk'
                          ? 'rgba(185, 28, 28, 0.25)'
                          : 'rgba(217, 119, 6, 0.2)',
                      border:
                        risk.warning_type === 'irreversible_risk'
                          ? '1px solid #ef4444'
                          : '1px solid #f59e0b',
                      color: '#fee2e2',
                      fontSize: '0.9rem',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.65rem',
                      lineHeight: 1.45,
                    }}
                  >
                    <ShieldAlert
                      size={18}
                      style={{
                        color: risk.warning_type === 'irreversible_risk' ? '#f87171' : '#fbbf24',
                        flexShrink: 0,
                        marginTop: '2px',
                      }}
                    />
                    <div>
                      <strong style={{ color: '#ffffff' }}>
                        [{risk.warning_type === 'irreversible_risk' ? 'Risc Ireversibil' : 'Atenție Culinară'}]:
                      </strong>{' '}
                      {risk.message}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Ingredients Needed in this Step */}
            {currentStep.ingredient_refs && currentStep.ingredient_refs.length > 0 && (
              <div
                style={{
                  marginBottom: '1.75rem',
                  padding: '1rem 1.25rem',
                  borderRadius: 'var(--radius-md)',
                  background: '#292524',
                  border: '1px solid #44403c',
                }}
              >
                <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: '#a8a29e', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>
                  Ingrediente utilizate la acest pas:
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {currentStep.ingredient_refs.map((refId) => {
                    const ing = (recipe.ingredients || []).find((i) => (i.ingredient_id || i.id) === refId);
                    const alloc = (currentStep.allocations || []).find((a) => a.ingredient_id === refId);

                    return (
                      <span
                        key={refId}
                        style={{
                          fontSize: '0.88rem',
                          padding: '0.35rem 0.75rem',
                          background: '#1c1917',
                          border: '1px solid #57534e',
                          borderRadius: 'var(--radius-sm)',
                          color: '#f5f5f4',
                          fontWeight: 500,
                        }}
                      >
                        {alloc?.quantity_used_in_step ? (
                          <strong style={{ color: '#fb923c' }}>
                            {formatScaledQuantity(alloc.quantity_used_in_step)} {alloc.unit || ing?.unit || ''}{' '}
                          </strong>
                        ) : ing?.quantity ? (
                          <strong style={{ color: '#fb923c' }}>
                            {formatScaledQuantity(ing.quantity)} {ing.unit || ''}{' '}
                          </strong>
                        ) : null}
                        {ing?.name || refId}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Sensory Success Cue */}
            {currentStep.success_cue && (
              <div
                style={{
                  marginBottom: '2rem',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(234, 88, 12, 0.15)',
                  borderLeft: '3px solid #ea580c',
                  fontSize: '0.92rem',
                  color: '#fed7aa',
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: '0.5rem',
                }}
              >
                <Sparkles size={16} style={{ color: '#fb923c', flexShrink: 0 }} />
                <div>
                  <strong>Indiciu de reușită:</strong> {currentStep.success_cue}
                </div>
              </div>
            )}

            {/* Interactive Step Countdown Timer */}
            {currentStep.duration_minutes && currentStep.duration_minutes > 0 ? (
              <div
                style={{
                  padding: '1.25rem',
                  borderRadius: 'var(--radius-md)',
                  background: '#292524',
                  border: isTimerRunning ? '1px solid var(--accent-primary)' : '1px solid #44403c',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '1rem',
                  boxShadow: isTimerRunning ? '0 0 15px rgba(234, 88, 12, 0.2)' : 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <Clock size={28} style={{ color: isTimerRunning ? '#fb923c' : '#a8a29e' }} />
                  <div>
                    <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#a8a29e', letterSpacing: '0.06em' }}>
                      Cronometru Pas ({currentStep.duration_minutes} min
                      {currentStep.active_minutes ? ` • ${currentStep.active_minutes}m activ` : ''}
                      {currentStep.passive_minutes ? ` • ${currentStep.passive_minutes}m pasiv orientativ` : ''})
                    </div>
                    <div
                      className="cook-timer-display"
                      style={{
                        fontFamily: 'monospace',
                        fontSize: '2.4rem',
                        fontWeight: 700,
                        color: secondsRemaining === 0 ? '#4ade80' : '#ffffff',
                        lineHeight: 1,
                        marginTop: '2px',
                      }}
                    >
                      {formatTimer(secondsRemaining)}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <button
                    type="button"
                    style={{
                      background: isTimerRunning ? '#dc2626' : 'var(--accent-primary)',
                      color: 'white',
                      border: 'none',
                      borderRadius: 'var(--radius-sm)',
                      padding: '0.65rem 1.15rem',
                      fontSize: '0.95rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                    }}
                    onClick={() => setIsTimerRunning((r) => !r)}
                  >
                    {isTimerRunning ? <Pause size={18} /> : <Play size={18} />}
                    {isTimerRunning ? 'Pauză' : 'Pornește'}
                  </button>

                  <button
                    type="button"
                    style={{
                      background: '#44403c',
                      color: '#d6d3d1',
                      border: 'none',
                      borderRadius: 'var(--radius-sm)',
                      padding: '0.65rem 0.85rem',
                      cursor: 'pointer',
                    }}
                    onClick={() => {
                      setIsTimerRunning(false);
                      setSecondsRemaining((currentStep.duration_minutes || 0) * 60);
                    }}
                    title="Resetează cronometrul"
                  >
                    <RotateCcw size={16} />
                  </button>

                  <button
                    type="button"
                    style={{
                      background: '#44403c',
                      color: '#d6d3d1',
                      border: 'none',
                      borderRadius: 'var(--radius-sm)',
                      padding: '0.65rem 0.85rem',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                    onClick={() => setSecondsRemaining((s) => s + 60)}
                    title="Adaugă 1 minut"
                  >
                    +1m
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        ) : (
          <div>Niciun pas definit pentru această rețetă.</div>
        )}
      </main>

      {/* Floating Bottom Navigation Bar */}
      {!isCompleted && (
        <footer
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            background: '#292524',
            borderTop: '1px solid #44403c',
            padding: '0.85rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            zIndex: 100,
            boxShadow: '0 -4px 12px rgba(0, 0, 0, 0.4)',
          }}
        >
          <button
            type="button"
            style={{
              background: currentStepIdx === 0 ? '#44403c' : '#57534e',
              color: currentStepIdx === 0 ? '#78716c' : '#ffffff',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              padding: '0.75rem 1.25rem',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: currentStepIdx === 0 ? 'not-allowed' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
            disabled={currentStepIdx === 0}
            onClick={handlePrev}
          >
            <ChevronLeft size={20} />
            Pasul Anterior
          </button>

          <div style={{ display: 'flex', gap: '0.35rem' }}>
            {steps.map((_, i) => (
              <div
                key={i}
                onClick={() => setCurrentStepIdx(i)}
                style={{
                  width: i === currentStepIdx ? '24px' : '8px',
                  height: '8px',
                  borderRadius: '4px',
                  background:
                    i === currentStepIdx
                      ? 'var(--accent-primary)'
                      : completedSteps[i]
                      ? '#15803d'
                      : '#57534e',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                title={`Sari la Pasul ${i + 1}`}
              />
            ))}
          </div>

          {isLastStep ? (
            <button
              type="button"
              className="btn-cook-next btn-cook-finish"
              style={{
                background: '#15803d',
                color: 'white',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                padding: '0.75rem 1.5rem',
                fontSize: '1rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '0 4px 12px rgba(21, 128, 61, 0.35)',
              }}
              onClick={handleFinish}
            >
              <CheckCircle size={20} />
              Rețetă Finalizată!
            </button>
          ) : (
            <button
              type="button"
              className="btn-next-step btn-cook-next"
              style={{
                background: 'var(--accent-primary)',
                color: 'white',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                padding: '0.75rem 1.5rem',
                fontSize: '1rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                boxShadow: '0 4px 12px rgba(154, 52, 18, 0.35)',
              }}
              onClick={handleNext}
            >
              Următorul Pas
              <ChevronRight size={20} />
            </button>
          )}
        </footer>
      )}
    </div>
  );
};
