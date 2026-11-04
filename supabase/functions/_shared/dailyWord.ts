export interface DailyWord {
  id: string;
  date: string; // Formato YYYY-MM-DD
  reference: string;
  bookName: string;
  chapter: number;
  verseNumber: number;
  verseText: string;
  reflection: string;
  translation: string;
}

/**
 * Acervo devocional canônico e fidedigno da IGEAD-MT
 * Versículos reais na versão Almeida Corrigida Fiel (JFA) acompanhados de reflexões pastorais genuínas.
 */
export const CANONICAL_DAILY_WORDS: Omit<DailyWord, 'id' | 'date'>[] = [
  {
    reference: 'Romanos 8:28',
    bookName: 'Romanos',
    chapter: 8,
    verseNumber: 28,
    verseText: 'E sabemos que todas as coisas cooperam para o bem daqueles que amam a Deus, daqueles que são chamados segundo o seu propósito.',
    reflection: 'Mesmo quando os ventos da vida parecem contrários, o Senhor governa cada detalhe da nossa caminhada. Nenhuma lágrima é esquecida e nenhuma aflição é em vão. Quando o nosso coração descansa no amor soberano do Pai, a tempestade presente se torna a semente do testemunho de amanhã. Confie: Ele está conduzindo tudo para o seu bem e para a glória do Seu Nome.',
    translation: 'Almeida (JFA)'
  },
  {
    reference: 'Salmos 23:1-3',
    bookName: 'Salmos',
    chapter: 23,
    verseNumber: 1,
    verseText: 'O Senhor é o meu pastor, nada me faltará. Deitar-me faz em verdes pastos, guia-me mansamente a águas tranqüilas. Refrigera a minha alma; guia-me pelas veredas da justiça, por amor do seu nome.',
    reflection: 'O Bom Pastor conhece cada uma das Suas ovelhas pelo nome. Quando as pressões cotidianas tentam roubar a nossa paz, a voz de Cristo nos chama ao repouso junto às águas tranquilas. Deixe que o Espírito Santo restaure hoje as suas forças físicas e espirituais. O que você precisa não é de autossuficiência, mas de se render aos cuidados daquele que nunca dorme.',
    translation: 'Almeida (JFA)'
  },
  {
    reference: 'Filipenses 4:6-7',
    bookName: 'Filipenses',
    chapter: 4,
    verseNumber: 6,
    verseText: 'Não estejais inquietos por coisa alguma; antes as vossas petições sejam em tudo conhecidas diante de Deus pela oração e súplica, com ação de graças. E a paz de Deus, que excede todo o entendimento, guardará os vossos corações e os vossos pensamentos em Cristo Jesus.',
    reflection: 'A ansiedade tenta antecipar fardos que Deus nunca nos pediu para carregar sozinhos. A resposta divina para a inquietação da alma não é o desespero, mas o altar de oração. Ao entregar cada preocupação nas mãos do Senhor com gratidão, uma paz sobrenatural blinda as nossas emoções e pensamentos, nos sustentando firmes.',
    translation: 'Almeida (JFA)'
  },
  {
    reference: 'Isaías 41:10',
    bookName: 'Isaías',
    chapter: 41,
    verseNumber: 10,
    verseText: 'Não temas, porque eu sou contigo; não te assombres, porque eu sou teu Deus; eu te fortaleço, e te ajudo, e te sustento com a destra da minha justiça.',
    reflection: 'O medo perde a sua força quando nos lembramos de quem caminha ao nosso lado. O Deus criador do universo não é um observador distante, mas um refúgio presente na angústia. Hoje, erga a cabeça e prossiga com coragem: a destra justa do Altíssimo está segurando a sua mão e providenciando a vitória.',
    translation: 'Almeida (JFA)'
  },
  {
    reference: 'Provérbios 3:5-6',
    bookName: 'Provérbios',
    chapter: 3,
    verseNumber: 5,
    verseText: 'Confia no Senhor de todo o teu coração, e não te estribes no teu próprio entendimento. Reconhece-o em todos os teus caminhos, e ele endireitará as tuas veredas.',
    reflection: 'Nossa visão humana é limitada pelo tempo presente, mas os planos de Deus abraçam a eternidade. Quando abrimos mão da pretensão de controlar tudo e consagramos os nossos projetos ao Senhor, Ele remove os obstáculos e alinha as nossas escolhas com o Seu perfeito propósito.',
    translation: 'Almeida (JFA)'
  },
  {
    reference: 'Lamentações 3:22-23',
    bookName: 'Lamentações',
    chapter: 3,
    verseNumber: 22,
    verseText: 'As misericórdias do Senhor são a causa de não sermos consumidos, porque as suas misericórdias não têm fim; novas são cada manhã; grande é a tua fidelidade.',
    reflection: 'Cada novo amanhecer é um testemunho vivo da graça divina. Não importa quais foram os erros, tropeços ou tristezas de ontem: a fidelidade do Senhor se renovou com a luz do sol de hoje. Abrace este dia com gratidão no coração, sabendo que o perdão e o favor de Deus são inesgotáveis sobre a sua vida.',
    translation: 'Almeida (JFA)'
  },
  {
    reference: 'Salmos 91:1-2',
    bookName: 'Salmos',
    chapter: 91,
    verseNumber: 1,
    verseText: 'Aquele que habita no esconderijo do Altíssimo, à sombra do Onipotente descansará. Direi do Senhor: Ele é o meu Deus, o meu refúgio, a minha fortaleza, e nele confiarei.',
    reflection: 'Habitar no esconderijo do Altíssimo é cultivar uma comunhão diária e íntima com o Senhor. Sob as Suas asas protetoras encontramos abrigo seguro contra as armadilhas do inimigo e a tempestade do mundo. Faça do Senhor o seu refúgio permanente e descanse na certeza de que Ele guarda a sua entrada e a sua saída.',
    translation: 'Almeida (JFA)'
  },
  {
    reference: 'Josué 1:9',
    bookName: 'Josué',
    chapter: 1,
    verseNumber: 9,
    verseText: 'Não to mandei eu? Esforça-te, e tem bom ânimo; não temas, nem te espantes; porque o Senhor teu Deus é contigo, por onde quer que andares.',
    reflection: 'A ordem de Deus para Josué continua ecoando para nós: coragem e fé inabalável. Os gigantes que se levantam à nossa frente não são maiores do que o Deus que vai adiante de nós abrindo caminho. Seja forte, mantenha o ânimo aceso e dê o próximo passo com determinação.',
    translation: 'Almeida (JFA)'
  },
  {
    reference: 'Mateus 11:28-30',
    bookName: 'Mateus',
    chapter: 11,
    verseNumber: 28,
    verseText: 'Vinde a mim, todos os que estais cansados e oprimidos, e eu vos aliviarei. Tomai sobre vós o meu jugo, e aprendei de mim, que sou manso e humilde de coração; e encontrareis descanso para as vossas almas.',
    reflection: 'Jesus não nos oferece uma religiosidade pesada e burocrática, mas um convite de amor e libertação. Se o seu coração se encontra sobrecarregado com as exigências da vida, aproxime-se de Cristo agora em oração. Nos braços do Mestre encontramos alívio verdadeiro, paz duradoura e refrigério para a alma.',
    translation: 'Almeida (JFA)'
  },
  {
    reference: 'Jeremias 29:11',
    bookName: 'Jeremias',
    chapter: 29,
    verseNumber: 11,
    verseText: 'Porque eu bem sei os pensamentos que tenho a vosso respeito, diz o Senhor; pensamentos de paz, e não de mal, para vos dar o fim que esperais.',
    reflection: 'Mesmo quando o cenário ao redor é incerto, o Senhor tem pensamentos de vitória e esperança para o Seu povo. Deus não planejou a sua derrota; Ele projetou um futuro abençoado e pleno de propósito. Persevere em oração, pois a promessa de Deus jamais volta vazia.',
    translation: 'Almeida (JFA)'
  },
  {
    reference: '2 Coríntios 12:9',
    bookName: '2 Coríntios',
    chapter: 12,
    verseNumber: 9,
    verseText: 'E disse-me: A minha graça te basta, porque o meu poder se aperfeiçoa na fraqueza. De boa vontade, pois, me gloriarei nas minhas fraquezas, para que em mim habite o poder de Cristo.',
    reflection: 'É quando chegamos ao limite das nossas forças humanas que o poder sobrenatural de Deus se manifesta com maior intensidade. A graça de Cristo é suficiente para sustentar você em qualquer provação. Não tema a sua limitação: é através dela que Deus revelará a grandeza do Seu poder.',
    translation: 'Almeida (JFA)'
  },
  {
    reference: 'Hebreus 12:1-2',
    bookName: 'Hebreus',
    chapter: 12,
    verseNumber: 1,
    verseText: 'Portanto nós também, pois que estamos rodeados de uma tão grande nuvem de testemunhas, deixemos todo o embaraço, e o pecado que tão de perto nos rodeia, e corramos com paciência a carreira que nos está proposta, olhando para Jesus, autor e consumador da fé.',
    reflection: 'A caminhada da fé é uma corrida de perseverança, não de velocidade efêmera. Desvencilhe-se de pesos desnecessários e mágoas do passado. Fixe os seus olhos em Cristo Jesus, nosso Salvador eterno, e continue marchando com fidelidade rumo ao alvo eterno.',
    translation: 'Almeida (JFA)'
  }
];

