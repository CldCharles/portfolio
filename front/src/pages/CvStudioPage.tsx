import { CvStudio } from "../features/cv/CvStudio";

export function CvStudioPage() {
  return (
    <main className="page-shell">
      <section className="page-header">
        <p className="eyebrow">CV Studio</p>
        <h1>Un espace dedie pour editer, traduire et exporter ton CV.</h1>
        <p className="page-header-text">
          La feature est maintenant isolee dans sa propre page, ce qui rend le portfolio plus
          propre et le code plus facile a faire evoluer.
        </p>
      </section>

      <CvStudio />
    </main>
  );
}
