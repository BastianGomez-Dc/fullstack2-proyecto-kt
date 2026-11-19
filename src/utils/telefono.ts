// Utilidades puras del teléfono (sin HTTP ni React). El User Pool de Cognito exige
// phone_number en formato E.164 (+56912345678), así que el registro normaliza antes de enviar.

// Acepta lo que la gente suele escribir ("9 1234 5678", "+56 9 1234-5678", "56912345678")
// y lo deja en E.164. Si no lo reconoce, lo devuelve sin separadores para que la validación lo marque.
export function normalizarTelefono(valor: string): string {
  const limpio = valor.replace(/[\s().-]/g, "");
  if (limpio.startsWith("+")) return limpio;
  if (/^9\d{8}$/.test(limpio)) return `+56${limpio}`;
  if (/^569\d{8}$/.test(limpio)) return `+${limpio}`;
  return limpio;
}

export const esTelefonoValido = (telefono: string) => /^\+[1-9]\d{7,14}$/.test(telefono);
