import React, { useState } from "react";

import ControlPanelApp, { createDefaultBoardInstances } from "./components/ControlPanelApp";
import { BoardInstance } from "./types/BoardInstance";

export default function App() {
    const [boardInstances, setBoardInstances] = useState<BoardInstance[]>(() =>
        createDefaultBoardInstances()
    );
    const [selectedBoardIndex, setSelectedBoardIndex] = useState(0);

    const onUpdateBoardInstance = (
        index: number,
        updater: (board: BoardInstance) => BoardInstance
    ) => {
        setBoardInstances((current) =>
            current.map((board, boardIndex) => (boardIndex === index ? updater(board) : board))
        );
    };

    return (
        <ControlPanelApp
            boardInstances={boardInstances}
            selectedBoardIndex={selectedBoardIndex}
            onSelectBoard={setSelectedBoardIndex}
            onUpdateBoardInstance={onUpdateBoardInstance}
        />
    );
}
