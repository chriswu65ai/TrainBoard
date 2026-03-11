import React, { useEffect } from "react";

import SettingsManager, { SettingsSet } from "../classes/SettingsSet";
import { BoardInstance } from "../types/BoardInstance";
import { getAndroid } from "../util/android";
import { initDpad } from "../util/dpad";

import BoardRuntime from "./BoardRuntime";

interface ControlPanelAppProps {
    boardInstances: BoardInstance[];
    selectedBoardIndex: number;
    onSelectBoard: (index: number) => void;
    onUpdateBoardInstance: (
        index: number,
        updater: (board: BoardInstance) => BoardInstance
    ) => void;
}

const createBoardFromSettings = (settings: SettingsSet): BoardInstance => ({
    id: "board-1",
    name: "Board 1",
    durationSeconds: 30,
    fromStop: settings.fromStop,
    toStop: settings.toStop,
    settings,
    displaySettings: {
        theme: settings.theme,
        mapsEnabled: settings.mapsEnabled,
        burnInProtection: settings.burnInProtection,
    },
    apiSettings: {
        walkTime: settings.walkTime,
        tripCount: settings.tripCount,
        excludedModes: settings.excludedModes,
    },
});

export const createDefaultBoardInstances = (): BoardInstance[] => {
    const settings = SettingsManager.readSettings();
    return [createBoardFromSettings(settings)];
};

export default function ControlPanelApp({
    boardInstances,
    selectedBoardIndex,
    onSelectBoard,
    onUpdateBoardInstance,
}: ControlPanelAppProps) {
    useEffect(() => {
        getAndroid()?.ready();
        initDpad();
    }, []);

    const activeBoardIndex = Math.min(selectedBoardIndex, boardInstances.length - 1);
    const activeBoard = boardInstances[activeBoardIndex];

    useEffect(() => {
        if (activeBoardIndex !== selectedBoardIndex) {
            onSelectBoard(activeBoardIndex);
        }
    }, [activeBoardIndex, selectedBoardIndex, onSelectBoard]);

    if (!activeBoard) {
        return null;
    }

    return (
        <BoardRuntime
            boardInstance={activeBoard}
            onUpdateBoard={(updater) => onUpdateBoardInstance(activeBoardIndex, updater)}
        />
    );
}
