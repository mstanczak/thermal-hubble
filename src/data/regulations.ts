export type Carrier = 'FedEx' | 'UPS';
export type TransportMode = 'Air' | 'Ground';

export interface ServiceType {
    id: string;
    name: string;
    carrier: Carrier;
    mode: TransportMode;
}

export const CARRIERS: Carrier[] = ['FedEx', 'UPS'];
export const MODES: TransportMode[] = ['Air', 'Ground'];

export const SERVICE_TYPES: ServiceType[] = [
    { id: 'fedex_priority_overnight', name: 'FedEx Priority Overnight', carrier: 'FedEx', mode: 'Air' },
    { id: 'fedex_standard_overnight', name: 'FedEx Standard Overnight', carrier: 'FedEx', mode: 'Air' },
    { id: 'fedex_2day', name: 'FedEx 2Day', carrier: 'FedEx', mode: 'Air' },
    { id: 'fedex_express_saver', name: 'FedEx Express Saver', carrier: 'FedEx', mode: 'Air' },
    { id: 'fedex_ground', name: 'FedEx Ground', carrier: 'FedEx', mode: 'Ground' },
    { id: 'fedex_home_delivery', name: 'FedEx Home Delivery', carrier: 'FedEx', mode: 'Ground' },
    { id: 'ups_next_day_air', name: 'UPS Next Day Air', carrier: 'UPS', mode: 'Air' },
    { id: 'ups_2nd_day_air', name: 'UPS 2nd Day Air', carrier: 'UPS', mode: 'Air' },
    { id: 'ups_ground', name: 'UPS Ground', carrier: 'UPS', mode: 'Ground' },
];

export const COMMON_UN_NUMBERS = [
    { un: 'UN1263', name: 'Paint' },
    { un: 'UN1950', name: 'Aerosols' },
    { un: 'UN3480', name: 'Lithium ion batteries' },
    { un: 'UN3481', name: 'Lithium ion batteries contained in equipment' },
    { un: 'UN3090', name: 'Lithium metal batteries' },
    { un: 'UN3091', name: 'Lithium metal batteries contained in equipment' },
    { un: 'UN1866', name: 'Resin solution' },
    { un: 'UN1760', name: 'Corrosive liquid, n.o.s.' },
    { un: 'UN1993', name: 'Flammable liquid, n.o.s.' },
    { un: 'UN3373', name: 'Biological substance, Category B' },
    { un: 'UN1845', name: 'Carbon dioxide, solid (Dry ice)' },
];

export const REGULATION_RULES = {
    FedEx: {
        Air: [
            "Accessible DG (Classes 1, 2.1, 2.2-CAO, 3, 4, 5, 8) require premium services (Priority/First Overnight).",
            "Inaccessible DG (Classes 2.2-non-CAO, 6.1, 6.2, 7, 9) allowed on economy services.",
            "All shipments must follow IATA DGR even if domestic.",
            "FedEx SameDay only accepts UN 3373 and Dry Ice."
        ],
        Ground: [
            "No Class 1.1, 1.2, 1.3, 1.5 explosives.",
            "No Class 2.3 poison gas.",
            "No Class 4.2 spontaneously combustible.",
            "No Class 6.2 infectious substances (including UN 3373).",
            "No Reportable Quantity shipments.",
            "No hazardous waste.",
            "Contiguous US only."
        ]
    },
    UPS: {
        Air: [
            "Follows IATA DGR with UPS variations.",
            "Some classes restricted on passenger aircraft."
        ],
        Ground: [
            "Follows DOT 49 CFR.",
            "Specific prohibitions on certain explosives and toxic substances."
        ]
    }
};
