'use client'

import { signIn } from 'next-auth/react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'

// Страница входа должна быть динамической
export const dynamic = 'force-dynamic'

function LoginForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard'
  const error = searchParams.get('error')

  useEffect(() => {
    if (error) {
      const errorMessages: { [key: string]: string } = {
        'Configuration': 'Ошибка конфигурации Google OAuth. Проверьте GOOGLE_CLIENT_ID и GOOGLE_CLIENT_SECRET.',
        'AccessDenied': 'Доступ запрещен. Вы не авторизовали приложение.',
        'Verification': 'Ошибка верификации. Попробуйте снова.',
        'OAuthSignin': 'Ошибка при входе через OAuth.',
        'OAuthCallback': 'Ошибка обработки callback от OAuth провайдера.',
        'OAuthCreateAccount': 'Не удалось создать учетную запись.',
        'EmailCreateAccount': 'Не удалось создать учетную запись по email.',
        'Callback': 'Ошибка в callback URL.',
        'OAuthAccountNotLinked': 'Учетная запись не связана.',
        'EmailSignin': 'Ошибка отправки email для входа.',
        'CredentialsSignin': 'Неверные учетные данные.',
        'SessionRequired': 'Требуется сессия. Пожалуйста, войдите в систему.',
      }
      setErrorMessage(errorMessages[error] || `Ошибка: ${error}`)
    }
  }, [error])

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true)
      setErrorMessage(null)
      // Используем redirect: true для правильной работы OAuth
      await signIn('google', { 
        callbackUrl,
        redirect: true,
      })
    } catch (error: any) {
      setLoading(false)
      const message = error?.message || 'Неизвестная ошибка при входе'
      setErrorMessage(message)
      console.error('Error signing in:', error)
    }
  }

  return (
    <div className="container" style={{ maxWidth: '400px', margin: '4rem auto' }}>
      <div className="header" style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1>Вход в Cats</h1>
        <p>Войдите в систему для доступа к вашим данным</p>
      </div>

      {(error || errorMessage) && (
        <div
          style={{
            padding: '1rem',
            backgroundColor: '#fee',
            borderRadius: '8px',
            color: '#c33',
            marginBottom: '1.5rem',
          }}
        >
          <p style={{ margin: 0, marginBottom: '0.5rem' }}>
            <strong>Ошибка:</strong> {errorMessage || 'Не удалось войти в систему.'}
          </p>
          {error === 'Configuration' && (
            <div style={{ fontSize: '0.875rem', marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid #fcc' }}>
              <p style={{ margin: '0.5rem 0' }}><strong>Проверьте:</strong></p>
              <ul style={{ margin: '0.5rem 0', paddingLeft: '1.5rem' }}>
                <li>GOOGLE_CLIENT_ID и GOOGLE_CLIENT_SECRET установлены в .env</li>
                <li>В Google Console добавлен redirect URI: <code style={{ fontSize: '0.75rem' }}>http://localhost:3000/api/auth/callback/google</code></li>
                <li>Сервер перезапущен после изменения .env</li>
              </ul>
            </div>
          )}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          style={{
            padding: '1rem',
            fontSize: '1rem',
            backgroundColor: loading ? '#ccc' : '#4285f4',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            fontWeight: '500',
            transition: 'background-color 0.2s',
          }}
          onMouseOver={(e) => {
            if (!loading) e.currentTarget.style.backgroundColor = '#357ae8'
          }}
          onMouseOut={(e) => {
            if (!loading) e.currentTarget.style.backgroundColor = '#4285f4'
          }}
        >
          {loading ? (
            'Вход...'
          ) : (
            <>
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Войти через Google
            </>
          )}
        </button>

        <div
          style={{
            marginTop: '2rem',
            padding: '1rem',
            backgroundColor: '#f5f5f5',
            borderRadius: '8px',
            fontSize: '0.875rem',
            color: '#666',
          }}
        >
          <p style={{ margin: 0 }}>
            Используя Google для входа, вы соглашаетесь с нашей политикой
            конфиденциальности и условиями использования.
          </p>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="container" style={{ maxWidth: '400px', margin: '4rem auto', textAlign: 'center' }}>
        <p>Загрузка...</p>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
