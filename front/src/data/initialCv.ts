import type { CVData } from "../types";

export const initialCv: CVData = {
  name: "Charles",
  title: {
    fr: "Développeur full-stack orienté produit",
    en: "Product-focused full-stack developer",
    ko: "프로덕트 중심의 풀스택 개발자",
  },
  email: "charles@example.com",
  phone: "+82 10-0000-0000",
  location: "Séoul, Corée du Sud",
  website: "https://mon-portfolio.dev",
  summary: {
    fr: "Je conçois des expériences web élégantes, performantes et utiles, avec un fort intérêt pour l'UX, l'automatisation et les produits bien finis.",
    en: "I build elegant, fast, and useful web experiences with a strong interest in UX, automation, and polished product thinking.",
    ko: "UX, 자동화, 완성도 높은 제품 감각에 집중하면서 빠르고 유용한 웹 경험을 만듭니다.",
  },
  skills: {
    fr: ["React", "TypeScript", "Node.js", "Design systems", "API REST"],
    en: ["React", "TypeScript", "Node.js", "Design systems", "REST APIs"],
    ko: ["React", "TypeScript", "Node.js", "디자인 시스템", "REST API"],
  },
  experience: [
    {
      id: "exp-1",
      company: "Studio Produit",
      role: {
        fr: "Développeur front senior",
        en: "Senior frontend developer",
        ko: "시니어 프론트엔드 개발자",
      },
      period: "2023 - Aujourd'hui",
      achievements: {
        fr: "Refonte d'une interface B2B, amélioration de la performance perçue et mise en place d'un design system partagé.",
        en: "Led a B2B interface redesign, improved perceived performance, and introduced a shared design system.",
        ko: "B2B 인터페이스 리디자인을 이끌고 체감 성능을 개선했으며 공통 디자인 시스템을 도입했습니다.",
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
        ko: "소프트웨어 공학 석사",
      },
      period: "2018 - 2020",
    },
  ],
};
