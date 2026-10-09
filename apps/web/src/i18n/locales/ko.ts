import legal from './legal-ko';
import linkedin from './linkedin-ko';
import admin from './admin-ko';
import type fr from './fr';
export default {
  legal,
  admin,
  linkedin,
  pdf: {"language": "PDF 언어", "download": "이력서 다운로드"},
  app: { description: 'Claude Charles Valentin의 포트폴리오. Vue.js, React와 프런트엔드 개발에 집중하는 소프트웨어 엔지니어 & 솔루션 빌더.' },
  nav: { label: '주요 탐색', language: '사이트 언어', skip: '본문으로 건너뛰기' },
  cv: { moreAbout: '프로필 더 보기', technologies: '사용 기술', skills: '기술', projects: '프로젝트', experience: '경력', education: '학력', viewProject: '프로젝트 보기', github: 'GitHub', fallback: '번역이 준비될 때까지 이 콘텐츠는 프랑스어로 표시됩니다.', loading: '포트폴리오를 불러오는 중…', error: '현재 포트폴리오를 불러올 수 없습니다.', retry: '다시 시도', ended: '종료', present: '현재' },
} satisfies typeof fr;
