export interface InvitationConfig {
  child: { name: string; age: number };
  event: {
    date: string;
    time: string | null;
    endTime: string | null;
    timeZone: string;
    venue: string;
    address: string;
    city: string;
    notes: string;
  };
  rsvp: { phone: string | null; maxGuests: number };
  theme: {
    name: string;
    image: string;
    colors: { primary: string; accent: string; ink: string; background: string; sky: string; terrain: string; water: string; banner: string; surface?: string; muted?: string; border?: string };
    characters: { guideName: string; guideMode: 'svg' | 'css' | 'sprite'; appearance: { skin: string; hair: string; tunic: string; leather: string } };
    adventure: { motto: string; stones: string[]; confirmationClosing: string };
    eyebrow: string;
    headline: string;
    description: string;
    closing: string;
  };
  sections: { countdown: boolean; details: boolean; rsvp: boolean };
}