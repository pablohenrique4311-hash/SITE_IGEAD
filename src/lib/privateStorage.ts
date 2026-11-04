const PRIVATE_KEYS = [
  'igead_whatsapp_automation_settings', 'igead_whatsapp_message_queue',
  'igead_whatsapp_message_history', 'igead_prayer_requests', 'igead_push_subscription',
];

export function clearLegacyPrivateStorage() {
  try {
    for (const key of PRIVATE_KEYS) localStorage.removeItem(key);
  } catch {
    // Navegadores podem bloquear armazenamento; não há fallback com dados pessoais.
  }
}
