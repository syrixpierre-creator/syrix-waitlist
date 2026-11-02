// Optional confirmation e-mail, sent only when SMTP_HOST is configured.
const TEXT = {
  en: {
    subject: "You're on the waitlist",
    line: (p) => `You're #${p.position} on the ${p.name} waitlist.`,
    end: "We'll write to you as soon as it opens. You can ignore this e-mail if you didn't sign up.",
  },
  fr: {
    subject: 'Tu es sur la liste d’attente',
    line: (p) => `Tu es n°${p.position} sur la liste d’attente ${p.name}.`,
    end: 'On t’écrit dès l’ouverture. Ignore cet e-mail si tu ne t’es pas inscrit.',
  },
};
const NAMES = { 'syrix-chat': 'SYRIX CHAT', wharise: 'WhaRise' };

export async function createMailer(env) {
  if (!env.SMTP_HOST) return null;
  const { default: nodemailer } = await import('nodemailer');
  const transport = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: Number(env.SMTP_PORT || 587),
    secure: Number(env.SMTP_PORT) === 465,
    auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASSWORD } : undefined,
  });
  return async (to, lang, results) => {
    const t = TEXT[lang] ?? TEXT.en;
    const lines = results.map((r) => t.line({ position: r.position, name: NAMES[r.product] }));
    await transport.sendMail({ from: env.SMTP_FROM || env.SMTP_USER, to, subject: t.subject, text: `${lines.join('\n')}\n\n${t.end}\n\nSyrix Vision Company` });
  };
}
