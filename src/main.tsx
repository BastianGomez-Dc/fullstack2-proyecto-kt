import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from 'react-oidc-context'
import { onSigninCallback } from './auth/cognito'

const cognitoAuthConfig = {
  authority: 'https://cognito-idp.us-east-1.amazonaws.com/us-east-1_AwWWrn8Ib',
  client_id: '47v1h6d5fb83r3cle10gsv4hjq',
  redirect_uri: window.location.origin,
  response_type: 'code',
  scope: 'email openid phone',
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider {...cognitoAuthConfig} onSigninCallback={onSigninCallback}>
      <App />
    </AuthProvider>
  </StrictMode>,
)
