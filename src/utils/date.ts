/**
 * Parseia uma data vinda do backend tratando-a como UTC.
 *
 * O backend serializa datetimes "naive" (sem fuso), ex.: "2026-06-21T03:30:00".
 * O `new Date(...)` do JS interpreta strings sem fuso como horário LOCAL, o que
 * desloca o valor pelo offset do dispositivo (ex.: −3h em São Paulo). Aqui
 * garantimos o sufixo 'Z' quando não houver indicação de fuso, forçando UTC.
 */
export function parseBackendDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  const hasTimezone = /[zZ]|[+-]\d{2}:?\d{2}$/.test(value);
  return new Date(hasTimezone ? value : `${value}Z`);
}

/**
 * Formata uma data do backend (UTC) como "dd/mm/aaaa às HH:MM" no fuso local.
 */
export function formatBackendDateTime(value: string | null | undefined): string | null {
  const d = parseBackendDate(value);
  if (!d || isNaN(d.getTime())) return null;
  const date = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const time = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  return `${date} às ${time}`;
}

/**
 * Data de publicação de um post do feed.
 *
 * Relativo só na primeira hora ("agora", "5min"); depois disso vira HORA
 * ABSOLUTA ("23:26", "ontem 23:26", "14/07 23:26").
 *
 * Motivo: o relativo trunca a hora (`2h` para qualquer coisa entre 2h00 e
 * 2h59), então posts publicados com minutos de diferença — o feed recebe posts
 * gerados de 5 em 5 minutos — ficavam TODOS com o mesmo rótulo e
 * indistinguíveis entre si. A hora absoluta desambigua sempre.
 */
export function formatPostTime(
  value: string | null | undefined,
  t: (key: string, options?: Record<string, any>) => string,
  locale: string,
): string {
  const d = parseBackendDate(value);
  if (!d || isNaN(d.getTime())) return '';

  const diffMin = Math.floor((Date.now() - d.getTime()) / 60_000);
  // Datas futuras (relógio dessincronizado) caem no relativo "agora".
  if (diffMin < 1) return t('feed.time.now');
  if (diffMin < 60) return t('feed.time.minutes', { count: diffMin });

  const time = d.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });

  // "Hoje"/"ontem" pelo calendário local do dispositivo (não por janelas de 24h).
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfToday.getDate() - 1);

  if (d >= startOfToday) return time;
  if (d >= startOfYesterday) return t('feed.time.yesterday', { time });

  const date = d.toLocaleDateString(locale, {
    day: '2-digit',
    month: '2-digit',
    // Ano só quando não for o corrente, para não poluir o caso comum.
    ...(d.getFullYear() !== now.getFullYear() ? { year: 'numeric' as const } : {}),
  });
  return `${date} ${time}`;
}

/**
 * Tempo relativo curto ("agora", "5min", "2h", "3d") a partir de uma data do
 * backend — usa as mesmas chaves `feed.time.*` já traduzidas no app.
 */
export function formatRelativeTime(
  value: string | null | undefined,
  t: (key: string, options?: Record<string, any>) => string,
): string {
  const d = parseBackendDate(value);
  if (!d || isNaN(d.getTime())) return '';
  const diffMin = Math.floor((Date.now() - d.getTime()) / 60_000);
  if (diffMin < 1) return t('feed.time.now');
  if (diffMin < 60) return t('feed.time.minutes', { count: diffMin });
  const h = Math.floor(diffMin / 60);
  if (h < 24) return t('feed.time.hours', { count: h });
  const days = Math.floor(h / 24);
  return t('feed.time.days', { count: days });
}
