export type WizardService = {
  id: string;
  slug: string;
  categoryId: string;
  name: string;
  description: string;
  durationMin: number;
  durationLabel: string;
  priceLabel: string;
  doctorIds: string[];
};

export type WizardDoctor = {
  id: string;
  slug: string;
  name: string;
  specialty: string;
  photoUrl: string | null;
  experience: string;
};

export type WizardData = {
  categories: { id: string; name: string }[];
  services: WizardService[];
  doctors: WizardDoctor[];
  clinic: { name: string; address: string; phone: string; whatsapp: string; horizonDays: number };
};

export type ApiSlot = { start: string; end: string; doctorIds: string[] };

export type StepId = "service" | "doctor" | "date" | "time" | "contacts";

export const STEPS: StepId[] = ["service", "doctor", "date", "time", "contacts"];
