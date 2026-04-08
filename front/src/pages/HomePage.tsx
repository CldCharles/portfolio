import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export function HomePage() {
  return (
    <main>
      <section className="hero">
        <motion.div
          className="hero-copy"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65 }}
        >
          <p className="eyebrow">Portfolio personnel</p>
          <h1>Je conçois des experiences web nettes, utiles et soignees.</h1>
          <p className="hero-text">
            Une landing page sobre pour presenter mon profil, mes projets et un outil CV
            multilingue integre au site sans le transformer en simple app utilitaire.
          </p>
          <div className="hero-actions">
            <Link className="button-primary" to="/cv-studio">
              Voir le CV Studio
              <ArrowRight size={16} />
            </Link>
            <a className="button-secondary" href="#projects">
              Voir les projets
            </a>
          </div>
        </motion.div>

        <motion.aside
          className="hero-panel"
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.72, delay: 0.08 }}
        >
          <div className="hero-panel-line">
            <span>Role</span>
            <strong>Frontend / Full-stack</strong>
          </div>
          <div className="hero-panel-line">
            <span>Approche</span>
            <strong>Minimalisme, clarte, execution</strong>
          </div>
          <div className="hero-panel-line">
            <span>Base</span>
            <strong>React, TypeScript, Node.js</strong>
          </div>
        </motion.aside>
      </section>

      <section className="content-section" id="about">
        <div className="section-label">A propos</div>
        <div className="two-column">
          <h2>Une approche produit, design et developpement dans un meme flux.</h2>
          <p>
            J&apos;aime construire des interfaces claires, reduire la friction et pousser les
            details jusqu&apos;a obtenir une sensation de simplicite evidente. Ce portfolio est
            pense comme une vitrine elegante, avec des outils utiles accessibles au bon moment.
          </p>
        </div>
      </section>

      <section className="content-section" id="projects">
        <div className="section-label">Projets choisis</div>
        <div className="project-grid">
          <article className="project-card">
            <h3>Portfolio evolutif</h3>
            <p>
              Une base statique soignee qui peut accueillir ensuite du contenu dynamique, un CMS
              ou un back Node.js seulement si cela devient utile.
            </p>
          </article>
          <article className="project-card">
            <h3>CV Studio multilingue</h3>
            <p>
              Edition locale, variantes par langue, import/export JSON et export PDF, le tout sans
              serveur pour garder un hebergement gratuit.
            </p>
          </article>
          <article className="project-card">
            <h3>Architecture sobre</h3>
            <p>
              Peu de dependances, peu de couches, et des choix techniques guides par la lisibilite
              plutot que par la mode.
            </p>
          </article>
        </div>
      </section>

      <section className="content-section contact-section" id="contact">
        <div className="section-label">Contact</div>
        <div className="two-column">
          <h2>Disponible pour des missions produit, frontend ou full-stack.</h2>
          <a className="contact-link" href="mailto:charles@example.com">
            charles@example.com
          </a>
        </div>
      </section>
    </main>
  );
}
