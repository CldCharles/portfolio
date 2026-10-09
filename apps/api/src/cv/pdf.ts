import PDFDocument from 'pdfkit';
import { fileURLToPath } from 'node:url';
import type { CvEntry, EntryKind, Locale, PublicCv } from '@portfolio/contracts';

const fontPath = fileURLToPath(new URL('../../assets/fonts/NotoSansCJKkr-Regular.otf', import.meta.url));
export const pdfLabels = {
  fr: { about: 'Présentation', skill: 'Compétences', experience: 'Expériences', project: 'Projets', education: 'Formation', language: 'Langues', ended: 'Fin', present: 'Aujourd’hui', fallback: 'Texte présenté en français : traduction à compléter ou à vérifier.', cv: 'CV' },
  en: { about: 'About', skill: 'Skills', experience: 'Experience', project: 'Projects', education: 'Education', language: 'Languages', ended: 'Ended', present: 'Present', fallback: 'Shown in French: translation missing or awaiting review.', cv: 'CV' },
  ko: { about: '소개', skill: '기술', experience: '경력', project: '프로젝트', education: '학력', language: '언어', ended: '종료', present: '현재', fallback: '번역이 없거나 검토가 필요하여 프랑스어로 표시됩니다.', cv: '이력서' },
} satisfies Record<Locale, Record<string, string>>;

export function pdfFilename(locale: Locale): string { return `cv-${locale}.pdf`; }
export function generateCvPdf(cv: PublicCv): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margins: { top: 42, bottom: 48, left: 44, right: 44 }, bufferPages: true,
      info: { Title: `${cv.profile.name} - ${pdfLabels[cv.locale].cv} (${cv.locale.toUpperCase()})`, Author: cv.profile.name }, lang: cv.locale });
    const chunks: Buffer[] = [];
    doc.on('data', chunk => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);
    try {
      doc.font(fontPath);
      const width = doc.page.width - 88;
      const labels = pdfLabels[cv.locale];
      const bottom = () => doc.page.height - doc.page.margins.bottom;
      function space(height: number) { if (doc.y + height > bottom()) doc.addPage(); }
      function text(value: string, size = 10, color = '#262a2b', link?: string) {
        if (!value) return;
        doc.fontSize(size).fillColor(color).text(value, 44, doc.y, { width, lineGap: 2, ...(link ? { link, underline: true } : {}) });
        doc.y += 5;
      }
      function height(value: string, size: number) { return value ? doc.fontSize(size).heightOfString(value, { width, lineGap: 2 }) + 5 : 0; }
      function heading(value: string, followingHeight = 40) {
        space(height(value, 13) + followingHeight + 16);
        doc.y += 10;
        const y = doc.y;
        doc.moveTo(44, y).lineTo(doc.page.width - 44, y).strokeColor('#deded7').lineWidth(.6).stroke();
        doc.y = y + 8;
        text(value, 13, '#466257');
      }
      function date(value: string) { if (value.length === 4) return value; return new Intl.DateTimeFormat(cv.locale, { year: 'numeric', month: 'short', timeZone: 'UTC' }).format(new Date(value)); }
      function entryHeaderHeight(entry: CvEntry) {
        return height(entry.text.title, 11) + height(entry.text.subtitle, 9) + (entry.text.fallback ? height(labels.fallback, 8) : 0) + 32;
      }
      text(cv.profile.name, 25);
      text(cv.profile.text.title, 13, '#466257');
      if (cv.profile.countryCode) text(new Intl.DisplayNames([cv.locale], { type: 'region' }).of(cv.profile.countryCode) ?? cv.profile.countryCode, 10, '#656a6a');
      if (cv.profile.githubUrl) text(cv.profile.githubUrl, 9, '#466257', cv.profile.githubUrl);
      heading(labels.about);
      if (cv.profile.text.fallback) text(labels.fallback, 8, '#656a6a');
      text(cv.profile.text.subtitle, 11);
      text(cv.profile.text.description);
      for (const kind of ['experience', 'project', 'skill', 'language', 'education'] as EntryKind[]) {
        const entries = cv.entries.filter(entry => entry.kind === kind);
        if (!entries.length) continue;
        heading(labels[kind], entryHeaderHeight(entries[0]!));
        for (const entry of entries) {
          space(entryHeaderHeight(entry));
          text(entry.text.title, 11);
          text(entry.text.subtitle, 9, '#656a6a');
          if (entry.startDate) text(`${date(entry.startDate)} - ${entry.endDate ? date(entry.endDate) : labels.present}`, 8, '#656a6a');
          else if (entry.endDate) text(`${labels.ended}: ${date(entry.endDate)}`, 8, '#656a6a');
          if (entry.text.fallback) text(labels.fallback, 8, '#656a6a');
          text(entry.text.description);
          if (entry.tags.length) text(entry.tags.join(' · '), 8, '#466257');
          if (entry.url) text(entry.url, 8, '#466257', entry.url);
          doc.y += 7;
        }
      }
      const range = doc.bufferedPageRange();
      for (let index = range.start; index < range.start + range.count; index++) {
        doc.switchToPage(index);
        // Temporarily allow text below the content margin: PDFKit otherwise
        // moves even a single footer line onto a new page.
        const margin = doc.page.margins.bottom;
        doc.page.margins.bottom = 0;
        doc.fontSize(8).fillColor('#656a6a').text(`${cv.locale.toUpperCase()} · ${index + 1} / ${range.count}`, 44, doc.page.height - 30, { width, align: 'right', lineBreak: false });
        doc.page.margins.bottom = margin;
      }
      doc.end();
    } catch (error) { doc.destroy(); reject(error); }
  });
}
