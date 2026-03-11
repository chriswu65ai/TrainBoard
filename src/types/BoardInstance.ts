import { PaletteMode } from "@mui/material";

import { TransportModeId } from "../classes/LineType";
import { SettingsSet } from "../classes/SettingsSet";
import { StopFinderLocation } from "../models/TripPlanner";

export interface BoardDisplaySettings {
    theme: PaletteMode;
    mapsEnabled: boolean;
    burnInProtection: boolean;
}

export interface BoardApiSettings {
    walkTime: number;
    tripCount: number;
    excludedModes: TransportModeId[];
}

export interface BoardInstance {
    id: string;
    name: string;
    fromStop?: StopFinderLocation;
    toStop?: StopFinderLocation;
    durationSeconds: number;
    settings: SettingsSet;
    displaySettings: BoardDisplaySettings;
    apiSettings: BoardApiSettings;
}
