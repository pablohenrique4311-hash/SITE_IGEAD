import test from 'node:test';
import assert from 'node:assert/strict';
import { formatWhatsAppDailyMessage, CANONICAL_DAILY_WORDS, DailyWord } from '../dailyWordService';

test('formatWhatsAppDailyMessage outputs exact required format', () => {
  const sampleWord: DailyWord = {
    id: 'dw_test',
    date: '2026-11-04',
    reference: 'Romanos 8:28',
    bookName: 'Romanos',
    chapter: 8,
    verseNumber: 28,
    verseText: 'E sabemos que todas as coisas cooperam para o bem daqueles que amam a Deus, daqueles que são chamados segundo o seu propósito.',
    reflection: 'Mesmo quando os ventos da vida parecem contrários, o Senhor governa cada detalhe da nossa caminhada.',
    translation: 'Almeida (JFA)'
  };

  const formatted = formatWhatsAppDailyMessage(sampleWord);

  assert.ok(formatted.includes('🙏 *PAZ DO SENHOR!*'));
  assert.ok(formatted.includes('📖 *PALAVRA DO DIA — IGEAD-MT*'));
  assert.ok(formatted.includes('*VERSÍCULO:*'));
  assert.ok(formatted.includes('E sabemos que todas as coisas cooperam para o bem'));
  assert.ok(formatted.includes('📚 *REFERÊNCIA:*'));
  assert.ok(formatted.includes('Romanos 8:28 (Almeida (JFA))'));
  assert.ok(formatted.includes('✨ *REFLEXÃO:*'));
  assert.ok(formatted.includes('Mesmo quando os ventos da vida parecem contrários'));
  assert.ok(formatted.includes('🙌 Que Deus abençoe seu dia e fortaleça sua fé!'));
  assert.ok(formatted.includes('*IGEAD-MT — Igreja Evangélica Assembleia de Deus*'));
});

test('CANONICAL_DAILY_WORDS has complete biblical records', () => {
  assert.ok(CANONICAL_DAILY_WORDS.length >= 10);
  for (const word of CANONICAL_DAILY_WORDS) {
    assert.ok(word.reference.length > 0);
    assert.ok(word.verseText.length > 0);
    assert.ok(word.reflection.length > 0);
  }
});
