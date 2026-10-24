import { BibleBook, BibleTranslationInfo, BookCategory } from '../types';

export const BIBLE_TRANSLATIONS: Record<'jfa' | 'kjv', BibleTranslationInfo> = {
  jfa: {
    id: 'jfa',
    name: 'Almeida (JFA)',
    fullName: 'João Ferreira de Almeida',
    edition: 'Almeida Corrigida Fiel (ACF) / Domínio Público',
    language: 'Português',
    description: 'Tradução clássica de João Ferreira de Almeida (ACF), base de fé histórica e devoção reverente no meio evangélico lusófono.'
  },
  kjv: {
    id: 'kjv',
    name: 'King James (KJV)',
    fullName: 'King James Version',
    edition: 'Authorized Version (1611/1769)',
    language: 'English',
    description: 'A histórica tradução em língua inglesa, reverenciada mundialmente pela precisão, autoridade e profundidade literária.'
  }
};

export const BIBLE_BOOKS: BibleBook[] = [
  // Antigo Testamento (39 Livros)
  // Pentateuco
  { id: 'genesis', bookIndex: 0, name: 'Gênesis', abbreviation: 'Gn', englishName: 'Genesis', englishSlug: 'genesis', testament: 'antigo', category: 'pentateuco', chaptersCount: 50 },
  { id: 'exodo', bookIndex: 1, name: 'Êxodo', abbreviation: 'Êx', englishName: 'Exodus', englishSlug: 'exodus', testament: 'antigo', category: 'pentateuco', chaptersCount: 40 },
  { id: 'levitico', bookIndex: 2, name: 'Levítico', abbreviation: 'Lv', englishName: 'Leviticus', englishSlug: 'leviticus', testament: 'antigo', category: 'pentateuco', chaptersCount: 27 },
  { id: 'numeros', bookIndex: 3, name: 'Números', abbreviation: 'Nm', englishName: 'Numbers', englishSlug: 'numbers', testament: 'antigo', category: 'pentateuco', chaptersCount: 36 },
  { id: 'deuteronomio', bookIndex: 4, name: 'Deuteronômio', abbreviation: 'Dt', englishName: 'Deuteronomy', englishSlug: 'deuteronomy', testament: 'antigo', category: 'pentateuco', chaptersCount: 34 },

  // Históricos
  { id: 'josue', bookIndex: 5, name: 'Josué', abbreviation: 'Js', englishName: 'Joshua', englishSlug: 'joshua', testament: 'antigo', category: 'historicos', chaptersCount: 24 },
  { id: 'juizes', bookIndex: 6, name: 'Juízes', abbreviation: 'Jz', englishName: 'Judges', englishSlug: 'judges', testament: 'antigo', category: 'historicos', chaptersCount: 21 },
  { id: 'rute', bookIndex: 7, name: 'Rute', abbreviation: 'Rt', englishName: 'Ruth', englishSlug: 'ruth', testament: 'antigo', category: 'historicos', chaptersCount: 4 },
  { id: '1samuel', bookIndex: 8, name: '1 Samuel', abbreviation: '1Sm', englishName: '1 Samuel', englishSlug: '1+samuel', testament: 'antigo', category: 'historicos', chaptersCount: 31 },
  { id: '2samuel', bookIndex: 9, name: '2 Samuel', abbreviation: '2Sm', englishName: '2 Samuel', englishSlug: '2+samuel', testament: 'antigo', category: 'historicos', chaptersCount: 24 },
  { id: '1reis', bookIndex: 10, name: '1 Reis', abbreviation: '1Rs', englishName: '1 Kings', englishSlug: '1+kings', testament: 'antigo', category: 'historicos', chaptersCount: 22 },
  { id: '2reis', bookIndex: 11, name: '2 Reis', abbreviation: '2Rs', englishName: '2 Kings', englishSlug: '2+kings', testament: 'antigo', category: 'historicos', chaptersCount: 25 },
  { id: '1cronicas', bookIndex: 12, name: '1 Crônicas', abbreviation: '1Cr', englishName: '1 Chronicles', englishSlug: '1+chronicles', testament: 'antigo', category: 'historicos', chaptersCount: 29 },
  { id: '2cronicas', bookIndex: 13, name: '2 Crônicas', abbreviation: '2Cr', englishName: '2 Chronicles', englishSlug: '2+chronicles', testament: 'antigo', category: 'historicos', chaptersCount: 36 },
  { id: 'esdras', bookIndex: 14, name: 'Esdras', abbreviation: 'Ed', englishName: 'Ezra', englishSlug: 'ezra', testament: 'antigo', category: 'historicos', chaptersCount: 10 },
  { id: 'neemias', bookIndex: 15, name: 'Neemias', abbreviation: 'Ne', englishName: 'Nehemiah', englishSlug: 'nehemiah', testament: 'antigo', category: 'historicos', chaptersCount: 13 },
  { id: 'ester', bookIndex: 16, name: 'Ester', abbreviation: 'Et', englishName: 'Esther', englishSlug: 'esther', testament: 'antigo', category: 'historicos', chaptersCount: 10 },

  // Poéticos
  { id: 'jo', bookIndex: 17, name: 'Jó', abbreviation: 'Jó', englishName: 'Job', englishSlug: 'job', testament: 'antigo', category: 'poeticos', chaptersCount: 42 },
  { id: 'salmos', bookIndex: 18, name: 'Salmos', abbreviation: 'Sl', englishName: 'Psalms', englishSlug: 'salmos', testament: 'antigo', category: 'poeticos', chaptersCount: 150 },
  { id: 'proverbios', bookIndex: 19, name: 'Provérbios', abbreviation: 'Pv', englishName: 'Proverbs', englishSlug: 'proverbs', testament: 'antigo', category: 'poeticos', chaptersCount: 31 },
  { id: 'eclesiastes', bookIndex: 20, name: 'Eclesiastes', abbreviation: 'Ec', englishName: 'Ecclesiastes', englishSlug: 'ecclesiastes', testament: 'antigo', category: 'poeticos', chaptersCount: 12 },
  { id: 'canticos', bookIndex: 21, name: 'Cânticos', abbreviation: 'Ct', englishName: 'Song of Solomon', englishSlug: 'cantares', testament: 'antigo', category: 'poeticos', chaptersCount: 8 },

  // Profetas Maiores
  { id: 'isaias', bookIndex: 22, name: 'Isaías', abbreviation: 'Is', englishName: 'Isaiah', englishSlug: 'isaiah', testament: 'antigo', category: 'profetas_maiores', chaptersCount: 66 },
  { id: 'jeremias', bookIndex: 23, name: 'Jeremias', abbreviation: 'Jr', englishName: 'Jeremiah', englishSlug: 'jeremiah', testament: 'antigo', category: 'profetas_maiores', chaptersCount: 52 },
  { id: 'lamentacoes', bookIndex: 24, name: 'Lamentações', abbreviation: 'Lm', englishName: 'Lamentations', englishSlug: 'lamentations', testament: 'antigo', category: 'profetas_maiores', chaptersCount: 5 },
  { id: 'ezequiel', bookIndex: 25, name: 'Ezequiel', abbreviation: 'Ez', englishName: 'Ezekiel', englishSlug: 'ezekiel', testament: 'antigo', category: 'profetas_maiores', chaptersCount: 48 },
  { id: 'daniel', bookIndex: 26, name: 'Daniel', abbreviation: 'Dn', englishName: 'Daniel', englishSlug: 'daniel', testament: 'antigo', category: 'profetas_maiores', chaptersCount: 12 },

  // Profetas Menores
  { id: 'oseias', bookIndex: 27, name: 'Oséias', abbreviation: 'Os', englishName: 'Hosea', englishSlug: 'hosea', testament: 'antigo', category: 'profetas_menores', chaptersCount: 14 },
  { id: 'joel', bookIndex: 28, name: 'Joel', abbreviation: 'Jl', englishName: 'Joel', englishSlug: 'joel', testament: 'antigo', category: 'profetas_menores', chaptersCount: 3 },
  { id: 'amos', bookIndex: 29, name: 'Amós', abbreviation: 'Am', englishName: 'Amos', englishSlug: 'amos', testament: 'antigo', category: 'profetas_menores', chaptersCount: 9 },
  { id: 'obadias', bookIndex: 30, name: 'Obadias', abbreviation: 'Ob', englishName: 'Obadiah', englishSlug: 'obadiah', testament: 'antigo', category: 'profetas_menores', chaptersCount: 1 },
  { id: 'jonas', bookIndex: 31, name: 'Jonas', abbreviation: 'Jn', englishName: 'Jonah', englishSlug: 'jonah', testament: 'antigo', category: 'profetas_menores', chaptersCount: 4 },
  { id: 'miqueias', bookIndex: 32, name: 'Miquéias', abbreviation: 'Mq', englishName: 'Micah', englishSlug: 'micah', testament: 'antigo', category: 'profetas_menores', chaptersCount: 7 },
  { id: 'naum', bookIndex: 33, name: 'Naum', abbreviation: 'Na', englishName: 'Nahum', englishSlug: 'nahum', testament: 'antigo', category: 'profetas_menores', chaptersCount: 3 },
  { id: 'habacuque', bookIndex: 34, name: 'Habacuque', abbreviation: 'Hc', englishName: 'Habakkuk', englishSlug: 'habakkuk', testament: 'antigo', category: 'profetas_menores', chaptersCount: 3 },
  { id: 'sofonias', bookIndex: 35, name: 'Sofonias', abbreviation: 'Sf', englishName: 'Zephaniah', englishSlug: 'zephaniah', testament: 'antigo', category: 'profetas_menores', chaptersCount: 3 },
  { id: 'ageu', bookIndex: 36, name: 'Ageu', abbreviation: 'Ag', englishName: 'Haggai', englishSlug: 'haggai', testament: 'antigo', category: 'profetas_menores', chaptersCount: 2 },
  { id: 'zacarias', bookIndex: 37, name: 'Zacarias', abbreviation: 'Zc', englishName: 'Zechariah', englishSlug: 'zechariah', testament: 'antigo', category: 'profetas_menores', chaptersCount: 14 },
  { id: 'malaquias', bookIndex: 38, name: 'Malaquias', abbreviation: 'Ml', englishName: 'Malachi', englishSlug: 'malachi', testament: 'antigo', category: 'profetas_menores', chaptersCount: 4 },

  // Novo Testamento (27 Livros)
  // Evangelhos
  { id: 'mateus', bookIndex: 39, name: 'Mateus', abbreviation: 'Mt', englishName: 'Matthew', englishSlug: 'mateus', testament: 'novo', category: 'evangelhos', chaptersCount: 28 },
  { id: 'marcos', bookIndex: 40, name: 'Marcos', abbreviation: 'Mc', englishName: 'Mark', englishSlug: 'marcos', testament: 'novo', category: 'evangelhos', chaptersCount: 16 },
  { id: 'lucas', bookIndex: 41, name: 'Lucas', abbreviation: 'Lc', englishName: 'Luke', englishSlug: 'lucas', testament: 'novo', category: 'evangelhos', chaptersCount: 24 },
  { id: 'joao', bookIndex: 42, name: 'João', abbreviation: 'Jo', englishName: 'John', englishSlug: 'joao', testament: 'novo', category: 'evangelhos', chaptersCount: 21 },

  // Histórico NT
  { id: 'atos', bookIndex: 43, name: 'Atos', abbreviation: 'At', englishName: 'Acts', englishSlug: 'atos', testament: 'novo', category: 'historico_nt', chaptersCount: 28 },

  // Cartas Paulinas
  { id: 'romanos', bookIndex: 44, name: 'Romanos', abbreviation: 'Rm', englishName: 'Romans', englishSlug: 'romanos', testament: 'novo', category: 'cartas_paulinas', chaptersCount: 16 },
  { id: '1corintios', bookIndex: 45, name: '1 Coríntios', abbreviation: '1Co', englishName: '1 Corinthians', englishSlug: '1+corintios', testament: 'novo', category: 'cartas_paulinas', chaptersCount: 16 },
  { id: '2corintios', bookIndex: 46, name: '2 Coríntios', abbreviation: '2Co', englishName: '2 Corinthians', englishSlug: '2+corintios', testament: 'novo', category: 'cartas_paulinas', chaptersCount: 13 },
  { id: 'galatas', bookIndex: 47, name: 'Gálatas', abbreviation: 'Gl', englishName: 'Galatians', englishSlug: 'galatas', testament: 'novo', category: 'cartas_paulinas', chaptersCount: 6 },
  { id: 'efesios', bookIndex: 48, name: 'Efésios', abbreviation: 'Ef', englishName: 'Ephesians', englishSlug: 'efesios', testament: 'novo', category: 'cartas_paulinas', chaptersCount: 6 },
  { id: 'filipenses', bookIndex: 49, name: 'Filipenses', abbreviation: 'Fp', englishName: 'Philippians', englishSlug: 'filipenses', testament: 'novo', category: 'cartas_paulinas', chaptersCount: 4 },
  { id: 'colossenses', bookIndex: 50, name: 'Colossenses', abbreviation: 'Cl', englishName: 'Colossians', englishSlug: 'colossenses', testament: 'novo', category: 'cartas_paulinas', chaptersCount: 4 },
  { id: '1tessalonicenses', bookIndex: 51, name: '1 Tessalonicenses', abbreviation: '1Ts', englishName: '1 Thessalonians', englishSlug: '1+tessalonicenses', testament: 'novo', category: 'cartas_paulinas', chaptersCount: 5 },
  { id: '2tessalonicenses', bookIndex: 52, name: '2 Tessalonicenses', abbreviation: '2Ts', englishName: '2 Thessalonians', englishSlug: '2+tessalonicenses', testament: 'novo', category: 'cartas_paulinas', chaptersCount: 3 },
  { id: '1timoteo', bookIndex: 53, name: '1 Timóteo', abbreviation: '1Tm', englishName: '1 Timothy', englishSlug: '1+timoteo', testament: 'novo', category: 'cartas_paulinas', chaptersCount: 6 },
  { id: '2timoteo', bookIndex: 54, name: '2 Timóteo', abbreviation: '2Tm', englishName: '2 Timothy', englishSlug: '2+timoteo', testament: 'novo', category: 'cartas_paulinas', chaptersCount: 4 },
  { id: 'tito', bookIndex: 55, name: 'Tito', abbreviation: 'Tt', englishName: 'Titus', englishSlug: 'tito', testament: 'novo', category: 'cartas_paulinas', chaptersCount: 3 },
  { id: 'filemom', bookIndex: 56, name: 'Filemom', abbreviation: 'Fm', englishName: 'Philemon', englishSlug: 'filemom', testament: 'novo', category: 'cartas_paulinas', chaptersCount: 1 },

  // Cartas Gerais
  { id: 'hebreus', bookIndex: 57, name: 'Hebreus', abbreviation: 'Hb', englishName: 'Hebrews', englishSlug: 'hebreus', testament: 'novo', category: 'cartas_gerais', chaptersCount: 13 },
  { id: 'tiago', bookIndex: 58, name: 'Tiago', abbreviation: 'Tg', englishName: 'James', englishSlug: 'tiago', testament: 'novo', category: 'cartas_gerais', chaptersCount: 5 },
  { id: '1pedro', bookIndex: 59, name: '1 Pedro', abbreviation: '1Pe', englishName: '1 Peter', englishSlug: '1+pedro', testament: 'novo', category: 'cartas_gerais', chaptersCount: 5 },
  { id: '2pedro', bookIndex: 60, name: '2 Pedro', abbreviation: '2Pe', englishName: '2 Peter', englishSlug: '2+pedro', testament: 'novo', category: 'cartas_gerais', chaptersCount: 3 },
  { id: '1joao', bookIndex: 61, name: '1 João', abbreviation: '1Jo', englishName: '1 John', englishSlug: '1+joao', testament: 'novo', category: 'cartas_gerais', chaptersCount: 5 },
  { id: '2joao', bookIndex: 62, name: '2 João', abbreviation: '2Jo', englishName: '2 John', englishSlug: '2+joao', testament: 'novo', category: 'cartas_gerais', chaptersCount: 1 },
  { id: '3joao', bookIndex: 63, name: '3 João', abbreviation: '3Jo', englishName: '3 John', englishSlug: '3+joao', testament: 'novo', category: 'cartas_gerais', chaptersCount: 1 },
  { id: 'judas', bookIndex: 64, name: 'Judas', abbreviation: 'Jd', englishName: 'Jude', englishSlug: 'judas', testament: 'novo', category: 'cartas_gerais', chaptersCount: 1 },

  // Profético
  { id: 'apocalipse', bookIndex: 65, name: 'Apocalipse', abbreviation: 'Ap', englishName: 'Revelation', englishSlug: 'apocalipse', testament: 'novo', category: 'profetico', chaptersCount: 22 }
];

