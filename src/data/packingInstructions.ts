export interface PackingInstruction {
    id: string;
    description: string;
    modes: ('Air' | 'Ground')[];
}

export const PACKING_INSTRUCTIONS: PackingInstruction[] = [
    // Class 3 - Flammable Liquids
    { id: "355", description: "Flammable liquids (PAX/CAO) - Steel/Aluminum drums", modes: ['Air'] },
    { id: "366", description: "Flammable liquids (CAO) - Steel/Aluminum drums", modes: ['Air'] },
    { id: "Y344", description: "Flammable liquids (Limited Quantity) - Metal cans", modes: ['Air'] },
    { id: "350", description: "Flammable liquids (PAX) - Plastic jerricans", modes: ['Air'] },
    { id: "360", description: "Flammable liquids (CAO) - Plastic jerricans", modes: ['Air'] },

    // Class 8 - Corrosives
    { id: "852", description: "Corrosive liquids (PAX) - Glass/Earthenware inner", modes: ['Air'] },
    { id: "856", description: "Corrosive liquids (CAO) - Glass/Earthenware inner", modes: ['Air'] },
    { id: "Y841", description: "Corrosive liquids (Limited Quantity) - Plastic bottles", modes: ['Air'] },
    { id: "850", description: "Corrosive liquids (PAX) - Metal drums", modes: ['Air'] },
    { id: "854", description: "Corrosive liquids (CAO) - Metal drums", modes: ['Air'] },

    // Class 9 - Miscellaneous
    { id: "964", description: "Environmentally hazardous substance, liquid", modes: ['Air'] },
    { id: "956", description: "Environmentally hazardous substance, solid", modes: ['Air'] },
    { id: "965", description: "Lithium ion batteries (loose)", modes: ['Air'] },
    { id: "966", description: "Lithium ion batteries packed with equipment", modes: ['Air'] },
    { id: "967", description: "Lithium ion batteries contained in equipment", modes: ['Air'] },
    { id: "968", description: "Lithium metal batteries (loose)", modes: ['Air'] },
    { id: "969", description: "Lithium metal batteries packed with equipment", modes: ['Air'] },
    { id: "970", description: "Lithium metal batteries contained in equipment", modes: ['Air'] },

    // Class 6.1 - Toxic
    { id: "655", description: "Toxic liquids (PAX)", modes: ['Air'] },
    { id: "663", description: "Toxic liquids (CAO)", modes: ['Air'] },
    { id: "Y642", description: "Toxic liquids (Limited Quantity)", modes: ['Air'] },

    // Class 4.1 - Flammable Solids
    { id: "446", description: "Flammable solids (PAX)", modes: ['Air'] },
    { id: "449", description: "Flammable solids (CAO)", modes: ['Air'] },
    { id: "Y441", description: "Flammable solids (Limited Quantity)", modes: ['Air'] },

    // Generic / Ground (DOT often uses 173.xxx but for this form we might just allow free text or these common ones)
    { id: "173.202", description: "Non-bulk packagings for liquid hazardous materials in Packing Group II", modes: ['Ground'] },
    { id: "173.203", description: "Non-bulk packagings for liquid hazardous materials in Packing Group III", modes: ['Ground'] },
    { id: "173.242", description: "Bulk packagings for liquid hazardous materials", modes: ['Ground'] },
];