/**
 * Retorna a data no fuso de Cuiabá (America/Cuiaba) no formato YYYY-MM-DD
 */
export function getCuiabaDateString(dateObj: Date = new Date()): string {
  try {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Cuiaba',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
    return formatter.format(dateObj); // Retorna YYYY-MM-DD
  } catch {
    return dateObj.toISOString().split('T')[0];
  }
}

export function formatWhatsAppDailyMessage(dailyWord: DailyWord): string {
  return [
    '🙏 *PAZ DO SENHOR!*',
    '',
    '📖 *PALAVRA DO DIA — IGEAD-MT*',
    '',
    '*VERSÍCULO:*',
    `"${dailyWord.verseText.trim()}"`,
    '',
    '📚 *REFERÊNCIA:*',
    `${dailyWord.reference.trim()} (${dailyWord.translation || 'Almeida JFA'})`,
    '',
    '✨ *REFLEXÃO:*',
    dailyWord.reflection.trim(),
    '',
    '🙌 Que Deus abençoe seu dia e fortaleça sua fé!',
    '',
    '*IGEAD-MT — Igreja Evangélica Assembleia de Deus*'
  ].join('\n');
}

export function canonicalWord(date: string): DailyWord {
  const [year, month, day] = date.split('-').map(Number);
  const dayOfYear = Math.floor((Date.UTC(year, month - 1, day) - Date.UTC(year, 0, 1)) / 86400000);
  return { ...CANONICAL_DAILY_WORDS[dayOfYear % CANONICAL_DAILY_WORDS.length], id: `dw_${date}`, date };
}
