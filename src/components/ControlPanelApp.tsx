import React, { useEffect } from "react";

import SettingsManager, { SettingsSet } from "../classes/SettingsSet";
import useBoardRotation from "../hooks/useBoardRotation";
import { BoardInstance } from "../types/BoardInstance";
import { getAndroid } from "../util/android";
import { initDpad } from "../util/dpad";

import BoardRuntime from "./BoardRuntime";

interface ControlPanelAppProps {
    boardInstances: BoardInstance[];
    selectedBoardIndex: number;
    rotationEnabled?: boolean;
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
    rotationEnabled = true,
    onSelectBoard,
    onUpdateBoardInstance,
}: ControlPanelAppProps) {
    useEffect(() => {
        getAndroid()?.ready();
        initDpad();
    }, []);

    const { currentBoard, currentBoardIndex } = useBoardRotation({
        boards: boardInstances,
        enabled: rotationEnabled,
        activeBoardIndex: selectedBoardIndex,
        onSelectBoard,
    });

    if (!currentBoard) {
        return null;
    }

    return (
        <BoardRuntime
            boardInstance={currentBoard}
            onUpdateBoard={(updater) => onUpdateBoardInstance(currentBoardIndex, updater)}
        />
    );
}
