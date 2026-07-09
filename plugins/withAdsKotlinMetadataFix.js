// Config plugin local: contorna o erro de build do Gradle
//   "Module was compiled with an incompatible version of Kotlin.
//    The binary version of its metadata is 2.3.0, expected version is 2.1.0."
//
// Causa: o SDK nativo play-services-ads (via react-native-google-mobile-ads) é
// compilado com um Kotlin mais novo que o do Expo SDK 54 (2.1.20). O toolchain
// não suporta subir o Kotlin do projeto até 2.3, então a saída é dizer ao
// compilador para NÃO barrar metadata de versão mais nova (flag oficial do Kotlin).
//
// Injeta a flag em TODAS as compilações Kotlin (incl. o módulo de ads) via
// build.gradle raiz. Idempotente.
const { withProjectBuildGradle } = require('@expo/config-plugins');

const MARKER = '-Xskip-metadata-version-check';

const SNIPPET = `

// [withAdsKotlinMetadataFix] Permite consumir libs compiladas com Kotlin mais novo
// (ex.: play-services-ads) sem quebrar o build por incompatibilidade de metadata.
allprojects {
    tasks.withType(org.jetbrains.kotlin.gradle.tasks.KotlinCompile).configureEach {
        kotlinOptions {
            freeCompilerArgs += ["${MARKER}"]
        }
    }
}
`;

module.exports = function withAdsKotlinMetadataFix(config) {
  return withProjectBuildGradle(config, (cfg) => {
    if (cfg.modResults.language !== 'groovy') {
      throw new Error(
        'withAdsKotlinMetadataFix: root build.gradle não é Groovy — plugin não aplicado.',
      );
    }
    if (!cfg.modResults.contents.includes(MARKER)) {
      cfg.modResults.contents += SNIPPET;
    }
    return cfg;
  });
};
