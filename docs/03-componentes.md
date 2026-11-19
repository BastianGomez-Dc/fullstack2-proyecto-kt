# 03 — Crear componentes

## 3.1. Convención del proyecto

- Los componentes reutilizables viven en `src/components/` agrupados por nivel (Atomic Design): `atoms/`, `molecules/`, `organisms/` y `templates/`. Archivos capitalizados: `components/atoms/Button.tsx`.
- Estilos de una de estas dos formas (no ambas en el mismo elemento):
  - **CSS Module** al lado del componente: `Button.module.css`.
  - **Utilidades de Tailwind** en `className`, con los tokens de `index.css` como valores arbitrarios (`bg-[var(--color-primario)]`). Así están `Logo`, `Alerta`, `Card`, `Footer` y `RequireAuth`.
- Props tipadas con `interface` o tipo inline.
- `export default` del componente.

```
src/components/<nivel>/MiComponente.tsx
src/components/<nivel>/MiComponente.module.css   # solo si usa CSS Module
```

## 3.2. Ejemplo simple: `Input`

`src/components/atoms/Input.tsx`:

```tsx
import styles from "./Input.module.css";

const Input = (props: { label: string; onChange: any }) => {
  return (
    <div className={styles.container}>
      <label className={styles.label}>{props.label}</label>
      <input className={styles.input} onChange={props.onChange} />
    </div>
  );
};

export default Input;
```

Uso:

```tsx
<Input label="Email" onChange={handleChangeEmail} />
```

## 3.3. Ejemplo con variantes: `Button`

`src/components/atoms/Button.tsx`:

```tsx
import styles from "./Button.module.css";

interface ButtonProps {
  variant: "text" | "contained" | "outlined";
  children: string;
}

const Button = (props: ButtonProps) => {
  return (
    <button data-variant={props.variant} className={styles.button}>
      {props.children}
    </button>
  );
};

export default Button;
```

El CSS usa `data-variant` para las 3 variantes (`Button.module.css`). Uso:

```tsx
<Button variant="contained">Entrar</Button>
<Button variant="text">Olvide mi contraseña</Button>
```

## 3.4. Ejemplo con composición y Tailwind: `Card`

`src/components/molecules/Card.tsx` (resumido; ya no tiene CSS Module):

```tsx
import React from "react";

interface CardProps {
  title?: string;
  subtitle?: string;
  footer?: React.ReactNode;
  children: React.ReactNode;
}

const Card = ({ title, subtitle, footer, children }: CardProps) => {
  const conEncabezado = Boolean(title || subtitle);
  return (
    <div className="flex flex-col overflow-hidden w-[300px] mt-4 mx-auto bg-white border border-[#e5e7eb] rounded-[0.75rem] ...">
      {conEncabezado && (
        <div className="flex flex-col gap-1 pt-5 px-5 pb-3">
          {title && <h3 className="m-0 text-[1.125rem] font-semibold text-[#1f2937] ...">{title}</h3>}
          {subtitle && <p className="m-0 text-[0.875rem] text-[#6b7280] ...">{subtitle}</p>}
        </div>
      )}
      <div className={`flex-1 p-5 ${conEncabezado ? "pt-1" : ""} ...`}>{children}</div>
      {footer && <div className="flex flex-col gap-3 pt-3 px-5 pb-5 bg-[#f9fafb] border-t border-[#f3f4f6]">{footer}</div>}
    </div>
  );
};

export default Card;
```

Ejemplo de uso (hoy `Card` no se usa en las páginas: el login real usa `AuthLayout`, `Alerta` y `BotonEnvio`):

```tsx
<Card
  title="Login"
  subtitle="Bievenido otra vez"
  footer={
    <>
      <Button variant="contained">Entrar</Button>
      <Button variant="text">Olvide mi contraseña</Button>
    </>
  }
>
  <Input label="Email" onChange={handleChangeEmail} />
  <Input label="Contraseña" onChange={handleChangeContrasena} />
</Card>
```

Al pasar un componente de CSS Module a Tailwind se borra la regla del módulo (y el archivo si queda vacío): el CSS Module no está en ninguna capa y ganaría a las utilidades. Ver [ARQUITECTURA.md](./ARQUITECTURA.md#tailwind-de-forma-acotada).

## 3.5. Crear una página nueva

1. Crea `src/pages/saludo/Saludo.tsx`:

```tsx
import useDocumentTitle from "../../hooks/useDocumentTitle";

const Saludo = () => {
  useDocumentTitle("Saludo");
  return <main id="contenido"><h1>Hola</h1></main>;
};

export default Saludo;
```

2. Regístrala en `src/App.tsx` (ver `04-wouter.md`):

```tsx
const Saludo = lazy(() => import("./pages/saludo/Saludo"));

<Route path="/saludo" component={Saludo} />
```

3. Agrégala a la navegación (`src/components/organisms/Header.tsx`):

```tsx
<Link href="/saludo">Saludo</Link>
```

## 3.6. Checklist

- [ ] Componente capitalizado dentro del nivel que le corresponde (`atoms`, `molecules`, `organisms`, `templates`).
- [ ] Estilos con `Componente.module.css` (clases vía `styles.xxx`) **o** con utilidades de Tailwind y tokens; no ambos en el mismo elemento.
- [ ] Props tipadas (evita `any` salvo prototipo rápido).
- [ ] Páginas en `pages/`, UI reutilizable en `components/`, hooks en `hooks/`, contextos en `contexts/`, funciones puras en `utils/` y llamadas HTTP en `api/`.
