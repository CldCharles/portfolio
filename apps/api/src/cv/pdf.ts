import PDFDocument from 'pdfkit';
import { existsSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import type { CvEntry, Locale, PublicCv } from '@portfolio/contracts';

const fonts = {
  regular: fileURLToPath(new URL('../../assets/fonts/NotoSansCJKkr-Regular.otf', import.meta.url)),
  bold: fileURLToPath(new URL('../../assets/fonts/NotoSansCJKkr-Bold.otf', import.meta.url)),
};
/**
 * Same optional portrait as the public site (apps/web/src/assets); PDFKit reads JPEG and PNG.
 * Looked up per generation; `version` lets the caller's cache notice a new or removed photo.
 */
export function findPortrait(): { path: string; version: number } | null {
  const path = ['jpg', 'png']
    .map(extension => fileURLToPath(new URL(`../../../web/src/assets/portrait.${extension}`, import.meta.url)))
    .find(candidate => existsSync(candidate));
  return path ? { path, version: statSync(path).mtimeMs } : null;
}

type Labels = {
  document: string; summary: string; experience: string; project: string; skill: string; language: string; education: string;
  email: string; github: string; country: string; stack: string; languages: string;
  period: string; company: string; projectName: string; details: string; field: string; school: string; program: string; languageName: string; level: string; notes: string;
  technologies: string; present: string; ended: string; fallback: string; duration: (years: number, months: number) => string;
};
const plural = (value: number, one: string, many: string) => `${value} ${value > 1 ? many : one}`;
export const pdfLabels: Record<Locale, Labels> = {
  fr: {
    document: 'CV', summary: 'Profil', experience: 'Expérience professionnelle', project: 'Projets', skill: 'Compétences', language: 'Langues', education: 'Formation',
    email: 'E-mail', github: 'GitHub', country: 'Pays', stack: 'Technologies', languages: 'Langues',
    period: 'Période', company: 'Entreprise · Poste', projectName: 'Projet', details: 'Description', field: 'Domaine', school: 'Établissement', program: 'Cursus', languageName: 'Langue', level: 'Niveau', notes: 'Précisions',
    technologies: 'Technologies :', present: 'en cours', ended: 'Fin', fallback: 'Texte présenté en français : traduction à compléter ou à vérifier.',
    duration: (years, months) => [years ? plural(years, 'an', 'ans') : '', months ? `${months} mois` : ''].filter(Boolean).join(' '),
  },
  en: {
    document: 'Résumé', summary: 'Profile', experience: 'Work experience', project: 'Projects', skill: 'Skills', language: 'Languages', education: 'Education',
    email: 'Email', github: 'GitHub', country: 'Country', stack: 'Technologies', languages: 'Languages',
    period: 'Period', company: 'Company · Role', projectName: 'Project', details: 'Description', field: 'Area', school: 'School', program: 'Programme', languageName: 'Language', level: 'Level', notes: 'Notes',
    technologies: 'Technologies:', present: 'present', ended: 'Ended', fallback: 'Shown in French: translation missing or awaiting review.',
    duration: (years, months) => [years ? plural(years, 'yr', 'yrs') : '', months ? plural(months, 'mo', 'mos') : ''].filter(Boolean).join(' '),
  },
  ko: {
    document: '이력서', summary: '소개', experience: '경력 사항', project: '프로젝트', skill: '보유 기술', language: '어학 능력', education: '학력 사항',
    email: '이메일', github: 'GitHub', country: '거주 국가', stack: '주요 기술', languages: '사용 언어',
    period: '기간', company: '회사명 · 직무', projectName: '프로젝트명', details: '내용', field: '분야', school: '학교명', program: '전공 / 과정', languageName: '언어', level: '수준', notes: '비고',
    technologies: '사용 기술:', present: '재직 중', ended: '종료', fallback: '번역이 없거나 검토가 필요하여 프랑스어로 표시됩니다.',
    duration: (years, months) => [years ? `${years}년` : '', months ? `${months}개월` : ''].filter(Boolean).join(' '),
  },
};

const color = { ink: '#1c2a30', muted: '#5d6a70', accent: '#1f5566', rule: '#d5dadb', strong: '#1c2a30', header: '#eef2f3' };
type Run = { text: string; bold?: boolean; size?: number; color?: string; link?: string; bullet?: boolean; gap?: number };
type Column = { label: string; width: number };

export function pdfFilename(locale: Locale): string { return `cv-${locale}.pdf`; }

/** Korean-style dates: 2021.03, or the year alone when the month is unknown. */
export function pdfDate(value: string): string { return value.length === 4 ? value : value.slice(0, 7).replace('-', '.'); }
/** Inclusive month count, as Korean resumes state it; only when both months are known. */
export function pdfDuration(start: string | null, end: string | null): { years: number; months: number } | null {
  if (!start || !end || start.length < 7 || end.length < 7) return null;
  const total = (Number(end.slice(0, 4)) - Number(start.slice(0, 4))) * 12 + Number(end.slice(5, 7)) - Number(start.slice(5, 7)) + 1;
  return total > 0 ? { years: Math.floor(total / 12), months: total % 12 } : null;
}
function descriptionRuns(description: string, size = 9): Run[] {
  return description.split('\n').map(line => line.trim()).filter(Boolean)
    .map(line => line.startsWith('• ') || line.startsWith('- ') ? { text: line.slice(2), size, bullet: true, gap: 2 } : { text: line, size, gap: 3 });
}

/** `compress: false` keeps page streams readable for layout tests. */
export function generateCvPdf(cv: PublicCv, options: { contactEmail?: string | null; compress?: boolean } = {}): Promise<Buffer> {
  const labels = pdfLabels[cv.locale];
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ compress: options.compress ?? true, size: 'A4', margins: { top: 40, bottom: 48, left: 42, right: 42 }, bufferPages: true,
      info: { Title: `${cv.profile.name} - ${labels.document} (${cv.locale.toUpperCase()})`, Author: cv.profile.name }, lang: cv.locale });
    const chunks: Buffer[] = [];
    doc.on('data', chunk => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);
    try {
      doc.registerFont('regular', fonts.regular);
      doc.registerFont('bold', existsSync(fonts.bold) ? fonts.bold : fonts.regular);
      const left = doc.page.margins.left;
      const width = doc.page.width - left - doc.page.margins.right;
      const bottom = () => doc.page.height - doc.page.margins.bottom;
      const lineGap = 1.5;
      const bulletIndent = 9;

      const runHeight = (run: Run, w: number) => doc.font(run.bold ? 'bold' : 'regular').fontSize(run.size ?? 9)
        .heightOfString(run.text, { width: run.bullet ? w - bulletIndent : w, lineGap }) + (run.gap ?? 2);
      const cellHeight = (runs: Run[], w: number) => runs.reduce((sum, run) => sum + runHeight(run, w), 0);
      function drawRuns(runs: Run[], x: number, w: number) {
        for (const run of runs) {
          if (!run.text) continue;
          doc.font(run.bold ? 'bold' : 'regular').fontSize(run.size ?? 9).fillColor(run.color ?? color.ink);
          // Start the run on the next page when its first line does not fit: PDFKit would
          // otherwise break inside the run and strand a bullet or a lone line.
          if (doc.y + doc.currentLineHeight(true) + lineGap > bottom()) doc.addPage();
          if (run.bullet) {
            const y = doc.y;
            doc.text('•', x, y, { width: bulletIndent, lineGap });
            doc.text(run.text, x + bulletIndent, y, { width: w - bulletIndent, lineGap });
          } else {
            doc.text(run.text, x, doc.y, { width: w, lineGap, ...(run.link ? { link: run.link } : {}) });
          }
          doc.y += run.gap ?? 2;
        }
      }
      function rule(y: number, weight = .5, stroke = color.rule) {
        doc.moveTo(left, y).lineTo(left + width, y).lineWidth(weight).strokeColor(stroke).stroke();
      }
      /** `following`: height that must stay with the title (start of the first row). */
      function heading(title: string, following: number) {
        if (doc.y + 31 + following > bottom()) doc.addPage();
        doc.y += 11;
        const y = doc.y;
        doc.rect(left, y + 2, 3, 12).fill(color.accent);
        doc.font('bold').fontSize(12).fillColor(color.ink).text(title, left + 10, y, { width: width - 10, lineGap });
        doc.y = y + 20;
      }
      /**
       * Section title and table. Rows are separated by rules; only the last column may
       * flow across pages. A row starts on a new page unless its fixed columns and the
       * beginning of its last column fit, so cells never drift apart.
       */
      function table(title: string, columns: Column[], rows: Run[][][]) {
        const widths = columns.map((column, index) => index === columns.length - 1 ? width - columns.slice(0, -1).reduce((sum, value) => sum + value.width, 0) : column.width);
        const xs = widths.map((_, index) => left + widths.slice(0, index).reduce((sum, value) => sum + value, 0));
        const padding = 5;
        const headerHeight = 18;
        const header = () => {
          const y = doc.y;
          doc.rect(left, y, width, headerHeight).fill(color.header);
          rule(y, 1, color.strong);
          columns.forEach((column, index) => doc.font('bold').fontSize(8).fillColor(color.muted).text(column.label, xs[index]! + padding, y + 4.5, { width: widths[index]! - padding * 2, lineBreak: false }));
          rule(y + headerHeight);
          doc.y = y + headerHeight;
        };
        const cellHeights = (row: Run[][]) => row.map((cell, index) => cellHeight(cell, widths[index]! - padding * 2));
        const keep = (row: Run[][]) => {
          const heights = cellHeights(row);
          return Math.max(...heights.slice(0, -1), Math.min(heights.at(-1)!, 48)) + padding * 2;
        };
        heading(title, headerHeight + keep(rows[0]!));
        header();
        for (const row of rows) {
          if (doc.y + keep(row) > bottom()) { doc.addPage(); header(); }
          const top = doc.y + padding;
          const page = doc.page;
          let end = top;
          // Fixed columns first: they fit on this page, then the last column may flow.
          row.forEach((cell, index) => {
            if (index === row.length - 1) return;
            doc.y = top;
            drawRuns(cell, xs[index]! + padding, widths[index]! - padding * 2);
            end = Math.max(end, doc.y);
          });
          doc.y = top;
          drawRuns(row.at(-1)!, xs.at(-1)! + padding, widths.at(-1)! - padding * 2);
          end = doc.page === page ? Math.max(end, doc.y) : doc.y;
          doc.y = end + padding - 2;
          rule(doc.y);
        }
      }
      const fallback = (entry: { text: { fallback: boolean } }): Run[] => entry.text.fallback ? [{ text: labels.fallback, size: 7.5, color: color.muted }] : [];
      const tags = (entry: CvEntry): Run[] => entry.tags.length ? [{ text: `${labels.technologies} ${entry.tags.join(' · ')}`, size: 8, color: color.accent, gap: 2 }] : [];
      const period = (entry: CvEntry): Run[] => {
        if (!entry.startDate && !entry.endDate) return [];
        const range = entry.startDate ? `${pdfDate(entry.startDate)} – ${entry.endDate ? pdfDate(entry.endDate) : labels.present}` : `${labels.ended} ${pdfDate(entry.endDate!)}`;
        const duration = pdfDuration(entry.startDate, entry.endDate);
        return [{ text: range, size: 8.5 }, ...(duration ? [{ text: `(${labels.duration(duration.years, duration.months)})`, size: 8, color: color.muted }] : [])];
      };
      const byKind = (kind: CvEntry['kind']) => cv.entries.filter(entry => entry.kind === kind);

      // 인적사항: identity, contact details and photo.
      const photo = { width: 84, height: 112 };
      const portraitPath = findPortrait()?.path;
      const infoWidth = portraitPath ? width - photo.width - 18 : width;
      const top = doc.y;
      doc.font('bold').fontSize(8).fillColor(color.accent).text(labels.document.toUpperCase(), left, top, { width: infoWidth, characterSpacing: 1.2 });
      doc.y += 2;
      doc.font('bold').fontSize(22).fillColor(color.ink).text(cv.profile.name, left, doc.y, { width: infoWidth });
      doc.font('regular').fontSize(11).fillColor(color.accent).text(cv.profile.text.title, left, doc.y + 1, { width: infoWidth });
      doc.y += 8;
      const languages = byKind('language').map(entry => entry.text.subtitle ? `${entry.text.title} (${entry.text.subtitle})` : entry.text.title);
      const country = cv.profile.countryCode ? new Intl.DisplayNames([cv.locale], { type: 'region' }).of(cv.profile.countryCode) ?? cv.profile.countryCode : null;
      const facts: [string, string, string?][] = [
        ...(options.contactEmail ? [[labels.email, options.contactEmail, `mailto:${options.contactEmail}`] as [string, string, string]] : []),
        ...(cv.profile.githubUrl ? [[labels.github, cv.profile.githubUrl.replace(/^https?:\/\//, ''), cv.profile.githubUrl] as [string, string, string]] : []),
        ...(country ? [[labels.country, country] as [string, string]] : []),
        ...(languages.length ? [[labels.languages, languages.join(' · ')] as [string, string]] : []),
        ...(cv.profile.text.subtitle ? [[labels.stack, cv.profile.text.subtitle] as [string, string]] : []),
      ];
      for (const [label, value, link] of facts) {
        const y = doc.y;
        doc.font('bold').fontSize(8.5).fillColor(color.muted).text(label, left, y, { width: 64 });
        doc.font('regular').fontSize(8.5).fillColor(link ? color.accent : color.ink).text(value, left + 66, y, { width: infoWidth - 66, lineGap: 1, ...(link ? { link } : {}) });
        doc.y += 3;
      }
      let headerEnd = doc.y;
      if (portraitPath) {
        const x = left + width - photo.width;
        doc.save().rect(x, top, photo.width, photo.height).clip();
        doc.image(portraitPath, x, top, { cover: [photo.width, photo.height], align: 'center', valign: 'center' });
        doc.restore().rect(x, top, photo.width, photo.height).lineWidth(.5).strokeColor(color.rule).stroke();
        headerEnd = Math.max(headerEnd, top + photo.height);
      }
      doc.y = headerEnd + 10;
      rule(doc.y, 1.2, color.strong);
      doc.y += 4;

      if (cv.profile.text.description) {
        const runs = [...fallback(cv.profile), ...descriptionRuns(cv.profile.text.description, 9.5)];
        heading(labels.summary, Math.min(cellHeight(runs, width), 40));
        drawRuns(runs, left, width);
      }
      const education = byKind('education');
      if (education.length) {
        table(labels.education, [{ label: labels.period, width: 108 }, { label: labels.school, width: 170 }, { label: labels.program, width: 0 }],
          education.map(entry => [period(entry), [{ text: entry.text.subtitle || entry.text.title, bold: true, size: 9 }],
            [...fallback(entry), ...(entry.text.subtitle ? [{ text: entry.text.title, size: 9 }] : []), ...descriptionRuns(entry.text.description, 8.5).map(run => ({ ...run, color: color.muted }))]]));
      }
      const experience = byKind('experience');
      if (experience.length) {
        table(labels.experience, [{ label: labels.period, width: 108 }, { label: labels.company, width: 0 }],
          experience.map(entry => [period(entry), [
            ...fallback(entry),
            { text: entry.text.subtitle || entry.text.title, bold: true, size: 10, gap: 1 },
            ...(entry.text.subtitle ? [{ text: entry.text.title, size: 9, color: color.accent, gap: 4 }] : []),
            ...descriptionRuns(entry.text.description), ...tags(entry),
          ]]));
      }
      const projects = byKind('project');
      if (projects.length) {
        table(labels.project, [{ label: labels.projectName, width: 150 }, { label: labels.details, width: 0 }],
          projects.map(entry => [
            [{ text: entry.text.title, bold: true, size: 9.5 }, ...(entry.text.subtitle ? [{ text: entry.text.subtitle, size: 8, color: color.muted }] : [])],
            [...fallback(entry), ...descriptionRuns(entry.text.description), ...tags(entry), ...(entry.url ? [{ text: entry.url, size: 8, color: color.accent, link: entry.url }] : [])],
          ]));
      }
      const skills = byKind('skill');
      if (skills.length) {
        table(labels.skill, [{ label: labels.field, width: 150 }, { label: labels.details, width: 0 }],
          skills.map(entry => [
            [{ text: entry.text.title, bold: true, size: 9.5 }, ...(entry.text.subtitle ? [{ text: entry.text.subtitle, size: 8, color: color.muted }] : [])],
            [...fallback(entry), ...descriptionRuns(entry.text.description),
              // A technology line that only repeats the skill name adds nothing.
              ...(entry.tags.length === 1 && entry.tags[0] === entry.text.title ? [] : tags(entry)),
              ...(entry.url ? [{ text: entry.url, size: 8, color: color.accent, link: entry.url }] : [])],
          ]));
      }
      const spoken = byKind('language');
      if (spoken.length) {
        table(labels.language, [{ label: labels.languageName, width: 108 }, { label: labels.level, width: 170 }, { label: labels.notes, width: 0 }],
          spoken.map(entry => [[{ text: entry.text.title, bold: true, size: 9 }], [{ text: entry.text.subtitle, size: 9 }],
            [...fallback(entry), ...descriptionRuns(entry.text.description, 8.5).map(run => ({ ...run, color: color.muted }))]]));
      }

      const range = doc.bufferedPageRange();
      for (let index = range.start; index < range.start + range.count; index++) {
        doc.switchToPage(index);
        // Temporarily allow text below the content margin: PDFKit otherwise
        // moves even a single footer line onto a new page.
        const margin = doc.page.margins.bottom;
        doc.page.margins.bottom = 0;
        const y = doc.page.height - 30;
        doc.font('regular').fontSize(7.5).fillColor(color.muted);
        doc.text(`${cv.profile.name} · ${labels.document}`, left, y, { width: width / 2, lineBreak: false });
        doc.text(`${index + 1} / ${range.count}`, left + width / 2, y, { width: width / 2, align: 'right', lineBreak: false });
        doc.page.margins.bottom = margin;
      }
      doc.end();
    } catch (error) { doc.destroy(); reject(error); }
  });
}
