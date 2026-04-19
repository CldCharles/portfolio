import type { RoadmapData } from "../types";

export const initialRoadmap: RoadmapData = {
  features: [
    {
      id: "feature-cv-studio",
      title: {
        fr: "CV Studio multilingue",
        en: "Multilingual CV Studio",
        ko: "다국어 CV 스튜디오",
      },
      summary: {
        fr: "Edition locale du CV, variantes par langue, import/export JSON et export PDF.",
        en: "Local resume editing, multilingual variants, JSON import/export, and PDF export.",
        ko: "로컬 이력서 편집, 다국어 버전 관리, JSON 가져오기/내보내기, PDF 내보내기.",
      },
      status: "done",
      tasks: [
        {
          id: "task-cv-local-editing",
          title: {
            fr: "Edition locale du contenu",
            en: "Local content editing",
            ko: "로컬 콘텐츠 편집",
          },
          status: "done",
        },
        {
          id: "task-cv-multilingual",
          title: {
            fr: "Gestion des variantes FR / EN / KO",
            en: "FR / EN / KO variants",
            ko: "FR / EN / KO 언어 버전 관리",
          },
          status: "done",
        },
        {
          id: "task-cv-export",
          title: {
            fr: "Export JSON et PDF",
            en: "JSON and PDF export",
            ko: "JSON 및 PDF 내보내기",
          },
          status: "done",
        },
      ],
    },
    {
      id: "feature-homepage",
      title: {
        fr: "Homepage editoriale",
        en: "Editorial homepage",
        ko: "에디토리얼 홈페이지만들기",
      },
      summary: {
        fr: "Une page d'accueil plus narrative, plus visuelle, et plus fidele a une vraie presence portfolio.",
        en: "A more narrative and visual homepage, closer to a real portfolio presence.",
        ko: "더 서사적이고 시각적인, 실제 포트폴리오에 가까운 홈 화면.",
      },
      status: "in_progress",
      tasks: [
        {
          id: "task-home-identity",
          title: {
            fr: "Poser une identite visuelle forte",
            en: "Establish a strong visual identity",
            ko: "강한 비주얼 아이덴티티 정립",
          },
          status: "done",
        },
        {
          id: "task-home-balance",
          title: {
            fr: "Affiner le rythme et l'equilibre des sections",
            en: "Refine section rhythm and balance",
            ko: "섹션 리듬과 균형 다듬기",
          },
          status: "doing",
        },
        {
          id: "task-home-polish",
          title: {
            fr: "Faire une passe finale de direction artistique",
            en: "Add a final art direction pass",
            ko: "최종 아트 디렉션 다듬기",
          },
          status: "todo",
        },
      ],
    },
    {
      id: "feature-roadmap-planner",
      title: {
        fr: "Roadmap et planner legers",
        en: "Light roadmap and planner",
        ko: "가벼운 로드맵 및 플래너",
      },
      summary: {
        fr: "Une vue publique de l'avancement du site et un petit outil local pour piloter features, tasks et releases.",
        en: "A public view of the site's progress and a small local tool to manage features, tasks, and releases.",
        ko: "사이트 진행 상황을 보여 주는 공개 페이지와 기능, 작업, 릴리스를 관리하는 로컬 도구.",
      },
      status: "planned",
      tasks: [
        {
          id: "task-roadmap-public",
          title: {
            fr: "Construire la page publique roadmap + changelog",
            en: "Build the public roadmap + changelog page",
            ko: "공개 로드맵 + 변경 이력 페이지 만들기",
          },
          status: "todo",
        },
        {
          id: "task-roadmap-planner-ui",
          title: {
            fr: "Creer le planner en localStorage",
            en: "Create the localStorage planner",
            ko: "localStorage 기반 플래너 만들기",
          },
          status: "todo",
        },
      ],
    },
    {
      id: "feature-showcase",
      title: {
        fr: "Selection de travaux",
        en: "Selected work showcase",
        ko: "선별된 작업 소개",
      },
      summary: {
        fr: "Une presentation plus detaillee de projets, d'etudes de cas et de decisions techniques marquantes.",
        en: "A more detailed presentation of projects, case studies, and meaningful technical decisions.",
        ko: "프로젝트, 케이스 스터디, 그리고 중요한 기술 결정을 더 자세히 보여 주는 섹션.",
      },
      status: "planned",
      tasks: [
        {
          id: "task-showcase-structure",
          title: {
            fr: "Definir la structure des case studies",
            en: "Define the case study structure",
            ko: "케이스 스터디 구조 정의",
          },
          status: "todo",
        },
      ],
    },
    {
      id: "feature-backend-sync",
      title: {
        fr: "Backend de synchronisation",
        en: "Sync backend",
        ko: "동기화 백엔드",
      },
      summary: {
        fr: "Une base Node.js simple pour partager et persister les contenus du portfolio dans le futur.",
        en: "A simple Node.js base to share and persist portfolio content in the future.",
        ko: "향후 포트폴리오 콘텐츠를 공유하고 저장하기 위한 간단한 Node.js 기반.",
      },
      status: "paused",
      tasks: [
        {
          id: "task-backend-scope",
          title: {
            fr: "Preciser le besoin reel avant d'ajouter une API",
            en: "Clarify the real need before adding an API",
            ko: "API를 추가하기 전에 실제 필요 범위 정리",
          },
          status: "todo",
        },
      ],
    },
  ],
  releases: [
    {
      id: "release-2026-04-19",
      date: "2026-04-19",
      title: {
        fr: "Nouvelle base roadmap et planner",
        en: "Roadmap and planner foundation",
        ko: "로드맵 및 플래너 기반 추가",
      },
      notes: {
        fr: "Ajout d'une page publique roadmap/changelog et d'un planner local tres leger pour suivre les features et les releases.",
        en: "Added a public roadmap/changelog page and a very light local planner to track features and releases.",
        ko: "기능과 릴리스를 추적하기 위한 공개 로드맵/변경 이력 페이지와 가벼운 로컬 플래너를 추가했습니다.",
      },
    },
    {
      id: "release-2026-04-15",
      date: "2026-04-15",
      title: {
        fr: "Refonte de la homepage",
        en: "Homepage redesign",
        ko: "홈페이지 리디자인",
      },
      notes: {
        fr: "Mise en place d'une direction plus editoriale avec une narration basee sur le CV et une identite visuelle plus assumee.",
        en: "Introduced a more editorial direction with CV-based storytelling and a stronger visual identity.",
        ko: "CV 중심의 서사 구조와 더 분명한 시각적 정체성을 가진 에디토리얼 방향을 도입했습니다.",
      },
    },
    {
      id: "release-2026-04-08",
      date: "2026-04-08",
      title: {
        fr: "Premiere version du CV Studio",
        en: "First CV Studio release",
        ko: "CV 스튜디오 첫 릴리스",
      },
      notes: {
        fr: "Ajout de l'edition locale du CV, des variantes multilingues et des exports JSON / PDF.",
        en: "Added local resume editing, multilingual variants, and JSON / PDF export.",
        ko: "로컬 이력서 편집, 다국어 버전 관리, JSON / PDF 내보내기를 추가했습니다.",
      },
    },
  ],
};
