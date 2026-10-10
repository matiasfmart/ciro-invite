import type { InvitationConfig } from '../config/types';

export const davidTheme: InvitationConfig['theme'] = {
  name: 'El guerrero David',
  image: './assets/characters/david-saludo.png',
  colors: { primary: '#36734b', accent: '#f6ce52', ink: '#294331', background: '#f7faf5', sky: '#b1e7df', terrain: '#477c46', water: '#9edcdb', banner: '#df6557', surface: '#ffffff', muted: '#4f6257', border: '#cfddce' },
  characters: { guideName: 'David', guideMode: 'sprite', appearance: { skin: '#f5c18a', hair: '#ffcf24', tunic: '#4d3321', leather: '#985a2c' } },
  adventure: {
    motto: 'Una fiesta inspirada en las aventuras de David.',
    stones: ['Valentía', 'Amistad', 'Alegría', 'Confianza', 'Amor'],
    confirmationClosing: '¡Qué alegría celebrar juntos!',
  },
  eyebrow: 'El guerrero David',
  headline: '¡Te invito a mi cumple!',
  description: 'Un día para jugar, reír y celebrar juntos.',
  closing: '¡Te espero para festejar conmigo!',
};