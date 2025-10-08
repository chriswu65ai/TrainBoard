import { RouteProduct, TripTransportation, TripTransportationProperties } from "../models";

export interface TPTransportation extends Omit<TripTransportation, "properties" | "product"> {
    product?: TPRouteProduct;
    properties?: TPTransportationProperties;
}
export interface TPTransportationProperties extends TripTransportationProperties {
    RealtimeTripId?: string;
}
export interface TPRouteProduct extends Omit<RouteProduct, "_class"> {
    class: RouteProduct["_class"];
}
