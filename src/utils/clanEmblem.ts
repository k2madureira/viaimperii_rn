import * as ImagePicker from 'expo-image-picker';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import i18n from '../i18n';

// Emblema do clã: ícone quadrado, leve. Recorte quadrado nativo (allowsEditing +
// aspect 1:1), teto de tamanho do arquivo escolhido e conversão para WEBP antes do
// upload (objeto público no S3, via presign purpose=clan).
export const EMBLEM_ASPECT: [number, number] = [1, 1];
export const EMBLEM_MAX_DIM = 512; // ícone — 512px basta e mantém o arquivo pequeno
export const EMBLEM_COMPRESS = 0.85;
// Limite do arquivo ORIGINAL escolhido (antes do processamento).
export const EMBLEM_MAX_PICK_BYTES = 8 * 1024 * 1024; // 8 MB

export class EmblemTooLargeError extends Error {
  constructor() {
    super(i18n.t('clan.emblem.tooLarge', { max: 8 }));
    this.name = 'EmblemTooLargeError';
  }
}

export class EmblemPermissionError extends Error {
  constructor() {
    super(i18n.t('clan.emblem.permissionDenied'));
    this.name = 'EmblemPermissionError';
  }
}

// Abre a galeria com recorte quadrado, valida o tamanho e devolve um WEBP local
// pronto para upload. Retorna null se o usuário cancelar. Lança
// EmblemPermissionError / EmblemTooLargeError em erros previsíveis.
export async function pickClanEmblem(): Promise<string | null> {
  const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!perm.granted) throw new EmblemPermissionError();

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true, // recorte nativo
    aspect: EMBLEM_ASPECT, // quadrado (ícone)
    quality: 1,
  });
  if (result.canceled) return null;

  const asset = result.assets[0];
  if (asset.fileSize && asset.fileSize > EMBLEM_MAX_PICK_BYTES) {
    throw new EmblemTooLargeError();
  }

  // Redimensiona para no máx. 512px e converte para WEBP.
  const ctx = ImageManipulator.manipulate(asset.uri);
  if (!asset.width || asset.width > EMBLEM_MAX_DIM) {
    ctx.resize({ width: EMBLEM_MAX_DIM });
  }
  const rendered = await ctx.renderAsync();
  const out = await rendered.saveAsync({ compress: EMBLEM_COMPRESS, format: SaveFormat.WEBP });
  return out.uri;
}
