import type { Locale } from '@portfolio/contracts';
import { newId, type OpenItemKind, type Priority, type Scoping } from './model';

// A filled-in example (online booking for a dental practice), so a visitor sees the result in one click.
interface ExampleText {
  title: string; situation: string; cost: string;
  personas: [string, string][]; goals: [string, string, string][];
  inScope: string[]; outOfScope: string[]; constraints: string;
  stories: [number, string, string, Priority][]; openItems: [OpenItemKind, string][];
}

const texts: Record<Locale, ExampleText> = {
  fr: {
    title: 'Prise de rendez-vous en ligne pour un cabinet dentaire',
    situation: 'Les rendez-vous se prennent uniquement par téléphone, aux heures d’ouverture. La secrétaire passe environ 2 heures par jour à fixer ou déplacer des rendez-vous.',
    cost: '12 % des rendez-vous sont manqués sans prévenir, et des patients renoncent faute de pouvoir joindre le cabinet.',
    personas: [
      ['Patient', 'Veut réserver le soir ou le week-end, depuis son téléphone.'],
      ['Secrétaire', 'Débordée par le téléphone ; veut garder la main sur l’agenda.'],
      ['Praticien', 'Consulte son planning entre deux patients.'],
    ],
    goals: [
      ['Désengorger le téléphone', 'Appels de prise de rendez-vous par jour', '−50 %'],
      ['Réduire les absences', 'Rendez-vous manqués sans prévenir', '12 % → 8 %'],
      ['Adoption par les patients', 'Part des rendez-vous pris en ligne', '≥ 40 %'],
    ],
    inScope: ['Réservation en ligne, sur ordinateur et mobile', 'Agenda partagé des 3 praticiens', 'Rappels SMS automatiques'],
    outOfScope: ['Paiement en ligne', 'Dossier médical du patient', 'Téléconsultation'],
    constraints: 'Mise en service avant janvier. Données de santé : hébergement conforme exigé.',
    stories: [
      [0, 'réserver en ligne parmi les créneaux libres', 'ne plus avoir à appeler', 'must'],
      [0, 'recevoir un rappel par SMS la veille', 'ne pas oublier mon rendez-vous', 'must'],
      [1, 'bloquer des créneaux (congés, urgences) en un clic', 'éviter les doubles réservations', 'must'],
      [2, 'consulter mon planning du jour sur mobile', 'préparer mes consultations', 'must'],
      [0, 'annuler ou déplacer mon rendez-vous jusqu’à 24 h avant', 'libérer le créneau pour un autre patient', 'should'],
      [1, 'voir les annulations de la semaine', 'proposer les créneaux libérés', 'should'],
      [0, 'être prévenu si un créneau plus tôt se libère', 'être soigné plus vite', 'could'],
      [2, 'ajouter une note avant la consultation', 'retrouver le contexte du patient', 'could'],
      [0, 'payer la consultation en ligne', 'gagner du temps à l’accueil', 'wont'],
    ],
    openItems: [
      ['question', 'Les nouveaux patients peuvent-ils réserver en ligne, ou seulement les patients déjà suivis ?'],
      ['risk', 'Coût des SMS non chiffré : à valider avant de garder le rappel en indispensable.'],
      ['assumption', 'Les patients acceptent de créer un compte. À tester avec 5 patients avant le développement.'],
    ],
  },
  en: {
    title: 'Online booking for a dental practice',
    situation: 'Appointments can only be booked by phone, during opening hours. The receptionist spends about 2 hours a day scheduling or moving appointments.',
    cost: '12% of appointments are missed without notice, and some patients give up because they cannot reach the practice.',
    personas: [
      ['Patient', 'Wants to book in the evening or at weekends, from their phone.'],
      ['Receptionist', 'Overwhelmed by calls; wants to stay in control of the schedule.'],
      ['Dentist', 'Checks the schedule between two patients.'],
    ],
    goals: [
      ['Free up the phone line', 'Booking calls per day', '−50%'],
      ['Reduce no-shows', 'Appointments missed without notice', '12% → 8%'],
      ['Patient adoption', 'Share of appointments booked online', '≥ 40%'],
    ],
    inScope: ['Online booking, on desktop and mobile', 'Shared schedule for the 3 dentists', 'Automatic SMS reminders'],
    outOfScope: ['Online payment', 'Patient medical records', 'Teleconsultation'],
    constraints: 'Live before January. Health data: compliant hosting required.',
    stories: [
      [0, 'book online from the available slots', 'I no longer have to call', 'must'],
      [0, 'get an SMS reminder the day before', 'I do not forget my appointment', 'must'],
      [1, 'block slots (holidays, emergencies) in one click', 'double bookings are avoided', 'must'],
      [2, 'see today’s schedule on my phone', 'I can prepare my appointments', 'must'],
      [0, 'cancel or move my appointment up to 24 hours before', 'the slot goes to another patient', 'should'],
      [1, 'see this week’s cancellations', 'I can offer the freed slots', 'should'],
      [0, 'be notified when an earlier slot opens up', 'I am treated sooner', 'could'],
      [2, 'add a note before the appointment', 'I keep the patient’s context', 'could'],
      [0, 'pay for the appointment online', 'I save time at the front desk', 'wont'],
    ],
    openItems: [
      ['question', 'Can new patients book online, or only existing ones?'],
      ['risk', 'SMS costs are not estimated yet: confirm them before keeping reminders as a must.'],
      ['assumption', 'Patients will accept creating an account. Test with 5 patients before development.'],
    ],
  },
  ko: {
    title: '치과 온라인 예약',
    situation: '예약은 진료 시간 중 전화로만 가능합니다. 접수 담당자가 하루 약 2시간을 예약 잡기와 변경에 쓰고 있습니다.',
    cost: '예약의 12%가 연락 없이 취소되고, 전화 연결이 안 되어 예약을 포기하는 환자도 있습니다.',
    personas: [
      ['환자', '저녁이나 주말에 휴대폰으로 예약하고 싶어 합니다.'],
      ['접수 담당자', '전화 응대에 지쳐 있지만 일정 관리 권한은 유지하고 싶어 합니다.'],
      ['치과의사', '진료 사이사이에 일정을 확인합니다.'],
    ],
    goals: [
      ['전화 업무 줄이기', '하루 예약 전화 수', '−50%'],
      ['노쇼 줄이기', '연락 없는 예약 불참률', '12% → 8%'],
      ['환자 이용률', '온라인 예약 비율', '40% 이상'],
    ],
    inScope: ['PC·모바일 온라인 예약', '치과의사 3명의 공유 일정', '자동 SMS 알림'],
    outOfScope: ['온라인 결제', '환자 진료 기록', '원격 진료'],
    constraints: '1월 전 오픈. 건강 정보: 규정에 맞는 호스팅 필수.',
    stories: [
      [0, '빈 시간대 중에서 온라인으로 예약하고', '더 이상 전화하지 않아도 되도록', 'must'],
      [0, '전날 SMS 알림을 받고', '예약을 잊지 않도록', 'must'],
      [1, '휴가·응급 시간대를 한 번에 막고', '중복 예약을 피하도록', 'must'],
      [2, '오늘 일정을 휴대폰으로 확인하고', '진료를 준비할 수 있도록', 'must'],
      [0, '24시간 전까지 예약을 취소하거나 변경하고', '다른 환자에게 시간대를 넘길 수 있도록', 'should'],
      [1, '이번 주 취소 목록을 보고', '빈 시간대를 다시 안내할 수 있도록', 'should'],
      [0, '더 이른 시간대가 나면 알림을 받고', '더 빨리 진료받을 수 있도록', 'could'],
      [2, '진료 전에 메모를 남기고', '환자 상황을 기억할 수 있도록', 'could'],
      [0, '진료비를 온라인으로 결제하고', '접수 시간을 줄일 수 있도록', 'wont'],
    ],
    openItems: [
      ['question', '신규 환자도 온라인 예약이 가능한가요, 아니면 기존 환자만 가능한가요?'],
      ['risk', 'SMS 비용이 아직 산정되지 않았습니다. 알림을 필수로 유지하기 전에 확인이 필요합니다.'],
      ['assumption', '환자들이 계정 생성을 받아들인다고 가정합니다. 개발 전에 환자 5명과 검증합니다.'],
    ],
  },
};

export function exampleScoping(locale: Locale): Scoping {
  const text = texts[locale];
  const personas = text.personas.map(([name, needs]) => ({ id: newId(), name, needs }));
  return {
    title: text.title,
    situation: text.situation,
    cost: text.cost,
    personas,
    goals: text.goals.map(([goal, indicator, target]) => ({ id: newId(), goal, indicator, target })),
    inScope: text.inScope.join('\n'),
    outOfScope: text.outOfScope.join('\n'),
    constraints: text.constraints,
    stories: text.stories.map(([persona, want, benefit, priority]) => ({ id: newId(), personaId: personas[persona]!.id, want, benefit, priority })),
    openItems: text.openItems.map(([kind, value]) => ({ id: newId(), kind, text: value })),
  };
}
