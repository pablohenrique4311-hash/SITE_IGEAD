import { supabase } from '../lib/supabaseClient';
import { canonicalWord, getCuiabaDateString, type DailyWord } from '../../supabase/functions/_shared/dailyWord';
export { CANONICAL_DAILY_WORDS, formatWhatsAppDailyMessage, getCuiabaDateString } from '../../supabase/functions/_shared/dailyWord';
export type { DailyWord } from '../../supabase/functions/_shared/dailyWord';

export async function getDailyWord(dateParam?: string): Promise<DailyWord> {
  const targetDate = dateParam || getCuiabaDateString();

  // 1. Tenta buscar no Supabase se houver registro personalizado cadastrado para a data
  try {
    const { data, error } = await supabase
      .from('daily_words')
      .select('*')
      .eq('date', targetDate)
      .maybeSingle();

    if (!error && data && data.verse_text && data.reference) {
      return {
        id: data.id || `dw_${targetDate}`,
        date: targetDate,
        reference: data.reference,
        bookName: data.book_name || data.reference.split(' ')[0],
        chapter: data.chapter || 1,
        verseNumber: data.verse_number || 1,
        verseText: data.verse_text,
        reflection: data.reflection || 'Que a graça e a paz de nosso Senhor Jesus Cristo estejam com você neste dia abençoado.',
        translation: data.translation || 'Almeida (JFA)'
      };
    }
  } catch {
    // Continua para o algoritmo canônico sem interrupções
  }

  return canonicalWord(targetDate);
}
