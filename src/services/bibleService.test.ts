import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getAllBooks,
  getBookById,
  getTranslationInfo,
  formatVerseCitation,
  formatFullVerseShare,
  parseBibleQuery,
  fetchChapterVerses
} from './bibleService';
import { BIBLE_BOOKS } from './bibleData';

test('Bible canon contains all 66 books', () => {
  const books = getAllBooks();
  assert.equal(books.length, 66);

  const oldTestament = books.filter((b) => b.testament === 'antigo');
  const newTestament = books.filter((b) => b.testament === 'novo');

  assert.equal(oldTestament.length, 39, 'Antigo Testamento must have 39 books');
  assert.equal(newTestament.length, 27, 'Novo Testamento must have 27 books');
});

test('getBookById finds books by id and slug', () => {
  const genesis = getBookById('genesis');
  assert.ok(genesis);
  assert.equal(genesis.name, 'Gênesis');
  assert.equal(genesis.chaptersCount, 50);

  const john = getBookById('joao');
  assert.ok(john);
  assert.equal(john.englishName, 'John');

  const psalms = getBookById('psalms');
  assert.ok(psalms);
  assert.equal(psalms.name, 'Salmos');
  assert.equal(psalms.chaptersCount, 150);
});

test('getTranslationInfo provides details for JFA and KJV', () => {
  const jfa = getTranslationInfo('jfa');
  assert.equal(jfa.id, 'jfa');
  assert.ok(jfa.fullName.includes('João Ferreira de Almeida'));

  const kjv = getTranslationInfo('kjv');
  assert.equal(kjv.id, 'kjv');
  assert.equal(kjv.language, 'English');
});

test('formatVerseCitation formats properly', () => {
  const citation = formatVerseCitation('João', 3, 16, 'jfa');
  assert.equal(citation, 'João 3:16 (Almeida (JFA))');

  const citationKjv = formatVerseCitation('Psalms', 23, 1, 'kjv');
  assert.equal(citationKjv, 'Psalms 23:1 (King James (KJV))');
});

test('parseBibleQuery resolves various Portuguese reference formats', () => {
  const res1 = parseBibleQuery('João 3:16');
  assert.ok(res1);
  assert.equal(res1?.book.name, 'João');
  assert.equal(res1?.chapter, 3);
  assert.equal(res1?.verse, 16);

  const res2 = parseBibleQuery('Salmos 23');
  assert.ok(res2);
  assert.equal(res2?.book.name, 'Salmos');
  assert.equal(res2?.chapter, 23);

  const res3 = parseBibleQuery('1 Coríntios 13');
  assert.ok(res3);
  assert.equal(res3?.book.name, '1 Coríntios');
  assert.equal(res3?.chapter, 13);
});

test('fetchChapterVerses returns canonical Salmos 23 with real verses', async () => {
  const data = await fetchChapterVerses('jfa', 'salmos', 23);
  assert.equal(data.bookName, 'Salmos');
  assert.equal(data.chapter, 23);
  assert.equal(data.verses.length, 6);
  assert.ok(data.verses[0].text.toLowerCase().includes('o senhor é o meu pastor'));
});


test('fetchChapterVerses returns canonical João 3 with verse 16', async () => {
  const data = await fetchChapterVerses('jfa', 'joao', 3);
  assert.equal(data.bookName, 'João');
  assert.equal(data.chapter, 3);
  assert.ok(data.verses.length >= 16);
  const verse16 = data.verses.find((v) => v.verse === 16);
  assert.ok(verse16);
  assert.ok(verse16.text.includes('Deus amou o mundo'));
});

test('fetchChapterVerses loads arbitrary chapters across OT and NT without error', async () => {
  // Teste de livro histórico / profético / epístola
  const gen50 = await fetchChapterVerses('jfa', 'genesis', 50);
  assert.equal(gen50.chapter, 50);
  assert.ok(gen50.verses.length > 0);

  const rom12 = await fetchChapterVerses('jfa', 'romanos', 12);
  assert.equal(rom12.chapter, 12);
  assert.ok(rom12.verses.length > 0);

  const rev22 = await fetchChapterVerses('jfa', 'apocalipse', 22);
  assert.equal(rev22.chapter, 22);
  assert.ok(rev22.verses.length > 0);
  assert.ok(rev22.verses.some((v) => v.text.toLowerCase().includes('amém')));
});

