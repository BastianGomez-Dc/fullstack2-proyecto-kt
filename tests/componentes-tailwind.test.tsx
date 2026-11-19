import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Logo from "../src/components/atoms/Logo";
import Alerta from "../src/components/molecules/Alerta";
import Card from "../src/components/molecules/Card";
import Footer from "../src/components/organisms/Footer";

// Componentes estilizados con utilidades de Tailwind (sin CSS Module): se prueba el
// comportamiento y que las variantes elijan las utilidades correctas.
describe("Componentes con Tailwind", () => {
  it("Alerta de error se anuncia de inmediato y usa los tokens de error", () => {
    render(<Alerta>No pudimos conectar</Alerta>);

    const alerta = screen.getByRole("alert");
    expect(alerta).toHaveTextContent("No pudimos conectar");
    expect(alerta).toHaveClass("animate-aparecer", "text-[var(--color-error)]");
  });

  it("Alerta de éxito usa role=status y los tokens de éxito", () => {
    render(<Alerta tipo="exito">Te enviamos otro código</Alerta>);

    const aviso = screen.getByRole("status");
    expect(aviso).toHaveTextContent("Te enviamos otro código");
    expect(aviso).toHaveClass("text-[var(--color-exito)]");
    expect(aviso).not.toHaveClass("text-[var(--color-error)]");
  });

  it("Card muestra encabezado, cuerpo y pie", () => {
    render(
      <Card title="Alfabetización digital" subtitle="UV 01" footer={<button type="button">Inscribirme</button>}>
        <p>Curso de 8 semanas</p>
      </Card>,
    );

    expect(screen.getByRole("heading", { name: "Alfabetización digital" })).toBeInTheDocument();
    expect(screen.getByText("UV 01")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Inscribirme" })).toBeInTheDocument();
    // Con encabezado, el cuerpo se acerca a él (pt-1)
    expect(screen.getByText("Curso de 8 semanas").parentElement).toHaveClass("pt-1");
  });

  it("Card sin encabezado ni pie solo renderiza el cuerpo", () => {
    render(<Card><p>Solo cuerpo</p></Card>);

    expect(screen.queryByRole("heading")).not.toBeInTheDocument();
    expect(screen.getByText("Solo cuerpo").parentElement).not.toHaveClass("pt-1");
  });

  it("Logo cambia a texto blanco en su versión clara", () => {
    const { rerender } = render(<Logo />);
    expect(screen.getByText("SyncPass").parentElement).toHaveClass("text-[var(--color-primario-fuerte)]");

    rerender(<Logo claro />);
    expect(screen.getByText("SyncPass").parentElement).toHaveClass("text-white");
  });

  it("Footer enlaza las secciones de la portada y las páginas de cuenta", () => {
    render(<Footer />);

    const plataforma = screen.getByRole("navigation", { name: "Plataforma" });
    expect(within(plataforma).getByRole("link", { name: "Cursos" })).toHaveAttribute("href", "/#cursos");
    expect(within(plataforma).getByRole("link", { name: "Preguntas frecuentes" })).toHaveAttribute("href", "/#preguntas");

    const cuenta = screen.getByRole("navigation", { name: "Tu cuenta" });
    expect(within(cuenta).getByRole("link", { name: "Crear cuenta" })).toHaveAttribute("href", "/register");
    expect(within(cuenta).getByRole("link", { name: "Confirmar cuenta" })).toHaveAttribute("href", "/register?confirmar=1");
    expect(screen.getByText(/© \d{4} SyncPass/)).toBeInTheDocument();
  });
});
