export function PartySheep({ hat = false }: { hat?: boolean }) {
  return <span className="party-sheep-art" aria-hidden="true"><svg viewBox="73 437 637 571"><image href={`${import.meta.env.BASE_URL}assets/characters/oveja.png`} width="768" height="1366" /></svg>{hat && <span className="sheep-party-hat" />}</span>;
}