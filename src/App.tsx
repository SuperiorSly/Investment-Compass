import { useMemo, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { QUESTIONS } from './data/questions'
import type { SubmitStatus, SurveyPayload } from './types'
import './App.css'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function App() {
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [emailError, setEmailError] = useState<string | null>(null)
  const [status, setStatus] = useState<SubmitStatus>('idle')
  const [attemptedSubmit, setAttemptedSubmit] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const formRef = useRef<HTMLFormElement>(null)

  const requiredQuestions = useMemo(
    () => QUESTIONS.filter((q) => q.required !== false),
    []
  )

  const answeredCount = useMemo(
    () => requiredQuestions.filter((q) => Boolean(answers[q.id])).length,
    [answers, requiredQuestions],
  )
  const missingQuestions = useMemo(
    () => requiredQuestions.filter((q) => !answers[q.id]),
    [answers, requiredQuestions],
  )

  function handleAnswer(questionId: string, value: string) {
    setAnswers((prev) => ({ ...prev, [questionId]: value }))
  }

  function scrollToQuestion(questionId: string) {
    const node = formRef.current?.querySelector<HTMLElement>(`#q-${questionId}`)
    node?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setAttemptedSubmit(true)
    setEmailError(null)

    if (missingQuestions.length > 0) {
      scrollToQuestion(missingQuestions[0].id)
      return
    }

    const trimmedEmail = email.trim()
    if (trimmedEmail && !EMAIL_PATTERN.test(trimmedEmail)) {
      setEmailError('عنوان البريد الإلكتروني يبدو غير مكتمل.')
      return
    }

    const webhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL

    if (!webhookUrl) {
      setStatus('error')
      setErrorMessage(
        'الاستبيان غير متصل بعد. قم بتعيين VITE_N8N_WEBHOOK_URL في ملف .env وأعد تشغيل التطبيق.',
      )
      return
    }

    const payload: SurveyPayload = {
      answers,
      email: trimmedEmail || null,
      phone: phone.trim() || null,
      submittedAt: new Date().toISOString(),
      source: 'smart-cane-survey-web',
    }

    setStatus('submitting')
    setErrorMessage('')

    try {
      const webhookToken = import.meta.env.VITE_N8N_WEBHOOK_TOKEN

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(webhookToken ? { Authorization: `Bearer ${webhookToken}` } : {}),
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error(`Webhook responded with status ${response.status}`)
      }

      setStatus('success')
    } catch {
      setStatus('error')
      setErrorMessage(
        'حدث خطأ أثناء إرسال إجاباتك. يرجى المحاولة مرة أخرى بعد لحظات.',
      )
    }
  }

  if (status === 'success') {
    return (
      <div className="page">
        <main className="success-screen" role="status">
          <span className="success-mark" aria-hidden="true">
            ✓
          </span>
          <h1>شكراً لك — تم استلام إجاباتك.</h1>
          <p>
            نقرأ كل إجابة بأنفسنا. ما شاركته سيساعدنا في تحديد ما نبنيه أولاً.
          </p>
        </main>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="sticky-bar">
        <div className="sticky-inner">
          <span className="brand">بوصلة الاستثمار</span>
          <div className="tap-path" aria-hidden="true">
            {requiredQuestions.map((q) => (
              <span
                key={q.id}
                className={`tap${answers[q.id] ? ' is-filled' : ''}`}
              />
            ))}
          </div>
          <span className="progress-count">
            {answeredCount}/{requiredQuestions.length}
          </span>
        </div>
      </div>

      <main>
        <header className="hero">
          <p className="eyebrow">استبيان سريع ✨</p>
          <h1>شاركنا رأيك في منصة بوصلة الاستثمار.</h1>
          <p className="hero-sub">
            نحتاج إلى رأيك لتصميم أفضل تجربة لربط المستثمرين بأصحاب المشاريع. الاستبيان سهل جداً ولن يأخذ من وقتك الكثير!
          </p>
        </header>

        <section className="project-overview">
          <h2>نبذة عن المشروع 🚀</h2>
          <p>
            بوصلة الاستثمار هي منصة (SaaS) تربط بين المستثمرين العراقيين ورواد الأعمال وأصحاب المشاريع الباحثين عن استثمار. توفر المنصة:
          </p>
          <ul>
            <li><strong>معلومات مالية موثوقة:</strong> بيانات مدققة لمساعدتك في اتخاذ قراراتك.</li>
            <li><strong>تحليلات مدعومة بالذكاء الاصطناعي:</strong> لتقييم الفرص والمخاطر.</li>
            <li><strong>أدوات تواصل آمنة:</strong> لضمان الخصوصية والشفافية.</li>
            <li><strong>تتبع أداء المشاريع:</strong> لمتابعة استثماراتك بكل ثقة.</li>
          </ul>
        </section>

        <form ref={formRef} onSubmit={handleSubmit} noValidate>
          <div className="question-list">
            {QUESTIONS.map((q) => {
              const isMissing = attemptedSubmit && !answers[q.id]
              return (
                <fieldset
                  key={q.id}
                  id={`q-${q.id}`}
                  className={`question-card${isMissing ? ' is-missing' : ''}`}
                >
                  <legend className="question-legend">
                    <span className="question-index">
                      {String(q.number).padStart(2, '0')}
                    </span>
                    <span className="question-prompt">{q.prompt}</span>
                  </legend>
                  {q.type === 'text' ? (
                    <div className="text-input-group">
                      <textarea
                        name={q.id}
                        value={answers[q.id] || ''}
                        onChange={(e) => handleAnswer(q.id, e.target.value)}
                        placeholder="اكتب ملاحظاتك أو اقتراحاتك هنا..."
                        rows={4}
                        className="note-textarea"
                      />
                    </div>
                  ) : (
                    <div className="option-group">
                      {q.options?.map((opt) => {
                        const isCheckbox = q.type === 'checkbox'
                        const selected = isCheckbox 
                          ? answers[q.id]?.split(',').includes(opt.value)
                          : answers[q.id] === opt.value

                        return (
                          <label
                            key={opt.value}
                            className={`option-pill${selected ? ' is-selected' : ''}`}
                          >
                            <input
                              type={isCheckbox ? 'checkbox' : 'radio'}
                              name={q.id}
                              value={opt.value}
                              checked={selected || false}
                              onChange={(e) => {
                                if (isCheckbox) {
                                  const current = answers[q.id] ? answers[q.id].split(',') : []
                                  if (e.target.checked) {
                                    handleAnswer(q.id, [...current, opt.value].join(','))
                                  } else {
                                    const next = current.filter((v) => v !== opt.value)
                                    handleAnswer(q.id, next.join(','))
                                  }
                                } else {
                                  handleAnswer(q.id, opt.value)
                                }
                              }}
                            />
                            <span>{opt.label}</span>
                          </label>
                        )
                      })}
                    </div>
                  )}
                  {isMissing && (
                    <p className="field-hint" role="alert">
                      اختر إجابة للمتابعة
                    </p>
                  )}
                </fieldset>
              )
            })}
          </div>

          <section className="contact-card">
            <h2>
              هل تريد أن نتواصل معك؟ <span className="optional-tag">كلاهما اختياري</span>
            </h2>
            <div className="contact-grid">
              <div className="field">
                <label htmlFor="email">البريد الإلكتروني</label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                />
                {emailError && (
                  <p className="field-error" role="alert">
                    {emailError}
                  </p>
                )}
              </div>
              <div className="field">
                <label htmlFor="phone">رقم الهاتف</label>
                <input
                  id="phone"
                  type="tel"
                  autoComplete="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+٩٦٤ ٧xx xxx xxxx"
                />
              </div>
            </div>
          </section>

          <div className="submit-row">
            <button
              type="submit"
              className="submit-btn"
              disabled={status === 'submitting'}
            >
              {status === 'submitting' ? 'جارٍ إرسال إجاباتك…' : 'أرسل إجاباتي'}
            </button>

            {status === 'error' && (
              <p className="status-error" role="alert">
                {errorMessage}
              </p>
            )}
            {attemptedSubmit && status === 'idle' && missingQuestions.length > 0 && (
              <p className="status-error" role="alert">
                {missingQuestions.length} سؤال
                {missingQuestions.length > 1 ? '' : ''} متبقي — مرّر للأعلى لإكمال الاستبيان.
              </p>
            )}
          </div>
        </form>
      </main>

      <footer className="page-footer">
        <p>إجاباتك تساعدنا في تحديد ما نبنيه أولاً. لا رسائل مزعجة، أبداً.</p>
      </footer>
    </div>
  )
}

export default App
