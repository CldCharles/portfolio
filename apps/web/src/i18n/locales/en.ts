import legal from './legal-en';
import linkedin from './linkedin-en';
import admin from './admin-en';
import scoping from './scoping-en';
import type fr from './fr';
export default {
  legal,
  admin,
  linkedin,
  scoping,
  pdf: {"language": "PDF language", "download": "Download CV"},
  app: { description: 'Claude Charles Valentin’s portfolio. Software Engineer & Solution Builder, focused on Vue.js, React and front-end development.' },
  nav: { label: 'Main navigation', language: 'Site language', skip: 'Skip to content', admin: 'Administration' },
  cv: { portraitSurprise: 'Profile photo, small surprise', languages: 'Languages', contact: 'Contact me', atAGlance: 'At a glance', location: 'Location', stack: 'Core technologies', spokenLanguages: 'Spoken languages', moreAbout: 'More about my background', technologies: 'Technologies', skills: 'Skills', projects: 'Projects', experience: 'Experience', education: 'Education', viewProject: 'View project', github: 'GitHub', fallback: 'This content is shown in French while its translation is being prepared.', loading: 'Loading portfolio…', error: 'The portfolio is temporarily unavailable.', retry: 'Try again', ended: 'Ended', present: 'Present' },
} satisfies typeof fr;
