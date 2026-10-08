import test from 'node:test';
import assert from 'node:assert/strict';
import { splitIntroduction, descriptionBlocks } from '../src/features/cv/lib/presentation.ts';
test('short introduction preserves framework dots and all remaining sentences', () => {
  assert.deepEqual(splitIntroduction('Engineer. I use Vue.js and React. Product teamwork. Java skills.'), { lead: 'Engineer. I use Vue.js and React.', rest: 'Product teamwork. Java skills.' });
  assert.deepEqual(splitIntroduction('프런트엔드 개발자입니다. Vue.js를 사용합니다. 팀과 협업합니다.'), { lead: '프런트엔드 개발자입니다. Vue.js를 사용합니다.', rest: '팀과 협업합니다.' });
  assert.deepEqual(splitIntroduction('Une présentation sans ponctuation'), { lead: 'Une présentation sans ponctuation', rest: '' });
});
test('contributions become list items without dropping plain paragraphs or sparse descriptions', () => {
  assert.deepEqual(descriptionBlocks('Projet.\n• Vue.js\n• Équipe\nAutre paragraphe.'), [{ kind: 'paragraph', texts: ['Projet.'] }, { kind: 'list', texts: ['Vue.js', 'Équipe'] }, { kind: 'paragraph', texts: ['Autre paragraphe.'] }]);
  assert.deepEqual(descriptionBlocks(''), []);
});
