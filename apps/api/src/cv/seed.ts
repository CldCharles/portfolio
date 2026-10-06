import type { CvRepository } from './repository.js';

/** Public identity supplied by the owner. Never overwrite edits on restart. */
export function seedCv(repository: CvRepository) {
  if (repository.read('fr')) return;
  repository.saveProfile({ name: 'Claude Charles Valentin', githubUrl: 'https://github.com/CldCharles' }, {
    title: 'Software Engineer & Solution Builder', subtitle: 'Des idées aux interfaces.',
    description: 'Je conçois des solutions web avec une attention particulière au front-end. Vue et React sont mes outils pour transformer un besoin en une interface claire, utile et agréable à utiliser.',
  });
  repository.setTranslation('profile', 'en', {
    title: 'Software Engineer & Solution Builder', subtitle: 'From ideas to interfaces.',
    description: 'I build web solutions with a focus on front-end development. With Vue and React, I turn a need into an interface that is clear, useful and enjoyable to use.',
  }, 1);
  repository.setTranslation('profile', 'ko', {
    title: '소프트웨어 엔지니어 & 솔루션 빌더', subtitle: '아이디어를 인터페이스로.',
    description: '프런트엔드를 중심으로 웹 솔루션을 개발합니다. Vue와 React를 활용해 사용자의 요구를 명확하고 유용하며 사용하기 편한 인터페이스로 구현합니다.',
  }, 1);
  const entries = [
    { id: 'vue', kind: 'skill', tags: ['Vue.js'], url: null,
      fr: { title: 'Vue.js', subtitle: 'Front-end', description: 'Construire des interfaces réactives et organiser des composants réutilisables.' },
      en: { title: 'Vue.js', subtitle: 'Front-end', description: 'Building reactive interfaces and organising reusable components.' },
      ko: { title: 'Vue.js', subtitle: '프런트엔드', description: '반응형 인터페이스를 구현하고 재사용 가능한 컴포넌트를 구성합니다.' } },
    { id: 'react', kind: 'skill', tags: ['React'], url: null,
      fr: { title: 'React', subtitle: 'Front-end', description: 'Composer des interfaces et faire évoluer les fonctionnalités autour des besoins du produit.' },
      en: { title: 'React', subtitle: 'Front-end', description: 'Composing interfaces and developing features around product needs.' },
      ko: { title: 'React', subtitle: '프런트엔드', description: '제품의 요구에 맞춰 인터페이스를 구성하고 기능을 발전시킵니다.' } },
    { id: 'portfolio', kind: 'project', tags: ['Vue.js', 'TypeScript', 'Node.js', 'SQLite'], url: 'https://github.com/CldCharles/portfolio',
      fr: { title: 'Portfolio multilingue', subtitle: 'Projet personnel · En cours', description: 'Un CV en ligne disponible en français, anglais et coréen. Une base commune pour les informations du parcours et des textes indépendants pour chaque langue.' },
      en: { title: 'Multilingual portfolio', subtitle: 'Personal project · In progress', description: 'An online résumé in French, English and Korean. Shared career information with independently maintained text for each language.' },
      ko: { title: '다국어 포트폴리오', subtitle: '개인 프로젝트 · 진행 중', description: '프랑스어, 영어, 한국어로 제공되는 온라인 이력서입니다. 공통 경력 정보와 언어별 텍스트를 분리하여 관리합니다.' } },
  ] as const;
  entries.forEach((entry, position) => {
    repository.saveEntry({ id: entry.id, kind: entry.kind, tags: [...entry.tags], url: entry.url, position, startDate: null, endDate: null }, entry.fr);
    repository.setTranslation(entry.id, 'en', entry.en, 1);
    repository.setTranslation(entry.id, 'ko', entry.ko, 1);
  });
}
