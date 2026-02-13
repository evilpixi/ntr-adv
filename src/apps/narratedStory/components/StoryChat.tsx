import { useRef, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import { GiScrollQuill } from '@/theme/icons'
import { useNarratedStoryTranslation } from '../i18n'
import type { ChatMessage } from '../types'

export interface StoryChatProps {
  messages: ChatMessage[]
  input: string
  onInputChange: (value: string) => void
  sentMessages: string[]
  sentDropdownOpen: boolean
  onToggleSentDropdown: () => void
  onSelectSentMessage: (message: string) => void
  creatingIntro: boolean
  responding: boolean
  onCreateIntro: () => void
  onSend: () => void
  textareaRef: React.RefObject<HTMLTextAreaElement>
}

export function StoryChat({
  messages,
  input,
  onInputChange,
  sentMessages,
  sentDropdownOpen,
  onToggleSentDropdown,
  onSelectSentMessage,
  creatingIntro,
  responding,
  onCreateIntro,
  onSend,
  textareaRef,
}: StoryChatProps) {
  const { t } = useNarratedStoryTranslation()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const isLoading = responding || creatingIntro

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSend()
    }
  }

  const placeholder =
    messages.length === 0 ? t('narratedStory.story.noIntroYet') : t('narratedStory.chat.placeholder')

  return (
    <div className="narrated-story-story-wrap">
      <div className="narrated-story-story-column">
        <h2 className="section-title narrated-story-chat-title">
          <GiScrollQuill className="icon icon-md icon-amber" aria-hidden />
          {' '}
          {t('narratedStory.title')}
        </h2>

        <div className="narrated-story-chat">
          <div className="narrated-story-messages" role="log" aria-label="Chat">
            {messages.length === 0 && (
              <div className="narrated-story-no-intro">
                <p className="narrated-story-welcome">{t('narratedStory.story.noIntroYet')}</p>
                <button
                  type="button"
                  className="narrated-story-create-intro-btn"
                  onClick={onCreateIntro}
                  disabled={creatingIntro}
                  aria-busy={creatingIntro}
                  aria-label={t('narratedStory.story.createIntro')}
                >
                  {creatingIntro
                    ? t('narratedStory.story.createIntroLoading')
                    : t('narratedStory.story.createIntro')}
                </button>
              </div>
            )}
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`narrated-story-message narrated-story-message--${msg.role}`}
                data-role={msg.role}
              >
                {msg.role === 'user' ? (
                  <div className="narrated-story-message-body narrated-story-message-body--text">
                    {msg.content}
                  </div>
                ) : (
                  <div className="narrated-story-message-body narrated-story-message-body--md">
                    {msg.events != null && msg.events.length > 0 && (
                      <ul className="narrated-story-turn-events" aria-label="Eventos del turno">
                        {msg.events.map((ev, i) => (
                          <li
                            key={i}
                            className={ev.sexual ? 'narrated-story-turn-event narrated-story-turn-event--sexual' : 'narrated-story-turn-event'}
                          >
                            {ev.text}
                          </li>
                        ))}
                      </ul>
                    )}
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                    {msg.turnSummary != null && msg.turnSummary !== '' && (
                      <div className="narrated-story-turn-summary" aria-label="Resumen del turno">
                        <ReactMarkdown>{msg.turnSummary}</ReactMarkdown>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div
                className="narrated-story-typing"
                role="status"
                aria-live="polite"
                aria-label={t('narratedStory.chat.aiTyping')}
              >
                <span className="narrated-story-typing-spinner" aria-hidden />
                <span className="narrated-story-typing-text">{t('narratedStory.chat.aiTyping')}</span>
              </div>
            )}
            <div ref={messagesEndRef} aria-hidden />
          </div>

          <div className="narrated-story-sent-dropdown-wrap">
            <button
              type="button"
              className="narrated-story-sent-toggle"
              aria-expanded={sentDropdownOpen}
              aria-haspopup="listbox"
              aria-label={t('narratedStory.chat.sentMessages')}
              onClick={onToggleSentDropdown}
            >
              {t('narratedStory.chat.sentMessages')}
            </button>
            {sentDropdownOpen && (
              <ul
                className="narrated-story-sent-list"
                role="listbox"
                aria-label={t('narratedStory.chat.sentMessages')}
              >
                {sentMessages.length === 0 ? (
                  <li className="narrated-story-sent-empty" role="option">
                    {t('narratedStory.chat.sentMessagesEmpty')}
                  </li>
                ) : (
                  [...sentMessages].reverse().map((msg, i) => (
                    <li
                      key={`sent-${sentMessages.length - 1 - i}`}
                      role="option"
                      className="narrated-story-sent-item"
                      onClick={() => onSelectSentMessage(msg)}
                    >
                      {msg.length > 60 ? `${msg.slice(0, 60)}…` : msg}
                    </li>
                  ))
                )}
              </ul>
            )}
          </div>

          <div className="narrated-story-composer">
            <textarea
              ref={textareaRef}
              className="narrated-story-input"
              placeholder={placeholder}
              value={input}
              onChange={(e) => onInputChange(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={3}
              aria-label={t('narratedStory.chat.placeholder')}
              disabled={messages.length === 0}
              readOnly={messages.length === 0}
            />
            <button
              type="button"
              className="narrated-story-send"
              onClick={onSend}
              disabled={messages.length === 0 || !input.trim() || responding}
              aria-label={t('narratedStory.chat.send')}
            >
              {t('narratedStory.chat.send')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
