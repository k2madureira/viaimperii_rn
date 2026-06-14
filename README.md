# Via Imperii

> *"Construa seu legado."*

Via Imperii é um aplicativo mobile de gestão de patrimônio e legado pessoal. O nome remete às antigas vias romanas — caminhos construídos para durar gerações — simbolizando a construção sólida e intencional do patrimônio ao longo do tempo.

---

## Tecnologias

- [Expo SDK 56](https://expo.dev)
- React Native 0.85
- React 19
- TypeScript
- react-native-svg
- react-native-safe-area-context

---

## Pré-requisitos

- [Node.js](https://nodejs.org) >= 18
- [npm](https://npmjs.com) ou [yarn](https://yarnpkg.com)
- Aplicativo **Expo Go** instalado no smartphone

---

## Instalação

```bash
# Clone o repositório
git clone <url-do-repositorio>
cd ViaImperiiExpo

# Instale as dependências
npm install
```

---

## Como executar

### Iniciar o servidor de desenvolvimento

```bash
npx expo start
```

O terminal exibirá um **QR Code** e as opções abaixo:

| Tecla | Ação |
|-------|------|
| `a`   | Abrir no emulador Android |
| `i`   | Abrir no simulador iOS (requer macOS) |
| `w`   | Abrir no navegador (web) |
| `r`   | Recarregar o app |
| `m`   | Alternar menu do desenvolvedor |

---

## Usando no smartphone

### Android

1. Instale o **Expo Go** na [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)
2. Abra o Expo Go e toque em **"Scan QR code"**
3. Aponte a câmera para o QR Code exibido no terminal
4. O app carrega automaticamente com **hot reload** ativo

> Certifique-se de que o smartphone e o computador estão na **mesma rede Wi-Fi**.

### iOS

1. Instale o **Expo Go** na [App Store](https://apps.apple.com/app/expo-go/id982107779)
2. Abra o aplicativo de **Câmera** nativa do iPhone
3. Aponte para o QR Code exibido no terminal — aparecerá uma notificação para abrir no Expo Go
4. Toque na notificação e o app abrirá com **hot reload** ativo

> Alternativa: dentro do Expo Go, toque em **"Enter URL manually"** e insira o endereço exibido no terminal (ex: `exp://192.168.x.x:8081`).

---

## Estrutura do projeto

```
ViaImperiiExpo/
├── App.tsx                  # Ponto de entrada — orquestra Splash → Login
├── app.json                 # Configurações do Expo
├── src/
│   ├── screens/
│   │   ├── SplashScreen.tsx # Tela de carregamento (logo branca, fundo vermelho)
│   │   └── LoginScreen.tsx  # Tela de login
│   └── components/
│       └── LogoIcon.tsx     # Logo SVG da Via Imperii
└── assets/                  # Ícones e imagens do app
```

---

## Fluxo de telas

```
Abertura do app
      ↓
 SplashScreen
 (2 segundos)
      ↓
 LoginScreen
```

---

## Paleta de cores

| Papel | Cor |
|-------|-----|
| Primária (vermelho) | `#8B1A2B` |
| Texto principal | `#111111` |
| Fundo | `#FFFFFF` |

---

## Scripts disponíveis

```bash
npm start          # Inicia o servidor Expo
npm run android    # Abre no emulador Android
npm run ios        # Abre no simulador iOS
npm run web        # Abre no navegador
```
