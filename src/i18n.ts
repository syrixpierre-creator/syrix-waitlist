import { useEffect, useState } from 'react';

export type Lang = 'en' | 'fr';

const en = {
  'nav.syrix': 'SYRIX CHAT',
  'nav.wharise': 'WhaRise',
  'nav.faq': 'FAQ',
  'nav.join': 'Join the waitlist',
  'hero.title1': 'Two apps.',
  'hero.title2': 'One waitlist.',
  'hero.sub': 'SYRIX CHAT is the messenger that will bring your chats, calls, lives and earnings together, with end-to-end encrypted messages. WhaRise puts reactions on your WhatsApp channel posts on autopilot. Join the waitlist to be first in.',
  'form.email': 'Your e-mail',
  'form.pick': 'I want early access to',
  'form.channel': 'Your WhatsApp channel link (optional)',
  'form.channelPh': 'https://whatsapp.com/channel/…',
  'form.submit': 'Join the waitlist',
  'form.sending': 'Joining…',
  'form.privacy': 'We only use your e-mail to tell you when access opens. No spam.',
  'form.done': "You're in.",
  'form.position': "You're #{n} on the {p} waitlist.",
  'form.already': "You were already on the {p} waitlist (#{n}).",
  'form.again': 'Add another e-mail',
  'err.invalid_email': 'Enter a valid e-mail address.',
  'err.no_product': 'Pick at least one app.',
  'err.invalid_channel': 'The channel link must start with https://whatsapp.com/channel/',
  'err.rate_limited': 'Too many attempts. Try again in a few minutes.',
  'err.generic': 'Something went wrong. Try again.',
  'syrix.kicker': 'SYRIX CHAT',
  'syrix.title': 'Everything in one app.',
  'syrix.sub': 'Chat, call, go LIVE, build your community and earn from it. Coming to the web, Android and iPhone.',
  'syrix.soon': 'Not available yet · web, Android and iPhone coming soon',
  'syrix.unmute': 'Sound on',
  'syrix.mute': 'Mute',
  'f.chat': 'Private chats & groups',
  'f.chatSub': 'End-to-end encrypted messages, photos, videos, voice notes and files, plus reactions, polls and task lists.',
  'f.channels': 'Channels & communities',
  'f.channelsSub': 'Talk to all your subscribers at once and bring your groups together.',
  'f.calls': 'Audio & video calls',
  'f.callsSub': 'One tap to call, in private or from your chats.',
  'f.stories': 'Stories',
  'f.storiesSub': 'Photo, video or text, with music, filters and stickers.',
  'f.live': 'LIVE & gifts',
  'f.liveSub': 'Go live in one tap. Your community comments and sends gifts.',
  'f.money': 'Earn & withdraw',
  'f.moneySub': 'SXC coins, paid groups, paid messages, boosts, and withdrawals of your earnings.',
  'f.ai': 'SYRIX AI',
  'f.aiSub': 'Answers, translates, summarises, and can reply for you when you are away.',
  'f.bots': 'Bots',
  'f.botsSub': 'Plug your own bots in through the Bot API and automate your community.',
  'f.control': 'You stay in control',
  'f.controlSub': 'Hidden chats with a secret code, app lock, chat hours, two-step verification.',
  'wr.kicker': 'WhaRise',
  'wr.title': 'Reactions on your WhatsApp channel, on autopilot.',
  'wr.sub': 'Paste the link of a post, pick your emojis, send. Or let AutoReact handle every new post for you.',
  'wr.s1': 'Paste the post link',
  'wr.s1Sub': 'Open the message in your channel, copy its link.',
  'wr.s2': 'Pick up to 30 emojis',
  'wr.s2Sub': 'Each reaction uses one of them at random.',
  'wr.s3': 'Send',
  'wr.s3Sub': '30 coins per send, taken first and refunded automatically if nothing can be sent.',
  'wr.auto': 'AutoReact',
  'wr.autoSub': 'Reacts to new posts in the channels you choose.',
  'wr.coins': 'Coins',
  'wr.coinsSub': 'Buy coins, or earn coins inside the app.',
  'wr.api': 'API keys',
  'wr.apiSub': 'Connect WhaRise to your own tools.',
  'wr.history': 'Send history',
  'wr.historySub': 'Every send with its status, in real time.',
  'wr.demoLink': 'whatsapp.com/channel/0029VbC…/108',
  'wr.demoSend': 'Send · 30',
  'wr.demoSent': 'Sent',
  'wr.demoLinkLabel': 'Message link',
  'wr.demoEmojis': 'Emojis ({n}/30)',
  'wr.demoReactions': '{n} reactions',
  'band.title': 'Be first in line.',
  'band.sub': 'Early members get access before everyone else.',
  'faq.title': 'Questions',
  'faq.q1': 'When do the apps open?',
  'faq.a1': 'No version of SYRIX CHAT is available yet, not even on the web. The web, Android and iPhone versions are on the way. We e-mail you as soon as your access is ready.',
  'faq.q2': 'Is it free to join the waitlist?',
  'faq.a2': 'Yes. Joining is free and you can sign up for one app or both.',
  'faq.q3': 'Is SYRIX CHAT end-to-end encrypted?',
  'faq.a3': 'Yes. Messages, and the photos, videos, voice notes and files you send in private chats and groups, are encrypted on your device and can only be read by the people in the conversation, not by SYRIX. Public channels and conversations with SYRIX AI are not end-to-end encrypted, and the app tells you when that is the case.',
  'faq.q4': 'Are WhaRise reactions sent by real fans?',
  'faq.a4': 'No. WhaRise sends reactions automatically. Automated activity may go against WhatsApp’s terms, so use it responsibly on your own channels.',
  'faq.q5': 'What happens to my e-mail?',
  'faq.a5': 'It is only used to contact you about access to the apps you picked. You can ask us to delete it at any time.',
  'admin.title': 'Waitlist admin',
  'admin.email': 'E-mail',
  'admin.password': 'Password',
  'admin.signIn': 'Sign in',
  'admin.signOut': 'Sign out',
  'admin.bad': 'Wrong e-mail or password.',
  'admin.notConfigured': 'Admin sign-in is not configured on the server (ADMIN_PASSWORD).',
  'admin.tooMany': 'Too many attempts. Try again in 15 minutes.',
  'admin.total': 'Total signups',
  'admin.last30': 'Signups, last 30 days',
  'admin.export': 'Export CSV',
  'admin.search': 'Search an e-mail',
  'admin.all': 'All apps',
  'admin.colEmail': 'E-mail',
  'admin.colApp': 'App',
  'admin.colLang': 'Lang',
  'admin.colChannel': 'Channel',
  'admin.colSource': 'Source',
  'admin.colDate': 'Date',
  'admin.delete': 'Delete',
  'admin.deleteConfirm': 'Delete {email} from the {app} waitlist?',
  'admin.empty': 'No signups yet.',
  'admin.page': 'Page {p} of {n}',
  'admin.prev': 'Previous',
  'admin.next': 'Next',
  'footer.by': 'Created by Syrix Vision Company',
  'footer.terms': 'SYRIX CHAT terms',
  'footer.privacy': 'Privacy',
};

