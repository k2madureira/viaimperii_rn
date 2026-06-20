export interface LegionDescriptionParts {
  intro: string;
  perfil: string[];
  missoes: string[];
}

// Separa a descrição "<intro>. Perfil: a, b. Missões: x, y." em partes.
export function parseLegionDescription(desc: string | null): LegionDescriptionParts {
  if (!desc) return { intro: '', perfil: [], missoes: [] };

  const rePerfil = /Perfil:/i;
  const reMissoes = /Miss[õo]es:/i;
  const clean = (s: string) => s.replace(/^[.\s]+|[.\s]+$/g, '');
  const toItems = (s: string) =>
    clean(s)
      .split(',')
      .map((i) => clean(i))
      .filter(Boolean);

  const pIdx = desc.search(rePerfil);
  const mIdx = desc.search(reMissoes);

  let intro = desc;
  let perfil: string[] = [];
  let missoes: string[] = [];

  if (pIdx >= 0) {
    intro = desc.slice(0, pIdx);
    const rest = desc.slice(pIdx).replace(rePerfil, '');
    const mInRest = rest.search(reMissoes);
    if (mInRest >= 0) {
      perfil = toItems(rest.slice(0, mInRest));
      missoes = toItems(rest.slice(mInRest).replace(reMissoes, ''));
    } else {
      perfil = toItems(rest);
    }
  } else if (mIdx >= 0) {
    intro = desc.slice(0, mIdx);
    missoes = toItems(desc.slice(mIdx).replace(reMissoes, ''));
  }

  return { intro: clean(intro), perfil, missoes };
}
