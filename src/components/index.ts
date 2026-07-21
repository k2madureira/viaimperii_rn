export { default as Footer } from './footer';
export { default as GlobalSearchModal } from './globalSearchModal';
export { default as LegionAttributes } from './legionAttributes';
export { default as LegionSelectModal } from './legionSelectModal';
export { default as PraefectusBadge } from './praefectusBadge';
export { default as LogoIcon } from './logoIcon';
export { default as Navbar } from './navbar';
export { default as ProgressRing } from './progressRing';
export { default as ProvinceSetupModal } from './provinceSetupModal';
export { default as SearchBar } from './searchBar';
export { default as TrackSelectModal } from './trackSelectModal';
export { default as UserMenu } from './userMenu';

export { default as ScreenContainer } from './screenContainer';

// Text/TextInput aplicam o teto de escala de fonte (ver MAX_FONT_SCALE).
// Consumidores devem importar direto da pasta (`components/text`), NÃO por este
// barrel: como quase todo componente usa Text, importá-lo daqui puxaria a árvore
// inteira de componentes e criaria ciclos de import.
export { default as Text, MAX_FONT_SCALE } from './text';
export { default as TextInput, type TextInputRef } from './textInput';