const fr: typeof en = {
  'nav.syrix': 'SYRIX CHAT',
  'nav.wharise': 'WhaRise',
  'nav.faq': 'FAQ',
  'nav.join': "Rejoindre la liste",
  'hero.title1': 'Deux applis.',
  'hero.title2': 'Une seule liste.',
  'hero.sub': 'SYRIX CHAT est la messagerie qui réunira tes discussions, appels, lives et revenus, avec des messages chiffrés de bout en bout. WhaRise met des réactions sur les publications de ta chaîne WhatsApp en pilote automatique. Inscris-toi pour être parmi les premiers.',
  'form.email': 'Ton e-mail',
  'form.pick': 'Je veux un accès anticipé à',
  'form.channel': 'Lien de ta chaîne WhatsApp (facultatif)',
  'form.channelPh': 'https://whatsapp.com/channel/…',
  'form.submit': "Rejoindre la liste d'attente",
  'form.sending': 'Inscription…',
  'form.privacy': "Ton e-mail sert uniquement à te prévenir de l'ouverture. Pas de spam.",
  'form.done': "C'est fait.",
  'form.position': "Tu es n°{n} sur la liste d'attente {p}.",
  'form.already': "Tu étais déjà sur la liste {p} (n°{n}).",
  'form.again': 'Ajouter un autre e-mail',
  'err.invalid_email': 'Entre une adresse e-mail valide.',
  'err.no_product': 'Choisis au moins une appli.',
  'err.invalid_channel': 'Le lien doit commencer par https://whatsapp.com/channel/',
  'err.rate_limited': 'Trop de tentatives. Réessaie dans quelques minutes.',
  'err.generic': 'Une erreur est survenue. Réessaie.',
  'syrix.kicker': 'SYRIX CHAT',
  'syrix.title': 'Tout dans une seule appli.',
  'syrix.sub': "Discute, appelle, passe en LIVE, construis ta communauté et gagne de l'argent. Bientôt sur le web, Android et iPhone.",
  'syrix.soon': 'Pas encore disponible · web, Android et iPhone bientôt',
  'syrix.unmute': 'Activer le son',
  'syrix.mute': 'Couper le son',
  'f.chat': 'Discussions privées & groupes',
  'f.chatSub': 'Messages, photos, vidéos, vocaux et fichiers chiffrés de bout en bout, plus réactions, sondages et listes de tâches.',
  'f.channels': 'Chaînes & communautés',
  'f.channelsSub': "Parle à tous tes abonnés d'un coup et réunis tes groupes.",
  'f.calls': 'Appels audio & vidéo',
  'f.callsSub': 'Un geste pour appeler, en privé ou depuis tes discussions.',
  'f.stories': 'Stories',
  'f.storiesSub': 'Photo, vidéo ou texte, avec musique, filtres et stickers.',
  'f.live': 'LIVE & cadeaux',
  'f.liveSub': 'Passe en direct en un geste. Ta communauté commente et envoie des cadeaux.',
  'f.money': 'Gagne & retire',
  'f.moneySub': 'SXC, groupes payants, messages payants, boosts, et retrait de tes gains.',
  'f.ai': 'SYRIX AI',
  'f.aiSub': 'Répond, traduit, résume, et peut répondre à ta place quand tu es absent.',
  'f.bots': 'Bots',
  'f.botsSub': 'Branche tes propres bots via la Bot API et automatise ta communauté.',
  'f.control': 'Tu gardes le contrôle',
  'f.controlSub': 'Discussions masquées par code secret, verrouillage, horaires, validation en deux étapes.',
  'wr.kicker': 'WhaRise',
  'wr.title': 'Des réactions sur ta chaîne WhatsApp, en pilote automatique.',
  'wr.sub': "Colle le lien d'une publication, choisis tes emojis, envoie. Ou laisse AutoReact gérer chaque nouvelle publication.",
  'wr.s1': 'Colle le lien de la publication',
  'wr.s1Sub': 'Ouvre le message dans ta chaîne et copie son lien.',
  'wr.s2': "Choisis jusqu'à 30 emojis",
  'wr.s2Sub': "Chaque réaction en utilise un au hasard.",
  'wr.s3': 'Envoie',
  'wr.s3Sub': "30 pièces par envoi, prélevées d'abord et remboursées automatiquement si rien ne peut être envoyé.",
  'wr.auto': 'AutoReact',
  'wr.autoSub': 'Réagit aux nouvelles publications des chaînes que tu choisis.',
  'wr.coins': 'Pièces',
  'wr.coinsSub': "Achète des pièces, ou gagne-en dans l'appli.",
  'wr.api': 'Clés API',
  'wr.apiSub': 'Connecte WhaRise à tes propres outils.',
  'wr.history': 'Historique des envois',
  'wr.historySub': 'Chaque envoi avec son statut, en temps réel.',
  'wr.demoLink': 'whatsapp.com/channel/0029VbC…/108',
  'wr.demoSend': 'Envoyer · 30',
  'wr.demoSent': 'Envoyé',
  'wr.demoLinkLabel': 'Lien du message',
  'wr.demoEmojis': 'Emojis ({n}/30)',
  'wr.demoReactions': '{n} réactions',
  'band.title': 'Sois le premier.',
  'band.sub': 'Les premiers inscrits ont accès avant tout le monde.',
  'faq.title': 'Questions',
  'faq.q1': 'Quand les applis ouvrent-elles ?',
  'faq.a1': "Aucune version de SYRIX CHAT n'est encore disponible, même pas sur le web. Les versions web, Android et iPhone arrivent. On t'écrit dès que ton accès est prêt.",
  'faq.q2': "L'inscription est-elle gratuite ?",
  'faq.a2': "Oui. L'inscription est gratuite, pour une appli ou les deux.",
  'faq.q3': 'SYRIX CHAT est-il chiffré de bout en bout ?',
  'faq.a3': "Oui. Les messages, et les photos, vidéos, vocaux et fichiers envoyés dans les discussions privées et les groupes, sont chiffrés sur ton appareil : seules les personnes de la conversation peuvent les lire, pas SYRIX. Les chaînes publiques et les conversations avec SYRIX AI ne sont pas chiffrées de bout en bout, et l'appli te l'indique.",
  'faq.q4': 'Les réactions WhaRise viennent-elles de vrais fans ?',
  'faq.a4': "Non. WhaRise envoie les réactions automatiquement. Une activité automatisée peut aller contre les conditions de WhatsApp : utilise-le de façon responsable sur tes propres chaînes.",
  'faq.q5': 'Que devient mon e-mail ?',
  'faq.a5': "Il sert uniquement à te contacter au sujet de l'accès aux applis choisies. Tu peux demander sa suppression à tout moment.",
  'admin.title': "Admin liste d'attente",
  'admin.email': 'E-mail',
  'admin.password': 'Mot de passe',
  'admin.signIn': 'Se connecter',
  'admin.signOut': 'Se déconnecter',
  'admin.bad': 'E-mail ou mot de passe incorrect.',
  'admin.notConfigured': "La connexion admin n'est pas configurée sur le serveur (ADMIN_PASSWORD).",
  'admin.tooMany': 'Trop de tentatives. Réessaie dans 15 minutes.',
  'admin.total': 'Inscriptions au total',
  'admin.last30': 'Inscriptions, 30 derniers jours',
  'admin.export': 'Exporter en CSV',
  'admin.search': 'Rechercher un e-mail',
  'admin.all': 'Toutes les applis',
  'admin.colEmail': 'E-mail',
  'admin.colApp': 'Appli',
  'admin.colLang': 'Langue',
  'admin.colChannel': 'Chaîne',
  'admin.colSource': 'Source',
  'admin.colDate': 'Date',
  'admin.delete': 'Supprimer',
  'admin.deleteConfirm': "Supprimer {email} de la liste d'attente {app} ?",
  'admin.empty': 'Aucune inscription pour le moment.',
  'admin.page': 'Page {p} sur {n}',
  'admin.prev': 'Précédent',
  'admin.next': 'Suivant',
  'footer.by': 'Créé par Syrix Vision Company',
  'footer.terms': 'Conditions SYRIX CHAT',
  'footer.privacy': 'Confidentialité',
};

export type Key = keyof typeof en;
const DICT: Record<Lang, typeof en> = { en, fr };

const initial = (): Lang => {
  const q = new URLSearchParams(location.search).get('lang');
  if (q === 'fr' || q === 'en') return q;
  try {
    const s = localStorage.getItem('lang');
    if (s === 'fr' || s === 'en') return s;
  } catch {
    /* storage unavailable */
  }
  return 'en';
};

let current: Lang = initial();
const listeners = new Set<() => void>();

export const getLang = () => current;
export function setLang(l: Lang) {
  current = l;
  try {
    localStorage.setItem('lang', l);
  } catch {
    /* storage unavailable */
  }
  document.documentElement.lang = l;
  listeners.forEach((f) => f());
}

export function t(key: Key, vars: Record<string, string | number> = {}) {
  return DICT[current][key].replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ''));
}

export function useLang() {
  const [, force] = useState(0);
  useEffect(() => {
    document.documentElement.lang = current;
    const f = () => force((n) => n + 1);
    listeners.add(f);
    return () => {
      listeners.delete(f);
    };
  }, []);
  return current;
}
