import React, { useState } from "react";

import { Navigate, Route, Routes, useNavigate, useParams } from "react-router-dom";

import BoardManagementPanel from "./components/BoardManagementPanel";
import BoardRuntime from "./components/BoardRuntime";
import { createDefaultBoardInstances } from "./components/ControlPanelApp";
import { BoardInstance } from "./types/BoardInstance";

const MAX_BOARDS = 5;

const createBoard = (boardNumber: number): BoardInstance => {
    const template = createDefaultBoardInstances()[0];
    return {
        ...template,
        id: `board-${boardNumber}`,
        name: `Board ${boardNumber}`,
    };
};

const getNextBoardNumber = (boards: BoardInstance[]) => {
    const used = new Set(
        boards
            .map((board) => Number(board.id.replace("board-", "")))
            .filter((value) => Number.isFinite(value))
    );

    for (let i = 1; i <= MAX_BOARDS; i += 1) {
        if (!used.has(i)) {
            return i;
        }
    }

    return boards.length + 1;
};

function AppRoutes({
    boardInstances,
    onUpdateBoardInstance,
}: {
    boardInstances: BoardInstance[];
    onUpdateBoardInstance: (
        index: number,
        updater: (board: BoardInstance) => BoardInstance
    ) => void;
}) {
    const params = useParams<{ boardId: string }>();
    const boardId = params.boardId;
    const boardIndex = boardInstances.findIndex((board) => board.id === boardId);

    if (boardIndex === -1) {
        return <Navigate to="/" replace />;
    }

    return (
        <BoardRuntime
            boardInstance={boardInstances[boardIndex]}
            onUpdateBoard={(updater) => onUpdateBoardInstance(boardIndex, updater)}
        />
    );
}

export default function App() {
    const [boardInstances, setBoardInstances] = useState<BoardInstance[]>(() =>
        createDefaultBoardInstances()
    );
    const navigate = useNavigate();

    const onUpdateBoardInstance = (
        index: number,
        updater: (board: BoardInstance) => BoardInstance
    ) => {
        setBoardInstances((current) =>
            current.map((board, boardIndex) => (boardIndex === index ? updater(board) : board))
        );
    };

    const onAddBoard = () => {
        setBoardInstances((current) => {
            if (current.length >= MAX_BOARDS) {
                return current;
            }

            const nextNumber = getNextBoardNumber(current);
            return [...current, createBoard(nextNumber)];
        });
    };

    const onDeleteBoard = (boardId: string) => {
        setBoardInstances((current) => {
            if (current.length <= 1) {
                return current;
            }

            return current.filter((board) => board.id !== boardId);
        });
    };

    return (
        <Routes>
            <Route
                path="/"
                element={
                    <BoardManagementPanel
                        boards={boardInstances}
                        maxBoards={MAX_BOARDS}
                        onAddBoard={onAddBoard}
                        onDeleteBoard={onDeleteBoard}
                        onOpenBoard={(boardId) => navigate(`/board/${boardId}`)}
                    />
                }
            />
            <Route
                path="/board/:boardId/*"
                element={
                    <AppRoutes
                        boardInstances={boardInstances}
                        onUpdateBoardInstance={onUpdateBoardInstance}
                    />
                }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}
