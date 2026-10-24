import { Amplify } from "aws-amplify";
import { fetchAuthSession, signIn, signOut } from "aws-amplify/auth";

// El app client no tiene secreto y usa USER_SRP_AUTH: la contraseña nunca viaja en texto plano
Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: "us-east-1_AwWWrn8Ib",
      userPoolClientId: "47v1h6d5fb83r3cle10gsv4hjq",
    },
  },
});

export interface Usuario {
  id: string;
  username: string;
  nombre?: string;
  rol?: string;
}

export interface Sesion {
  token: string;
  usuario: Usuario;
}

const MENSAJE_GENERICO = "No pudimos iniciar sesión. Revisa tu conexión e intenta de nuevo.";

const MENSAJES_ERROR: Record<string, string> = {
  NotAuthorizedException: "El usuario o la contraseña no son correctos.",
  UserNotFoundException: "El usuario o la contraseña no son correctos.",
  UserNotConfirmedException: "Tu cuenta aún no está confirmada. Revisa el código que llegó a tu correo.",
  PasswordResetRequiredException: "Debes restablecer tu contraseña antes de iniciar sesión.",
  TooManyRequestsException: "Hiciste demasiados intentos. Espera unos minutos e intenta de nuevo.",
  LimitExceededException: "Hiciste demasiados intentos. Espera unos minutos e intenta de nuevo.",
};

// Pasos que Cognito puede pedir después de la contraseña y que SyncPass aún no maneja
const MENSAJES_PASO: Record<string, string> = {
  CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED:
    "Tu cuenta tiene una contraseña temporal. Pide a un administrador que la restablezca.",
  CONFIRM_SIGN_UP: MENSAJES_ERROR.UserNotConfirmedException,
  RESET_PASSWORD: MENSAJES_ERROR.PasswordResetRequiredException,
};

export class CognitoError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CognitoError";
  }
}

export function mensajeDeError(error: unknown): string {
  const nombre = error instanceof Error ? error.name : "";
  return MENSAJES_ERROR[nombre] ?? MENSAJE_GENERICO;
}

export function mensajeDePaso(paso: string): string {
  return MENSAJES_PASO[paso] ?? "Tu cuenta requiere un paso adicional que SyncPass aún no soporta.";
}

export function usuarioDesdeClaims(claims: Record<string, unknown>): Usuario {
  const texto = (valor: unknown) => (typeof valor === "string" && valor !== "" ? valor : undefined);
  const grupos = claims["cognito:groups"];
  return {
    id: String(claims.sub),
    // Si el pool usa el correo como usuario, cognito:username es un UUID, así que se prefiere el correo
    username:
      texto(claims.preferred_username) ??
      texto(claims.email) ??
      texto(claims["cognito:username"]) ??
      String(claims.sub),
    nombre: texto(claims.name),
    rol: Array.isArray(grupos) && grupos.length > 0 ? String(grupos[0]) : undefined,
  };
}

export async function obtenerSesion(): Promise<Sesion | null> {
  const { tokens } = await fetchAuthSession();
  const idToken = tokens?.idToken;
  if (!idToken) {
    return null;
  }
  return { token: idToken.toString(), usuario: usuarioDesdeClaims(idToken.payload) };
}

export async function iniciarSesionCognito(username: string, password: string): Promise<Sesion> {
  try {
    const { isSignedIn, nextStep } = await signIn({ username, password });
    if (!isSignedIn) {
      throw new CognitoError(mensajeDePaso(nextStep.signInStep));
    }
  } catch (error) {
    if (error instanceof CognitoError) {
      throw error;
    }
    // Quedó una sesión abierta de antes: se reutiliza en vez de fallar
    if (!(error instanceof Error && error.name === "UserAlreadyAuthenticatedException")) {
      throw new CognitoError(mensajeDeError(error));
    }
  }

  const sesion = await obtenerSesion();
  if (!sesion) {
    throw new CognitoError(MENSAJE_GENERICO);
  }
  return sesion;
}

export function cerrarSesionCognito(): Promise<void> {
  return signOut();
}
