import type { InvitationConfig } from '../config/types';

export function Character({ config, happy = false }: { config: InvitationConfig; happy?: boolean }) {
  return <span className={`character character-david ${happy ? 'character-happy' : ''}`} aria-hidden="true">
    <img className="character-sprite" src={`${import.meta.env.BASE_URL}assets/characters/david-saludo.png`} alt={config.theme.characters.guideName} loading="lazy" />
  </span>;
}