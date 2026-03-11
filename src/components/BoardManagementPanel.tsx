import React from "react";

import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import SettingsIcon from "@mui/icons-material/Settings";
import {
    Alert,
    Box,
    Button,
    Card,
    CardActions,
    CardContent,
    Container,
    Stack,
    Typography,
} from "@mui/material";

import { BoardInstance } from "../types/BoardInstance";

interface BoardManagementPanelProps {
    boards: BoardInstance[];
    maxBoards: number;
    onAddBoard: () => void;
    onDeleteBoard: (boardId: string) => void;
    onOpenBoard: (boardId: string) => void;
}

export default function BoardManagementPanel({
    boards,
    maxBoards,
    onAddBoard,
    onDeleteBoard,
    onOpenBoard,
}: BoardManagementPanelProps) {
    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Stack spacing={3}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h4">Control Panel</Typography>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={onAddBoard}
                        disabled={boards.length >= maxBoards}
                    >
                        Add board
                    </Button>
                </Box>

                <Alert severity="info">
                    Manage up to {maxBoards} boards. Use <strong>Edit board</strong> to configure
                    each board independently.
                </Alert>

                <Stack spacing={2}>
                    {boards.map((board) => (
                        <Card key={board.id} variant="outlined">
                            <CardContent>
                                <Typography variant="h6">{board.name}</Typography>
                                <Typography color="text.secondary">
                                    {board.settings.fromStop?.disassembledName || "No from stop"} →{" "}
                                    {board.settings.toStop?.disassembledName || "No to stop"}
                                </Typography>
                            </CardContent>
                            <CardActions>
                                <Button
                                    startIcon={<SettingsIcon />}
                                    onClick={() => onOpenBoard(board.id)}
                                >
                                    Edit board
                                </Button>
                                <Button startIcon={<PlayArrowIcon />} disabled>
                                    Display mode (coming soon)
                                </Button>
                                <Button
                                    color="error"
                                    startIcon={<DeleteIcon />}
                                    onClick={() => onDeleteBoard(board.id)}
                                    disabled={boards.length <= 1}
                                >
                                    Delete
                                </Button>
                            </CardActions>
                        </Card>
                    ))}
                </Stack>
            </Stack>
        </Container>
    );
}
