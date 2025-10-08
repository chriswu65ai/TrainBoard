import { parseLocalDateTime } from "../../../util/date";
import { TripRequestResponseJourneyLegStop } from "../models";

export interface TPLegStop
    extends Omit<
        TripRequestResponseJourneyLegStop,
        | "name" // Make name required
        | "coord" // Make coord have two numbers
        | "arrivalTimeEstimated"
        | "arrivalTimePlanned"
        | "departureTimeEstimated"
        | "departureTimePlanned"
    > {
    name: string;
    coord: [number, number];
    hasRealtime?: boolean;
    isSkipped?: boolean;
    arrivalTimeEstimated: Date;
    arrivalTimePlanned: Date;
    departureTimeEstimated: Date;
    departureTimePlanned: Date;
}

export function convertToTPLegStop(stop: TripRequestResponseJourneyLegStop): TPLegStop {
    return {
        ...stop,
        name: stop.name!,
        coord: stop.coord as [number, number],
        arrivalTimeEstimated: parseLocalDateTime(stop.arrivalTimeEstimated),
        arrivalTimePlanned: parseLocalDateTime(stop.arrivalTimePlanned),
        departureTimeEstimated: parseLocalDateTime(stop.departureTimeEstimated),
        departureTimePlanned: parseLocalDateTime(stop.departureTimePlanned),
        hasRealtime: undefined,
    };
}
