import { PaletteMode } from "@mui/material";

import { StopFinderLocation } from "../models/TripPlanner";

import APIClient from "./APIClient";
import BoardStore from "./BoardStore";
import { TransportModeId } from "./LineType";

interface SettingsSetCore {
    theme: PaletteMode;
    walkTime: number;
    tripCount: number;
    mapsEnabled: boolean;
    burnInProtection: boolean;
    excludedModes: TransportModeId[];
}
interface SettingsSetImport extends SettingsSetCore {
    fromStopName?: string;
    toStopName?: string;
}

export interface SettingsSet extends SettingsSetCore {
    fromStop?: StopFinderLocation;
    toStop?: StopFinderLocation;
    recentStops?: StopFinderLocation[];
}

export interface BurnInProtection {
    top: number;
    left: number;
}

export const defaultSettings: SettingsSet = {
    theme: "dark",
    walkTime: 10,
    tripCount: 6,
    recentStops: [],
    mapsEnabled: false,
    burnInProtection: false,
    excludedModes: [],
};

export default class SettingsManager {
    static readSettings(): SettingsSet {
        const selectedBoard = BoardStore.getSelectedBoard(defaultSettings);
        return {
            ...defaultSettings,
            ...selectedBoard.settings,
        };
    }

    static writeSettings(settings: SettingsSet | {}) {
        BoardStore.updateSelectedBoardSettings(
            {
                ...defaultSettings,
                ...settings,
            },
            defaultSettings
        );
    }

    static resetSettings() {
        BoardStore.resetSelectedBoardSettings(defaultSettings);
    }

    protected static fetchRemoteSettings(url: string): Promise<any> {
        return fetch(url)
            .catch(() => {
                // If CORS fails, try with the proxy
                return fetch(APIClient.getProxiedUrl(url));
            })
            .then((res) => {
                if (!res.ok) {
                    throw new Error(
                        `Failed to load remote settings: ${res.status} ${res.statusText}`
                    );
                }
                return res.json();
            });
    }

    static async loadRemoteSettings(
        url: string,
        currentSettings: SettingsManager
    ): Promise<SettingsSet> {
        const json: SettingsSetImport = await SettingsManager.fetchRemoteSettings(url);
        const settings = {
            ...defaultSettings,
        };

        const { fromStopName, toStopName } = json;

        const importMap = {
            fromStop: fromStopName,
            toStop: toStopName,
        };
        const client = new APIClient();
        for (const [key, query] of Object.entries(importMap)) {
            if (!query) {
                continue;
            }
            try {
                const locations = await client.getStopsByMode(query, settings.excludedModes);
                if (locations && locations.length) {
                    settings[key] = locations[0];
                }
            } catch (e) {
                // Ignore
            }
        }

        return settings;
    }

    static isConfiguredTrip(settings: SettingsSet): boolean {
        return !!(settings.fromStop && settings.toStop);
    }

    static getConfiguredTrip(
        settings: SettingsSet
    ): undefined | { from: StopFinderLocation; to: StopFinderLocation } {
        if (!SettingsManager.isConfiguredTrip(settings)) {
            return undefined;
        }

        return {
            from: settings.fromStop as StopFinderLocation,
            to: settings.toStop as StopFinderLocation,
        };
    }
}
