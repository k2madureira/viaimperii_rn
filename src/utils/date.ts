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
