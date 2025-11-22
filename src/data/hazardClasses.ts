export interface HazardClass {
    id: string;
    label: string;
    description: string;
}

export const HAZARD_CLASSES: HazardClass[] = [
    { id: "1.1", label: "1.1 - Explosives (Mass Explosion)", description: "Substances and articles which have a mass explosion hazard." },
    { id: "1.2", label: "1.2 - Explosives (Projection Hazard)", description: "Substances and articles which have a projection hazard but not a mass explosion hazard." },
    { id: "1.3", label: "1.3 - Explosives (Fire/Minor Blast)", description: "Substances and articles which have a fire hazard and either a minor blast hazard or a minor projection hazard or both." },
    { id: "1.4", label: "1.4 - Explosives (No Significant Hazard)", description: "Substances and articles which present no significant hazard." },
    { id: "1.5", label: "1.5 - Explosives (Very Insensitive)", description: "Very insensitive substances which have a mass explosion hazard." },
    { id: "1.6", label: "1.6 - Explosives (Extremely Insensitive)", description: "Extremely insensitive articles which do not have a mass explosion hazard." },
    { id: "2.1", label: "2.1 - Flammable Gas", description: "Gases which ignite when in contact with a source of ignition." },
    { id: "2.2", label: "2.2 - Non-flammable, Non-toxic Gas", description: "Gases which are neither flammable nor toxic." },
    { id: "2.3", label: "2.3 - Toxic Gas", description: "Gases known to be so toxic or corrosive to humans as to pose a hazard to health." },
    { id: "3", label: "3 - Flammable Liquid", description: "Liquids which give off a flammable vapor at temperatures of not more than 60°C." },
    { id: "4.1", label: "4.1 - Flammable Solid", description: "Solids which, under conditions encountered in transport, are readily combustible or may cause or contribute to fire through friction." },
    { id: "4.2", label: "4.2 - Spontaneously Combustible", description: "Substances which are liable to spontaneous heating under normal conditions encountered in transport." },
    { id: "4.3", label: "4.3 - Dangerous When Wet", description: "Substances which, by interaction with water, are liable to become spontaneously flammable or to give off flammable gases in dangerous quantities." },
    { id: "5.1", label: "5.1 - Oxidizer", description: "Substances which, while in themselves not necessarily combustible, may, generally by yielding oxygen, cause, or contribute to, the combustion of other material." },
    { id: "5.2", label: "5.2 - Organic Peroxide", description: "Organic substances which contain the bivalent -O-O- structure and may be considered derivatives of hydrogen peroxide." },
    { id: "6.1", label: "6.1 - Toxic Substance", description: "Substances liable to cause death or injury or harm to human health if swallowed, inhaled or contacted by the skin." },
    { id: "6.2", label: "6.2 - Infectious Substance", description: "Substances known or reasonably expected to contain pathogens." },
    { id: "7", label: "7 - Radioactive Material", description: "Any material containing radionuclides where both the activity concentration and the total activity in the consignment exceed the values specified." },
    { id: "8", label: "8 - Corrosive", description: "Substances which by chemical action will cause severe damage when in contact with living tissue." },
    { id: "9", label: "9 - Miscellaneous", description: "Substances and articles which present a danger not covered by other classes." },
];
