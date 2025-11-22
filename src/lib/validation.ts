import { z } from 'zod';

export const hazmatFormSchema = z.object({
    carrier: z.enum(['FedEx', 'UPS']),
    mode: z.enum(['Air', 'Ground']),
    service: z.string().min(1, 'Service type is required'),
    weight: z.number().min(0.1, 'Weight must be greater than 0'),
    weightUnit: z.enum(['kg', 'lbs']),

    // Common fields
    unNumber: z.string().regex(/^UN\d{4}$/, 'Must be in format UNxxxx'),
    properShippingName: z.string().min(1, 'Proper shipping name is required'),
    technicalName: z.string().optional(), // Required if n.o.s.
    hazardClass: z.string().min(1, 'Hazard class is required'),
    packingGroup: z.enum(['I', 'II', 'III']).optional(),
    quantity: z.number().min(0, 'Quantity must be positive'),
    quantityUnit: z.string().min(1, 'Unit is required'),
    packagingType: z.string().optional(),
    emergencyPhone: z.string().min(10, 'Valid emergency phone required'),

    // IATA specific
    cargoAircraftOnly: z.boolean().optional(),
    accessibility: z.enum(['Accessible', 'Inaccessible']).optional(),
    packingInstruction: z.string().optional(),
    containerType: z.string().optional(),
    signatoryName: z.string().min(1, 'Signatory name is required'),
    signatoryTitle: z.string().optional(),
    signatoryPlace: z.string().optional(),

    // DOT specific
    reportableQuantity: z.boolean().optional(),
    offerorName: z.string().optional(),
}).superRefine((data, ctx) => {
    // Conditional validation logic
    if (data.mode === 'Air') {
        if (!data.packingInstruction) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Packing instruction is required for Air shipments",
                path: ["packingInstruction"]
            });
        }
        if (!data.signatoryTitle) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Signatory title is required for Air shipments",
                path: ["signatoryTitle"]
            });
        }
        if (!data.signatoryPlace) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Signatory place is required for Air shipments",
                path: ["signatoryPlace"]
            });
        }
    }

    if (data.mode === 'Ground') {
        if (!data.offerorName) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Offeror name is required for Ground shipments",
                path: ["offerorName"]
            });
        }
    }
});

export type HazmatFormData = z.infer<typeof hazmatFormSchema>;
