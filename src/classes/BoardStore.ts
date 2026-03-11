import { SettingsSet } from "./SettingsSet";

export interface BoardInstance {
    id: string;
    name: string;
    settings: SettingsSet;
}

interface RotationConfig {
    enabled: boolean;
    defaultDurationSeconds?: number;
}

export interface ControlPanelConfig {
    boards: BoardInstance[];
    rotation: RotationConfig;
    selectedBoardId?: string;
    lastEditedBoardId?: string;
}

const STORAGE_KEY = "controlPanelConfig";
const LEGACY_SETTINGS_KEY = "appSettings";

const DEFAULT_BOARD_ID = "board-1";

const defaultRotation: RotationConfig = {
    enabled: false,
};

const getDefaultBoard = (settings: SettingsSet): BoardInstance => ({
    id: DEFAULT_BOARD_ID,
    name: "Board 1",
    settings,
});

const parseJSON = <T>(rawValue: string | null): T | undefined => {
    if (!rawValue) {
        return undefined;
    }

    try {
        return JSON.parse(rawValue) as T;
    } catch (e) {
        return undefined;
    }
};

export default class BoardStore {
    static readonly STORAGE_KEY = STORAGE_KEY;
    static readonly LEGACY_SETTINGS_KEY = LEGACY_SETTINGS_KEY;

    static readConfig(defaultSettings: SettingsSet): ControlPanelConfig {
        BoardStore.migrateLegacySettings(defaultSettings);

        const rawConfig = parseJSON<ControlPanelConfig>(
            window.localStorage.getItem(BoardStore.STORAGE_KEY)
        );
        const boards = rawConfig?.boards?.length
            ? rawConfig.boards
            : [getDefaultBoard(defaultSettings)];

        const selectedBoardId = boards.some((board) => board.id === rawConfig?.selectedBoardId)
            ? rawConfig?.selectedBoardId
            : boards[0].id;

        return {
            boards,
            rotation: {
                ...defaultRotation,
                ...rawConfig?.rotation,
            },
            selectedBoardId,
            lastEditedBoardId: rawConfig?.lastEditedBoardId,
        };
    }

    static writeConfig(config: ControlPanelConfig) {
        window.localStorage.setItem(BoardStore.STORAGE_KEY, JSON.stringify(config));
    }

    static getSelectedBoard(defaultSettings: SettingsSet): BoardInstance {
        const config = BoardStore.readConfig(defaultSettings);
        return (
            config.boards.find((board) => board.id === config.selectedBoardId) ||
            config.boards[0] ||
            getDefaultBoard(defaultSettings)
        );
    }

    static updateSelectedBoardSettings(settings: SettingsSet, defaultSettings: SettingsSet) {
        const config = BoardStore.readConfig(defaultSettings);
        const selectedBoardId = config.selectedBoardId || config.boards[0]?.id;
        if (!selectedBoardId) {
            return;
        }

        const boards = config.boards.map((board) =>
            board.id === selectedBoardId ? { ...board, settings } : board
        );

        BoardStore.writeConfig({
            ...config,
            boards,
            selectedBoardId,
            lastEditedBoardId: selectedBoardId,
        });
    }

    static resetSelectedBoardSettings(defaultSettings: SettingsSet) {
        BoardStore.updateSelectedBoardSettings(defaultSettings, defaultSettings);
    }

    private static migrateLegacySettings(defaultSettings: SettingsSet) {
        const hasControlPanelConfig = !!window.localStorage.getItem(BoardStore.STORAGE_KEY);
        if (hasControlPanelConfig) {
            return;
        }

        const legacySettings = parseJSON<Partial<SettingsSet>>(
            window.localStorage.getItem(BoardStore.LEGACY_SETTINGS_KEY)
        );

        if (!legacySettings) {
            return;
        }

        const migratedSettings = {
            ...defaultSettings,
            ...legacySettings,
        };

        BoardStore.writeConfig({
            boards: [getDefaultBoard(migratedSettings)],
            rotation: defaultRotation,
            selectedBoardId: DEFAULT_BOARD_ID,
            lastEditedBoardId: DEFAULT_BOARD_ID,
        });
    }
}
