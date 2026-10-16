import React, { useState, useEffect } from 'react';
import { Recipe, RecipeStep } from '../../shared/types.js';
import { getRecipeEditorial } from '../services/editorialData.js';
import {
  ArrowLeft,
  ChevronLeft,
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

  const editorial = getRecipeEditorial(recipe.id, recipe.editorial);
  const heroImageSrc = recipe.editorial?.image_url || editorial?.image || '/images/tagliatelle-ragu.jpg';

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
        if (
          typeof parsed.stepIdx === 'number' &&
          parsed.stepIdx >= 0 &&
          parsed.stepIdx < steps.length
        ) {
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
      localStorage.setItem(
        `atlas_cook_progress_${recipe.id}`,
        JSON.stringify({
          stepIdx: currentStepIdx,
          completed: completedSteps,
          isCompleted,
        })
      );
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

  // Circular timer calculation
  const totalStepSeconds = (currentStep?.duration_minutes || 0) * 60;
  const radius = 68;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    totalStepSeconds > 0
      ? circumference * (1 - secondsRemaining / totalStepSeconds)
      : 0;

  // Human-friendly parallel info
  const isParallelRoot =
    Array.isArray(currentStep?.depends_on) && currentStep.depends_on.length === 0;

  // Extract step headline or key action phrase
  const getStepHeadline = (instruction: string, num: number) => {
    if (!instruction) return `Pasul ${num}`;
    const clean = instruction.trim();
    const firstPeriod = clean.indexOf('.');
    const firstColon = clean.indexOf(':');
    const cutIdx =
      firstPeriod > 0 && firstColon > 0
        ? Math.min(firstPeriod, firstColon)
        : firstPeriod > 0
        ? firstPeriod
        : firstColon > 0
        ? firstColon
        : -1;

    if (cutIdx > 5 && cutIdx <= 45) {
      return clean.substring(0, cutIdx).trim();
    }
    return `Pasul ${num}`;
  };

  return (
    <div className="cook-mode-viewport cook-mode-overlay cook-mode-container">
      {/* Ambient Photographic Kitchen Backdrop */}
      <div
        className="cook-ambient-backdrop"
        style={{ backgroundImage: `url(${heroImageSrc})` }}
      />
      <div className="cook-ambient-overlay" />

      {/* Top Header Bar */}
      <header className="cook-mode-header">
        <button
          type="button"
          className="btn-cook-exit"
          onClick={handleExitCookMode}
          aria-label="Ieși din Cook Mode"
        >
          <ArrowLeft size={18} />
          <span className="btn-cook-exit-label-full">Înapoi la Rețetă</span>
          <span className="btn-cook-exit-label-short">Înapoi</span>
        </button>

        <div className="cook-header-title-box">
          <div className="cook-header-recipe-name">{recipe.title}</div>
          <div className="cook-step-indicator">
            Pasul {currentStepIdx + 1} din {steps.length}{' '}
            {scaleFactor !== 1 ? `(${currentServings} porții)` : ''}
          </div>
        </div>

        <div className="cook-header-percent">{Math.round(progressPercent)}%</div>
      </header>

      {/* Top Hairline Progress Bar */}
      <div className="cook-progress-track">
        <div className="cook-progress-fill" style={{ width: `${progressPercent}%` }} />
      </div>

      {/* Step Body Container */}
      <main className="cook-mode-content cook-mode-main">
        {isCompleted ? (
          <div className="cook-completion-screen">
            <div className="cook-completion-icon-wrapper">
              <CheckCircle size={48} />
            </div>
            <h1 className="cook-completion-title">Poftă Bună!</h1>
            <p className="cook-completion-desc">
              Ai completat cu succes toți cei {steps.length} pași pentru{' '}
              <strong>{recipe.title}</strong>. Preparatul este gata pentru servire!
            </p>
            <button
              type="button"
              className="btn btn-primary btn-cook-exit"
              onClick={handleExitCookMode}
            >
              Înapoi la Detalii Rețetă
            </button>
          </div>
        ) : currentStep ? (
          <div className="cook-step-container">
            {/* Context Notice / Parallel Tracking */}
            {isParallelRoot ? (
              <div className="cook-dependency-badge cook-dependency-badge--parallel">
                <GitFork size={14} />
                <strong>Pregătire în paralel:</strong> Se poate pregăti separat sau în avans
              </div>
            ) : Array.isArray(currentStep.depends_on) && currentStep.depends_on.length > 0 ? (
              <div className="cook-dependency-badge cook-dependency-badge--depends">
                <GitFork size={14} />
                Continuă după:{' '}
                {currentStep.depends_on
                  .map((dep) => {
                    const found = steps.find((s) => s.step_id === dep);
                    return found ? `Pasul ${found.step_number}` : dep;
                  })
                  .join(', ')}
              </div>
            ) : null}

            {/* Step Headline & Estimated Time */}
            <div className="cook-step-headline-wrap">
              <h2 className="cook-step-headline">
                {getStepHeadline(currentStep.instruction, currentStep.step_number || currentStepIdx + 1)}
              </h2>
              {currentStep.duration_minutes ? (
                <div className="cook-step-timing-est">
                  <Clock size={15} />
                  <span>
                    Timp estimat: {currentStep.duration_minutes} min
                    {currentStep.active_minutes ? ` • ${currentStep.active_minutes}m activ` : ''}
                    {currentStep.passive_minutes ? ` • ${currentStep.passive_minutes}m pasiv orientativ` : ''}
                  </span>
                </div>
              ) : null}
            </div>

            {/* Full Instruction */}
            <div className="cook-instruction">{currentStep.instruction}</div>

            {/* CIRCULAR RADIAL SVG TIMER (Approved Editorial Reference) */}
            {currentStep.duration_minutes && currentStep.duration_minutes > 0 ? (
              <div className="cook-radial-timer-section">
                <div className="cook-radial-timer-visual">
                  <svg
                    className="cook-radial-svg"
                    width="180"
                    height="180"
                    viewBox="0 0 180 180"
                  >
                    {/* Background Track Circle */}
                    <circle
                      cx="90"
                      cy="90"
                      r={radius}
                      className="cook-radial-track"
                    />
                    {/* Active Gold Radial Progress Circle */}
                    <circle
                      cx="90"
                      cy="90"
                      r={radius}
                      className="cook-radial-progress"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      transform="rotate(-90 90 90)"
                    />
                  </svg>

                  {/* Center Numerical Time & Label */}
                  <div className="cook-radial-center-content">
                    <div
                      className={`cook-timer-display ${
                        secondsRemaining === 0
                          ? 'cook-timer-display--complete'
                          : isTimerRunning
                          ? 'cook-timer-display--running'
                          : ''
                      }`}
                    >
                      {formatTimer(secondsRemaining)}
                    </div>
                    <span className="cook-radial-label">
                      {currentStep.passive_minutes ? 'Timp pasiv orientativ' : 'Timp rămas'}
                    </span>
                  </div>
                </div>

                {/* Pill Controls Row */}
                <div className="cook-radial-controls-row">
                  <button
                    type="button"
                    className={`cook-pill-btn-timer ${
                      isTimerRunning ? 'cook-pill-btn-timer--pause' : ''
                    }`}
                    onClick={() => setIsTimerRunning((r) => !r)}
                  >
                    {isTimerRunning ? <Pause size={16} /> : <Play size={16} />}
                    <span>{isTimerRunning ? 'Pauză' : 'Pornește'}</span>
                  </button>

                  <button
                    type="button"
                    className="cook-pill-btn-icon"
                    onClick={() => {
                      setIsTimerRunning(false);
                      setSecondsRemaining((currentStep.duration_minutes || 0) * 60);
                    }}
                    title="Resetează cronometrul"
                    aria-label="Resetează cronometrul"
                  >
                    <RotateCcw size={15} />
                  </button>

                  <button
                    type="button"
                    className="cook-pill-btn-icon"
                    onClick={() => setSecondsRemaining((s) => s + 60)}
                    title="Adaugă 1 minut"
                    aria-label="Adaugă 1 minut"
                  >
                    +1m
                  </button>
                </div>
              </div>
            ) : null}

            {/* Ingredients Needed in this Step */}
            {currentStep.ingredient_refs && currentStep.ingredient_refs.length > 0 && (
              <div className="cook-ingredients-box">
                <div className="cook-panel-eyebrow">Ingrediente pentru acest pas:</div>
                <div className="cook-ingredients-list">
                  {currentStep.ingredient_refs.map((refId) => {
                    const ing = (recipe.ingredients || []).find(
                      (i) => (i.ingredient_id || i.id) === refId
                    );
                    const alloc = (currentStep.allocations || []).find(
                      (a) => a.ingredient_id === refId
                    );

                    return (
                      <span key={refId} className="cook-ingredient-tag">
                        {alloc?.quantity_used_in_step ? (
                          <strong className="cook-ingredient-tag-qty">
                            {formatScaledQuantity(alloc.quantity_used_in_step)}{' '}
                            {alloc.unit || ing?.unit || ''}{' '}
                          </strong>
                        ) : ing?.quantity ? (
                          <strong className="cook-ingredient-tag-qty">
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

            {/* Step Thermal Constraint Highlight */}
            {currentStep.thermal_constraints && currentStep.thermal_constraints.length > 0 && (
              <div className="cook-panel cook-thermal-panel">
                <Thermometer size={20} className="cook-thermal-icon" />
                <div>
                  <div className="cook-panel-eyebrow">Temperatură Recomandată</div>
                  <div className="cook-thermal-value">
                    {currentStep.thermal_constraints.map((tc, idx) => (
                      <span key={idx}>
                        {tc.notes || 'Temperatură'}:{' '}
                        {tc.target_c
                          ? `${tc.target_c}°C`
                          : `${tc.min_c ?? ''}-${tc.max_c ?? ''}°C`}{' '}
                        (
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
              <div className="cook-risks-container">
                {currentStep.risks.map((risk, rIdx) => {
                  const isIrreversible = risk.warning_type === 'irreversible_risk';
                  return (
                    <div
                      key={rIdx}
                      className={`cook-risk-badge cook-risk-badge--${
                        isIrreversible ? 'irreversible' : 'quality'
                      }`}
                    >
                      <ShieldAlert
                        size={18}
                        className={`cook-risk-icon cook-risk-icon--${
                          isIrreversible ? 'irreversible' : 'quality'
                        }`}
                      />
                      <div>
                        <strong className="cook-risk-title">
                          [{isIrreversible ? 'Atenție Sporită' : 'Sfat Culinar'}]:
                        </strong>{' '}
                        {risk.message}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Sfat / Sensory Success Cue Callout Box */}
            {(currentStep.success_cue || editorial?.chefTip) && (
              <div className="cook-tip-callout-card">
                <div className="cook-tip-callout-header">
                  <Sparkles size={16} className="cook-tip-callout-icon" />
                  <span className="cook-tip-callout-title">Sfat</span>
                </div>
                <p className="cook-tip-callout-text">
                  {currentStep.success_cue || editorial?.chefTip}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div>Niciun pas definit pentru această rețetă.</div>
        )}
      </main>

      {/* Floating Bottom Navigation Bar */}
      {!isCompleted && (
        <footer className="cook-mode-footer">
          <button
            type="button"
            className="cook-nav-btn-prev"
            disabled={currentStepIdx === 0}
            onClick={handlePrev}
          >
            <ChevronLeft size={18} />
            <span>← Înapoi</span>
          </button>

          <div className="cook-dot-tracker">
            {steps.map((_, i) => (
              <div
                key={i}
                onClick={() => setCurrentStepIdx(i)}
                className={`cook-dot ${
                  i === currentStepIdx
                    ? 'cook-dot--active'
                    : completedSteps[i]
                    ? 'cook-dot--completed'
                    : ''
                }`}
                title={`Sari la Pasul ${i + 1}`}
              />
            ))}
          </div>

          {isLastStep ? (
            <button
              type="button"
              className="btn-cook-next btn-cook-finish cook-nav-btn-finish"
              onClick={handleFinish}
            >
              <CheckCircle size={18} />
              <span>Finalizează rețeta ✓</span>
            </button>
          ) : (
            <button
              type="button"
              className="btn-next-step btn-cook-next cook-nav-btn-next"
              onClick={handleNext}
            >
              <span>Continuă →</span>
            </button>
          )}
        </footer>
      )}
    </div>
  );
};
