import { TripRequestResponse, type TripRequestResponseMessage } from "../models";

import { TPJourney } from "./TPJourney";

export interface TPResponse extends Omit<TripRequestResponse, "journeys" | "systemMessages"> {
    journeys: TPJourney[];
    systemMessages?: (TripRequestResponseMessage & { text: string })[];
}
