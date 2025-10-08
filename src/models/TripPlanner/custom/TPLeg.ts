import { TripRequestResponseJourneyLeg } from "../models";

import { CancelStatus } from "./CancelStatus";
import { convertToTPLegStop, TPLegStop } from "./TPLegStop";
import { TPTransportation } from "./TPTransportation";

export interface TPLeg
    extends Omit<
        TripRequestResponseJourneyLeg,
        "origin" | "destination" | "stopSequence" | "transportation"
    > {
    hasRealtime?: boolean;
    cancelStatus?: CancelStatus;
    isDepartureOnly?: boolean;
    origin: TPLegStop;
    destination: TPLegStop;
    stopSequence?: TPLegStop[];
    transportation?: TPTransportation;
}

export function convertToTPLeg(leg: TripRequestResponseJourneyLeg): TPLeg {
    return {
        ...leg,
        hasRealtime: undefined,
        origin: convertToTPLegStop(leg.origin!),
        destination: convertToTPLegStop(leg.destination!),
        stopSequence: leg.stopSequence?.map(convertToTPLegStop),
        transportation: leg.transportation as TPTransportation | undefined,
    };
}
