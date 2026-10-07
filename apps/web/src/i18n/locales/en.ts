import admin from './admin-en';
import type fr from './fr';
export default {
  admin,
  pdf: {"language": "PDF language", "download": "Download CV as PDF"},
  app: { title: 'Claude Charles Valentin — Software Engineer', description: 'Claude Charles Valentin’s portfolio. Software Engineer & Solution Builder, focused on Vue.js, React and front-end development.' },
  nav: { label: 'Main navigation', home: 'Home', skills: 'Skills', projects: 'Projects', language: 'Site language', skip: 'Skip to content' },
  cv: { technologies: 'Technologies', eyebrow: 'Web development · Front-end', about: 'About', skills: 'My tools, your project.', skillsIntro: 'Interfaces designed for the people who use them.', projects: 'From need to reality.', projectsIntro: 'A look at what I’m building.', experience: 'Experience', education: 'Education', viewProject: 'View project', github: 'Find me on GitHub', source: 'Source code', fallback: 'This content is shown in French while its translation is being prepared.', loading: 'Loading portfolio…', error: 'The portfolio is temporarily unavailable.', retry: 'Try again', footer: 'Design. Build. Improve.', present: 'Present' },
} satisfies typeof fr;
