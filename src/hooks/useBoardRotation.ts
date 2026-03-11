import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { BoardInstance } from "../types/BoardInstance";

type BoardSwitchReason = "auto" | "manual";

interface UseBoardRotationProps {
    boards: BoardInstance[];
    enabled: boolean;
    activeBoardIndex: number;
    onSelectBoard: (index: number) => void;
    onBoardSwitch?: (index: number, reason: BoardSwitchReason) => void;
}

interface UseBoardRotationResult {
    currentBoardIndex: number;
    currentBoard: BoardInstance | undefined;
    nextSwitchCountdownSeconds: number | null;
    isPaused: boolean;
    selectBoard: (index: number) => void;
}

const MIN_ROTATION_SECONDS = 1;
const COUNTDOWN_UPDATE_MS = 250;

export default function useBoardRotation({
    boards,
    enabled,
    activeBoardIndex,
    onSelectBoard,
    onBoardSwitch,
}: UseBoardRotationProps): UseBoardRotationResult {
    const timeoutRef = useRef<number | null>(null);
    const countdownIntervalRef = useRef<number | null>(null);
    const switchAtRef = useRef<number | null>(null);
    const [nextSwitchCountdownSeconds, setNextSwitchCountdownSeconds] = useState<number | null>(
        null
    );

    const isPaused = !enabled || boards.length <= 1;

    const currentBoardIndex = useMemo(() => {
        if (!boards.length) {
            return 0;
        }

        return Math.min(Math.max(activeBoardIndex, 0), boards.length - 1);
    }, [activeBoardIndex, boards.length]);

    const currentBoard = boards[currentBoardIndex];

    const clearTimers = useCallback(() => {
        if (timeoutRef.current !== null) {
            window.clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }

        if (countdownIntervalRef.current !== null) {
            window.clearInterval(countdownIntervalRef.current);
            countdownIntervalRef.current = null;
        }

        switchAtRef.current = null;
        setNextSwitchCountdownSeconds(null);
    }, []);

    const selectBoard = useCallback(
        (index: number) => {
            if (!boards.length) {
                return;
            }

            clearTimers();
            const nextBoardIndex = Math.min(Math.max(index, 0), boards.length - 1);
            onSelectBoard(nextBoardIndex);
            onBoardSwitch?.(nextBoardIndex, "manual");
        },
        [boards.length, clearTimers, onBoardSwitch, onSelectBoard]
    );

    useEffect(() => {
        if (activeBoardIndex !== currentBoardIndex) {
            onSelectBoard(currentBoardIndex);
        }
    }, [activeBoardIndex, currentBoardIndex, onSelectBoard]);

    useEffect(() => {
        clearTimers();

        if (!currentBoard || isPaused) {
            return clearTimers;
        }

        const durationSeconds = Math.max(
            MIN_ROTATION_SECONDS,
            Math.floor(currentBoard.durationSeconds || 0)
        );
        const durationMs = durationSeconds * 1000;
        switchAtRef.current = Date.now() + durationMs;
        setNextSwitchCountdownSeconds(durationSeconds);

        countdownIntervalRef.current = window.setInterval(() => {
            if (!switchAtRef.current) {
                return;
            }

            const remainingMs = Math.max(0, switchAtRef.current - Date.now());
            setNextSwitchCountdownSeconds(Math.ceil(remainingMs / 1000));
        }, COUNTDOWN_UPDATE_MS);

        timeoutRef.current = window.setTimeout(() => {
            const nextBoardIndex = (currentBoardIndex + 1) % boards.length;
            onSelectBoard(nextBoardIndex);
            onBoardSwitch?.(nextBoardIndex, "auto");
        }, durationMs);

        return clearTimers;
    }, [
        boards,
        clearTimers,
        currentBoard,
        currentBoardIndex,
        isPaused,
        onBoardSwitch,
        onSelectBoard,
    ]);

    return {
        currentBoardIndex,
        currentBoard,
        nextSwitchCountdownSeconds,
        isPaused,
        selectBoard,
    };
}
