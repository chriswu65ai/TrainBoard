import React, { ReactNode } from "react";

import DarkMode from "@mui/icons-material/DarkMode";
import HomeIcon from "@mui/icons-material/Home";
import LightMode from "@mui/icons-material/LightMode";
import MenuIcon from "@mui/icons-material/Menu";
import RefreshIcon from "@mui/icons-material/Refresh";
import { Box, PaletteMode, Typography } from "@mui/material";
import AppBar from "@mui/material/AppBar";
import IconButton from "@mui/material/IconButton";
import Toolbar from "@mui/material/Toolbar";

import { getAndroid } from "../util/android";

import Clock from "./Clock";

export default function MainAppBar({
    openMenu,
    label,
    refreshTimer,
    theme,
    toggleTheme,
    onExit,
}: {
    openMenu: () => void;
    label: ReactNode;
    refreshTimer: ReactNode;
    theme: PaletteMode;
    toggleTheme: () => void;
    onExit: () => void;
}) {
    return (
        <AppBar position="static" sx={(theme) => ({ backgroundColor: theme.palette.primary.main })}>
            <Toolbar sx={{ justifyContent: "space-between" }}>
                <IconButton
                    edge="start"
                    color="inherit"
                    aria-label="menu"
                    onClick={openMenu}
                    size="large"
                >
                    <MenuIcon />
                </IconButton>
                <IconButton
                    edge="start"
                    color="inherit"
                    aria-label="refresh"
                    onClick={() =>
                        getAndroid() ? getAndroid()?.reload() : window.location.reload()
                    }
                    size="large"
                >
                    <RefreshIcon />
                </IconButton>
                <Typography variant={"h6"} sx={{ flexGrow: 1 }}>
                    Train Board{label}
                </Typography>

                <Clock />
                <Box ml={1} />
                {refreshTimer}
                <IconButton sx={{ ml: 1 }} onClick={toggleTheme} color="inherit">
                    {theme === "dark" ? <LightMode /> : <DarkMode />}
                </IconButton>
                <IconButton color="inherit" onClick={onExit} size="large" aria-label="home">
                    <HomeIcon />
                </IconButton>
            </Toolbar>
        </AppBar>
    );
}