export const CATEGORY_LABELS: Record<BookCategory, string> = {
  pentateuco: 'Pentateuco',
  historicos: 'Livros Históricos',
  poeticos: 'Livros Poéticos',
  profetas_maiores: 'Profetas Maiores',
  profetas_menores: 'Profetas Menores',
  evangelhos: 'Evangelhos',
  historico_nt: 'Histórico',
  cartas_paulinas: 'Epístolas Paulinas',
  cartas_gerais: 'Epístolas Gerais',
  profetico: 'Profético'
};

// Passagens canônicas pré-armazenadas para carregamento instantâneo offline
export const CANONICAL_CHAPTERS: Record<string, Record<string, string[]>> = {
  'salmos:23': {
    jfa: [
      'O SENHOR é o meu pastor, nada me faltará.',
      'Deitar-me faz em verdes pastos, guia-me mansamente a águas tranqüilas.',
      'Refrigera a minha alma; guia-me pelas veredas da justiça, por amor do seu nome.',
      'Ainda que eu andasse pelo vale da sombra da morte, não temeria mal algum, porque tu estás comigo; a tua vara e o teu cajado me consolam.',
      'Preparas uma mesa perante mim na presença dos meus inimigos, unges a minha cabeça com óleo, o meu cálice transborda.',
      'Certamente que a bondade e a misericórdia me seguirão todos os dias da minha vida; e habitarei na casa do SENHOR por longos dias.'
    ],
    kjv: [
      'The LORD is my shepherd; I shall not want.',
      'He maketh me to lie down in green pastures: he leadeth me beside the still waters.',
      'He restoreth my soul: he leadeth me in the paths of righteousness for his name\'s sake.',
      'Yea, though I walk through the valley of the shadow of death, I will fear no evil: for thou art with me; thy rod and thy staff they comfort me.',
      'Thou preparest a table before me in the presence of mine enemies: thou anointest my head with oil; my cup runneth over.',
      'Surely goodness and mercy shall follow me all the days of my life: and I will dwell in the house of the LORD for ever.'
    ]
  },
  'joao:3': {
    jfa: [
      'E havia entre os fariseus um homem, chamado Nicodemos, príncipe dos judeus.',
      'Este foi ter de noite com Jesus, e disse-lhe: Rabi, bem sabemos que és Mestre, vindo de Deus; porque ninguém pode fazer estes sinais que tu fazes, se Deus não for com ele.',
      'Jesus respondeu, e disse-lhe: Na verdade, na verdade te digo que aquele que não nascer de novo, não pode ver o reino de Deus.',
      'Disse-lhe Nicodemos: Como pode um homem nascer, sendo velho? Pode, porventura, tornar a entrar no ventre de sua mãe, e nascer?',
      'Jesus respondeu: Na verdade, na verdade te digo que aquele que não nascer da água e do Espírito, não pode entrar no reino de Deus.',
      'O que é nascido da carne é carne, e o que é nascido do Espírito é espírito.',
      'Não te maravilhes de te ter dito: Necessário vos é nascer de novo.',
      'O vento assopra onde quer, e ouves a sua voz, mas não sabes de onde vem, nem para onde vai; assim é todo aquele que é nascido do Espírito.',
      'Nicodemos respondeu, e disse-lhe: Como pode ser isso?',
      'Jesus respondeu, e disse-lhe: Tu és mestre de Israel, e não sabes isto?',
      'Na verdade, na verdade te digo que nós dizemos o que sabemos, e testificamos o que vimos, e não aceitais o nosso testemunho.',
      'Se vos falei de coisas terrestres, e não crestes, como crereis, se vos falar das celestiais?',
      'Ora, ninguém subiu ao céu, senão o que desceu do céu, o Filho do homem, que está no céu.',
      'E, como Moisés levantou a serpente no deserto, assim importa que o Filho do homem seja levantado;',
      'Para que todo aquele que nele crê não pereça, mas tenha a vida eterna.',
      'Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito, para que todo aquele que nele crê não pereça, mas tenha a vida eterna.',
      'Porque Deus enviou o seu Filho ao mundo, não para que condenasse o mundo, mas para que o mundo fosse salvo por ele.',
      'Quem crê nele não é condenado; mas quem não crê já está condenado, porquanto não crê no nome do unigênito Filho de Deus.',
      'E a condenação é esta: Que a luz veio ao mundo, e os homens amaram mais as trevas do que a luz, porque as suas obras eram más.',
      'Porque todo aquele que faz o mal odeia a luz, e não vem para a luz, para que as suas obras não sejam reprovadas.',
      'Mas quem pratica a verdade vem para a luz, a fim de que as suas obras sejam manifestas, porque são feitas em Deus.'
    ],
    kjv: [
      'There was a man of the Pharisees, named Nicodemus, a ruler of the Jews:',
      'The same came to Jesus by night, and said unto him, Rabbi, we know that thou art a teacher come from God: for no man can do these miracles that thou doest, except God be with him.',
      'Jesus answered and said unto him, Verily, verily, I say unto thee, Except a man be born again, he cannot see the kingdom of God.',
      'Nicodemus saith unto him, How can a man be born when he is old? can he enter the second time into his mother\'s womb, and be born?',
      'Jesus answered, Verily, verily, I say unto thee, Except a man be born of water and of the Spirit, he cannot enter into the kingdom of God.',
      'That which is born of the flesh is flesh; and that which is born of the Spirit is spirit.',
      'Marvel not that I said unto thee, Ye must be born again.',
      'The wind bloweth where it listeth, and thou hearest the sound thereof, but canst not tell whence it cometh, and whither it goeth: so is every one that is born of the Spirit.',
      'Nicodemus answered and said unto him, How can these things be?',
      'Jesus answered and said unto him, Art thou a master of Israel, and knowest not these things?',
      'Verily, verily, I say unto thee, We speak that we do know, and testify that we have seen; and ye receive not our witness.',
      'If I have told you earthly things, and ye believe not, how shall ye believe, if I tell you of heavenly things?',
      'And no man hath ascended up to heaven, but he that came down from heaven, even the Son of man which is in heaven.',
      'And as Moses lifted up the serpent in the wilderness, even so must the Son of man be lifted up:',
      'That whosoever believeth in him should not perish, but have eternal life.',
      'For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.',
      'For God sent not his Son into the world to condemn the world; but that the world through him might be saved.',
      'He that believeth on him is not condemned: but he that believeth not is condemned already, because he hath not believed in the name of the only begotten Son of God.',
      'And this is the condemnation, that light is come into the world, and men loved darkness rather than light, because their deeds were evil.',
      'For every one that doeth evil hateth the light, neither cometh to the light, lest his deeds should be reproved.',
      'But he that doeth truth cometh to the light, that his deeds may be made manifest, that they are wrought in God.'
    ]
  }
};
