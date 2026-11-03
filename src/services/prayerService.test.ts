import test from 'node:test';
import assert from 'node:assert/strict';
import { formatPrayerMessage, PRAYER_CATEGORIES, PrayerRequestData } from './prayerService';

test('formatPrayerMessage formats prayer request matching specification', () => {
  const sample: PrayerRequestData = {
    name: 'Maria Silva',
    phone: '(65) 99999-8888',
    category: 'familia',
    message: 'Oração pela restauração do casamento e paz no lar.',
    isConfidential: true
  };

  const message = formatPrayerMessage(sample);

  assert.ok(message.includes('🕊️ *Novo Pedido de Oração - IGEAD-MT*'));
  assert.ok(message.includes('👤 *Nome:* Maria Silva'));
  assert.ok(message.includes('📱 *Contato:* (65) 99999-8888'));
  assert.ok(message.includes('🎯 *Área:* Família e Casamento'));
  assert.ok(message.includes('🔒 *Confidencial:* Sim'));
  assert.ok(message.includes('📝 *Motivo:* Oração pela restauração do casamento e paz no lar.'));
});

test('formatPrayerMessage handles empty phone and non-confidential properly', () => {
  const sample: PrayerRequestData = {
    name: 'João Pedro',
    category: 'saude',
    message: 'Cura para meu pai que está no hospital.',
    isConfidential: false
  };

  const message = formatPrayerMessage(sample);

  assert.ok(message.includes('👤 *Nome:* João Pedro'));
  assert.ok(message.includes('📱 *Contato:* Não informado'));
  assert.ok(message.includes('🎯 *Área:* Saúde e Cura'));
  assert.ok(message.includes('🔒 *Confidencial:* Não'));
});

test('PRAYER_CATEGORIES maps all canonical areas', () => {
  assert.equal(PRAYER_CATEGORIES.familia, 'Família e Casamento');
  assert.equal(PRAYER_CATEGORIES.saude, 'Saúde e Cura');
  assert.equal(PRAYER_CATEGORIES.espiritual, 'Libertação & Vida Espiritual');
  assert.equal(PRAYER_CATEGORIES.financeiro, 'Causas Financeiras & Emprego');
  assert.equal(PRAYER_CATEGORIES.agradecimento, 'Agradecimento por Bênção');
});
