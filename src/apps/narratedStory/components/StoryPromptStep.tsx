import { useState } from 'react'
import type { ComponentType } from 'react'
import {
  GiScrollUnfurled,
  GiBookCover,
  GiHeart,
  GiQuillInk,
} from '@/theme/icons'
import { useNarratedStoryTranslation } from '../i18n'
import '../narratedStory.css'

export interface StoryPromptStepValues {
  systemPrompt: string
  storyPrompt: string
  kinksPrompt: string
  extraIndications: string
}

interface StoryPromptStepProps {
  /** System prompt por defecto (defaultSystemPrompt). */
  initialSystemPrompt: string
  /** Story prompt por defecto (defaultStoryPrompt). */
  initialStoryPrompt: string
  /** Kinks por defecto (defaultKinksPrompt). */
  initialKinksPrompt: string
  /** Indicaciones extra por defecto (defaultExtraIndications). */
  initialExtraIndications: string
  onConfirm: (values: StoryPromptStepValues) => void
  onBack: () => void
}

export const StoryPromptStep: ComponentType<StoryPromptStepProps> = ({
  initialSystemPrompt,
  initialStoryPrompt,
  initialKinksPrompt,
  initialExtraIndications,
  onConfirm,
  onBack,
}) => {
  const { t } = useNarratedStoryTranslation()
  const [systemPrompt, setSystemPrompt] = useState(initialSystemPrompt)
  const [storyPrompt, setStoryPrompt] = useState(initialStoryPrompt)
  const [kinksPrompt, setKinksPrompt] = useState(initialKinksPrompt)
  const [extraIndications, setExtraIndications] = useState(initialExtraIndications)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onConfirm({
      systemPrompt: systemPrompt.trim() || initialSystemPrompt,
      storyPrompt: storyPrompt.trim() || initialStoryPrompt,
      kinksPrompt: kinksPrompt.trim() || initialKinksPrompt,
      extraIndications: extraIndications.trim() || initialExtraIndications,
    })
  }

  return (
    <div
      className="ns-launcher-backdrop ns-story-prompt-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ns-story-prompt-title"
    >
      <div className="ns-story-prompt-modal ns-launcher-modal ns-story-prompt-modal--wide">
        <h1 id="ns-story-prompt-title" className="ns-launcher-title">
          <GiScrollUnfurled className="icon icon-md" aria-hidden />
          {' '}
          {t('narratedStory.storyPromptStep.title')}
        </h1>
        <p className="ns-launcher-subtitle">{t('narratedStory.storyPromptStep.subtitle')}</p>

        <form onSubmit={handleSubmit} className="ns-story-prompt-form">
          <p className="ns-story-prompt-hint">{t('narratedStory.storyPromptStep.hint')}</p>

          <section className="ns-story-prompt-section" aria-labelledby="ns-story-prompt-system-label">
            <label id="ns-story-prompt-system-label" className="ns-story-prompt-label">
              <GiScrollUnfurled className="ns-story-prompt-label-icon" aria-hidden />
              {t('narratedStory.storyPromptStep.systemPromptLabel')}
            </label>
            <textarea
              className="ns-story-prompt-textarea"
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              placeholder={t('narratedStory.systemPrompt.placeholder')}
              rows={6}
              aria-label={t('narratedStory.storyPromptStep.systemPromptLabel')}
            />
          </section>

          <section className="ns-story-prompt-section" aria-labelledby="ns-story-prompt-plot-label">
            <label id="ns-story-prompt-plot-label" className="ns-story-prompt-label">
              <GiBookCover className="ns-story-prompt-label-icon" aria-hidden />
              {t('narratedStory.storyPromptStep.storyPromptLabel')}
            </label>
            <textarea
              className="ns-story-prompt-textarea"
              value={storyPrompt}
              onChange={(e) => setStoryPrompt(e.target.value)}
              placeholder={t('narratedStory.storyPromptStep.storyPromptPlaceholder')}
              rows={5}
              aria-label={t('narratedStory.storyPromptStep.storyPromptLabel')}
            />
          </section>

          <section className="ns-story-prompt-section" aria-labelledby="ns-story-prompt-kinks-label">
            <label id="ns-story-prompt-kinks-label" className="ns-story-prompt-label">
              <GiHeart className="ns-story-prompt-label-icon" aria-hidden />
              {t('narratedStory.storyPromptStep.kinksLabel')}
            </label>
            <textarea
              className="ns-story-prompt-textarea ns-story-prompt-textarea--short"
              value={kinksPrompt}
              onChange={(e) => setKinksPrompt(e.target.value)}
              placeholder={t('narratedStory.storyPromptStep.kinksPlaceholder')}
              rows={2}
              aria-label={t('narratedStory.storyPromptStep.kinksLabel')}
            />
          </section>

          <section className="ns-story-prompt-section" aria-labelledby="ns-story-prompt-extra-label">
            <label id="ns-story-prompt-extra-label" className="ns-story-prompt-label">
              <GiQuillInk className="ns-story-prompt-label-icon" aria-hidden />
              {t('narratedStory.storyPromptStep.extraIndicationsLabel')}
            </label>
            <textarea
              className="ns-story-prompt-textarea ns-story-prompt-textarea--short"
              value={extraIndications}
              onChange={(e) => setExtraIndications(e.target.value)}
              placeholder={t('narratedStory.storyPromptStep.extraIndicationsPlaceholder')}
              rows={2}
              aria-label={t('narratedStory.storyPromptStep.extraIndicationsLabel')}
            />
          </section>

          <div className="ns-story-prompt-actions">
            <button
              type="button"
              className="ns-story-prompt-back"
              onClick={onBack}
            >
              {t('narratedStory.storyPromptStep.back')}
            </button>
            <button type="submit" className="ns-launcher-submit ns-story-prompt-begin">
              {t('narratedStory.storyPromptStep.begin')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
