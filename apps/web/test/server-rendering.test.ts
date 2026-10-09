import test from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';
import type { PublicBootstrap, Locale } from '@portfolio/contracts';

test('SSR serves public text, links and privacy in all languages, isolates concurrent requests and never renders admin data', async () => {
  const server = await createServer({ root: fileURLToPath(new URL('../', import.meta.url)), server: { middlewareMode: true, hmr: false }, appType: 'custom', logLevel: 'error' });
  try {
    const { renderPage } = await server.ssrLoadModule('/src/entry-server.ts');
    const template = '<html lang="fr"><head><title>Portfolio</title></head><body><div id="app"></div></body></html>';
    const fixture = (locale: Locale): PublicBootstrap => ({ locale, site: { editorName: `Name ${locale}`, contactEmail: null, hostName: null, hostCountry: null, hostLogRetention: null, publicOrigin: 'https://example.com' }, cv: { locale, profile: { name: `Name ${locale}`, githubUrl: null, countryCode: null, text: { locale, fallback: false, title: `Role ${locale}`, subtitle: '', description: `Published ${locale}` } }, entries: [] } });
    const results = await Promise.all((['fr', 'en', 'ko'] as const).map(async locale => ({ locale, page: await renderPage(template, '/', fixture(locale)) })));
    for (const { locale, page } of results) {
      assert.match(page.html, new RegExp(`<html lang="${locale}"`));
      assert.match(page.html, new RegExp(`Published ${locale}`));
      assert.match(page.html, /application\/ld\+json/);
      assert.match(page.html, /href="\/\?lang=ko"/);
      for (const other of ['fr', 'en', 'ko'].filter(value => value !== locale)) assert.doesNotMatch(page.html, new RegExp(`Name ${other}`));
      const privacy = await renderPage(template, '/privacy', { ...fixture(locale), cv: null, site: { ...fixture(locale).site, hostCountry: 'SE' } });
      // An ISO hosting country is shown in the page language.
      assert.match(privacy.html, { fr: /Suède/, en: /Sweden/, ko: /스웨덴/ }[locale]);
      assert.match(privacy.html, /portfolio_session/);
      assert.match(privacy.html, /scrypt/);
      assert.match(privacy.html, /portfolio\.scoping/);
      // The scoping workshop intro is rendered on the server, in the page language.
      const scoping = await renderPage(template, '/cadrage', { ...fixture(locale), cv: null });
      assert.match(scoping.html, { fr: /Du besoin flou à la note de cadrage/, en: /From a vague need to a scoping note/, ko: /막연한 요구에서 프로젝트 정의서까지/ }[locale]);
      assert.match(scoping.html, { fr: /<title>Atelier de cadrage/, en: /<title>Scoping workshop/, ko: /<title>요구사항 정의 워크숍/ }[locale]);
      assert.match(scoping.html, /href="\/cadrage\?lang=ko"/);
    }
    const populated = fixture('fr');
    populated.cv!.entries = [
      { id: 'sopra-2021-2024', kind: 'experience', startDate: '2021-03', endDate: null, url: null, tags: [], text: { locale: 'fr', fallback: false, title: 'Engineer', subtitle: 'Company', description: 'Public experience' } },
      { id: 'portfolio', kind: 'project', startDate: null, endDate: null, url: 'https://example.com/project', tags: [], text: { locale: 'fr', fallback: false, title: 'Portfolio', subtitle: '', description: 'Public project' } },
      { id: 'other-project', kind: 'project', startDate: null, endDate: null, url: null, tags: [], text: { locale: 'fr', fallback: false, title: 'Other project', subtitle: '', description: 'No illustration' } },
      { id: 'vue', kind: 'skill', startDate: null, endDate: null, url: null, tags: [], text: { locale: 'en', fallback: true, title: 'Vue', subtitle: '', description: 'Visible skill description\nSecond line' } },
    ];
    populated.site.contactEmail = 'contact@example.com';
    populated.cv!.profile.countryCode = 'KR';
    populated.cv!.entries.push({ id: 'korean', kind: 'language', startDate: null, endDate: null, url: null, tags: [], text: { locale: 'fr', fallback: false, title: 'Coréen', subtitle: 'Niveau 6', description: '' } });
    const populatedPage = await renderPage(template, '/', populated);
    // Recruiter facts and contact are in the HTML, without JavaScript.
    const facts = populatedPage.html.match(/<ul[^>]*class="facts"[\s\S]*?<\/ul>/)![0];
    assert.match(facts, /Corée du Sud/);
    assert.match(facts, /Coréen/);
    assert.match(populatedPage.html, /href="mailto:contact@example.com"/);
    assert.match(populatedPage.html.match(/<section[^>]*id="languages"[\s\S]*?<\/section>/)![0], /Niveau 6/);
    assert.match(populatedPage.html, /href="#languages"/);
    assert.match(populatedPage.html, /href="\/admin\/login"/);
    assert.match(populatedPage.html, /"knowsLanguage":\["Coréen"\]/);
    const skills = populatedPage.html.match(/<section[^>]*id="skills"[\s\S]*?<\/section>/)![0];
    assert.match(skills, /Visible skill description/);
    assert.match(skills, /Second line/);
    assert.match(skills, /fallback-note/);
    assert.match(skills, /lang="en"/);
    assert.doesNotMatch(skills, /<details|<summary/);
    assert.doesNotMatch(populatedPage.html, /portfolio-preview/);
    assert.match(populatedPage.html, /datetime="2021-03"/);
    assert.equal((populatedPage.html.match(/<h1\b/g) ?? []).length, 1);
    // The portrait easter egg is a real button, so it also works from the keyboard.
    assert.match(populatedPage.html, /<button type="button" class="portrait-button"[^>]*aria-label="Photo de profil, petite surprise"/);
    // The presentation associations must not leak to a different entry kind.
    populated.cv!.entries = populated.cv!.entries.map(entry => ({ ...entry, kind: 'education' }));
    const educationPage = await renderPage(template, '/', populated);
    assert.doesNotMatch(educationPage.html, /class="project-preview"|featured-entry/);
    const admin = await renderPage(template, '/admin', { ...fixture('fr'), cv: null });
    assert.match(admin.html, /noindex, nofollow/);
    assert.match(admin.html, /<div id="app"><\/div>/);
    assert.doesNotMatch(admin.html, /scrypt|csrfToken|password_hash/);
  } finally { await server.close(); }
});
