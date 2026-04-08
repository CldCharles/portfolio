import type { CVData } from "../types";

export const initialCv: CVData = {
  name: "Charles",
  title: {
    fr: "Développeur full-stack orienté produit",
    en: "Product-focused full-stack developer",
    es: "Desarrollador full-stack orientado al producto",
  },
  email: "charles@example.com",
  phone: "+82 10-0000-0000",
  location: "Séoul, Corée du Sud",
  website: "https://mon-portfolio.dev",
  summary: {
    fr: "Je conçois des expériences web élégantes, performantes et utiles, avec un fort intérêt pour l'UX, l'automatisation et les produits bien finis.",
    en: "I build elegant, fast, and useful web experiences with a strong interest in UX, automation, and polished product thinking.",
    es: "Diseño experiencias web elegantes, rápidas y útiles, con un gran interés por la UX, la automatización y los productos bien terminados.",
  },
  skills: {
    fr: ["React", "TypeScript", "Node.js", "Design systems", "API REST"],
    en: ["React", "TypeScript", "Node.js", "Design systems", "REST APIs"],
    es: ["React", "TypeScript", "Node.js", "Sistemas de diseño", "APIs REST"],
  },
  experience: [
    {
      id: "exp-1",
      company: "Studio Produit",
      role: {
        fr: "Développeur front senior",
        en: "Senior frontend developer",
        es: "Desarrollador frontend senior",
      },
      period: "2023 - Aujourd'hui",
      achievements: {
        fr: "Refonte d'une interface B2B, amélioration de la performance perçue et mise en place d'un design system partagé.",
        en: "Led a B2B interface redesign, improved perceived performance, and introduced a shared design system.",
        es: "Dirigí el rediseño de una interfaz B2B, mejoré el rendimiento percibido y lancé un sistema de diseño compartido.",
      },
    },
  ],
  education: [
    {
      id: "edu-1",
      school: "Université Tech",
      degree: {
        fr: "Master en ingénierie logicielle",
        en: "Master's degree in software engineering",
        es: "Máster en ingeniería de software",
      },
      period: "2018 - 2020",
    },
  ],
};
