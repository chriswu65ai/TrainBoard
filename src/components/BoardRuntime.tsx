import React, { Suspense, useEffect, useMemo, useRef, useState } from "react";

import MenuIcon from "@mui/icons-material/Menu";
import { Box } from "@mui/material";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import { styled, ThemeProvider } from "@mui/material/styles";
import { Route, Routes, useNavigate } from "react-router-dom";

import APIClient from "../classes/APIClient";
import SettingsManager, { SettingsSet } from "../classes/SettingsSet";
import { ParsedVehiclePositionEntity } from "../models/GTFS/VehiclePositions";
import { TPJourney } from "../models/TripPlanner/custom/TPJourney";
import { createAppTheme } from "../theme";
import { BoardInstance } from "../types/BoardInstance";

import CardMessage from "./CardMessage";
import MainAppBar from "./MainAppBar";
import RefreshTimer from "./RefreshTimer";
import { OnUpdateFunc, SettingsPane } from "./SettingsPane/SettingsPane";
import SettingsScreen from "./SettingsScreen";
import TripBoard from "./TripBoard";

const TrainMap = React.lazy(() => import("./Widget/TrainMap"));

interface BoardRuntimeProps {
    boardInstance: BoardInstance;
    onUpdateBoard: (updater: (board: BoardInstance) => BoardInstance) => void;
}

export default function BoardRuntime({ boardInstance, onUpdateBoard }: BoardRuntimeProps) {
    const navigate = useNavigate();
    const [hasInitialized, setHasInitialized] = useState(false);
    const [trips, setTrips] = useState<TPJourney[]>([]);
    const [realtimeTripData, setRealtimeTripData] = useState<ParsedVehiclePositionEntity[]>([]);
    const [isTripsRefreshing, setIsTripsRefreshing] = useState(false);
    const [lastRefreshTime, setLastRefreshTime] = useState<number | null>(null);
    const [lastApiError, setLastApiError] = useState("");
    const [burnInProtection, setBurnInProtection] = useState({ top: 0, left: 0 });
    const tripsTimeoutKey = useRef(0);

    const { settings } = boardInstance;
    const theme = useMemo(() => createAppTheme(settings.theme), [settings.theme]);

    useEffect(() => {
        void getTrips(boardInstance.settings);
        return () => {
            window.clearTimeout(tripsTimeoutKey.current);
        };
    }, [boardInstance.id]);

    useEffect(() => {
        void getTrips(boardInstance.settings);
    }, [settings.fromStop?.id, settings.toStop?.id, settings.excludedModes]);

    const onUpdateSetting: OnUpdateFunc = (key, value) => {
        onUpdateBoard((currentBoard) => {
            const previousSettings = currentBoard.settings;
            const prevValue = previousSettings[key];
            const nextValue = typeof value === "function" ? value(prevValue) : value;
            const nextSettings: SettingsSet = {
                ...previousSettings,
                [key]: nextValue,
            };

            if ((["fromStop", "toStop"] as (keyof SettingsSet)[]).includes(key)) {
                nextSettings.recentStops = [
                    nextValue,
                    ...(previousSettings.recentStops || []).filter(
                        (stop) => stop.id !== nextValue?.id
                    ),
                ];
            }

            SettingsManager.writeSettings(nextSettings);

            return {
                ...currentBoard,
                fromStop: nextSettings.fromStop,
                toStop: nextSettings.toStop,
                settings: nextSettings,
                displaySettings: {
                    theme: nextSettings.theme,
                    mapsEnabled: nextSettings.mapsEnabled,
                    burnInProtection: nextSettings.burnInProtection,
                },
                apiSettings: {
                    walkTime: nextSettings.walkTime,
                    tripCount: nextSettings.tripCount,
                    excludedModes: nextSettings.excludedModes,
                },
            };
        });
    };

    const onResetSettings = () => {
        SettingsManager.resetSettings();
        const resetSettings = SettingsManager.readSettings();
        onUpdateBoard((currentBoard) => ({
            ...currentBoard,
            fromStop: resetSettings.fromStop,
            toStop: resetSettings.toStop,
            settings: resetSettings,
            displaySettings: {
                theme: resetSettings.theme,
                mapsEnabled: resetSettings.mapsEnabled,
                burnInProtection: resetSettings.burnInProtection,
            },
            apiSettings: {
                walkTime: resetSettings.walkTime,
                tripCount: resetSettings.tripCount,
                excludedModes: resetSettings.excludedModes,
            },
        }));
    };

    const openMenu = () => {
        navigate({ pathname: `/settings/${SettingsPane.GENERAL}` });
    };

    const getCurrentTripLabel = () => {
        const trip = SettingsManager.getConfiguredTrip(settings);
        if (!trip) {
            return "";
        }
        return `: ${trip.from.disassembledName} ➡ ${trip.to.disassembledName}`;
    };

    const getTrips = async (useSettings: SettingsSet) => {
        const trip = SettingsManager.getConfiguredTrip(useSettings);
        if (!trip) {
            return;
        }
        const { from, to } = trip;

        window.clearTimeout(tripsTimeoutKey.current);

        setIsTripsRefreshing(true);
        const client = new APIClient();
        try {
            const response = await client.getTrips(from.id!, to.id!, useSettings);

            setHasInitialized(true);
            setTrips(response.journeys || []);
            setLastRefreshTime(Date.now());
            setLastApiError("");

            const updatedJourneys = await client.getGTFSRealtime(response.journeys);
            setTrips(updatedJourneys);
            setIsTripsRefreshing(false);
        } catch (e) {
            let message = e instanceof Error ? e.message : JSON.stringify(e);

            if (/Failed to fetch/i.test(message)) {
                message =
                    "Failed to fetch data from the proxy server. Please check your proxy settings (and check the proxy server is running) and try again.";
            } else if (/401 Unauthorized/i.test(message)) {
                message =
                    "Failed to fetch data due to an invalid API key. Please check your TfNSW API key and try again.";
            }

            setIsTripsRefreshing(false);
            setLastApiError(message);
            console.error(e);
        } finally {
            scheduleTimeout(useSettings);
            setBurnInProtection(
                useSettings.burnInProtection
                    ? {
                          top: Math.random() * 10,
                          left: Math.random() * 10,
                      }
                    : { top: 0, left: 0 }
            );
        }
    };

    const scheduleTimeout = (useSettings: SettingsSet) => {
        window.clearTimeout(tripsTimeoutKey.current);
        tripsTimeoutKey.current = window.setTimeout(
            () => void getTrips(useSettings),
            boardInstance.durationSeconds * 1000
        );
    };

    return (
        <ThemeProvider theme={theme}>
            <Box sx={{ position: "relative", ...burnInProtection }}>
                <MainAppBar
                    openMenu={openMenu}
                    label={`${boardInstance.name}${getCurrentTripLabel()}`}
                    refreshTimer={
                        lastRefreshTime && (
                            <RefreshTimer
                                isRefreshing={isTripsRefreshing}
                                durationSeconds={boardInstance.durationSeconds}
                                key={lastRefreshTime}
                            />
                        )
                    }
                    theme={settings.theme}
                    toggleTheme={() =>
                        onUpdateSetting("theme", (currentTheme) =>
                            currentTheme === "dark" ? "light" : "dark"
                        )
                    }
                />
                <Routes>
                    <Route
                        path="settings/*"
                        element={
                            <SettingsScreen
                                menuOpen={true}
                                settings={settings}
                                onUpdate={onUpdateSetting}
                                onReset={onResetSettings}
                                onClose={() => {
                                    navigate({ pathname: "/" });
                                }}
                            />
                        }
                    />
                </Routes>

                <Main transparent={settings.mapsEnabled}>
                    {!SettingsManager.isConfiguredTrip(settings) && (
                        <CardMessage
                            title="Welcome"
                            body={
                                <>
                                    Welcome to TrainBoard! To get started, open the settings menu (
                                    <MenuIconStyled />) and configure your From and To stops.
                                </>
                            }
                        />
                    )}
                    {SettingsManager.isConfiguredTrip(settings) &&
                        hasInitialized &&
                        trips.length === 0 && (
                            <CardMessage
                                title="No trips"
                                body="No trips were found matching your from and to stops. Please try setting different stops."
                            />
                        )}
                    <Snackbar
                        anchorOrigin={{ vertical: "top", horizontal: "center" }}
                        open={!!lastApiError}
                        autoHideDuration={5000}
                    >
                        <Alert severity={"error"} elevation={6} variant={"filled"}>
                            {lastApiError}
                        </Alert>
                    </Snackbar>
                    {settings.mapsEnabled ? (
                        <Suspense fallback={<></>}>
                            <TrainMap
                                settings={settings}
                                trips={trips}
                                realtimeTripData={realtimeTripData}
                            />
                        </Suspense>
                    ) : null}
                    {!settings.mapsEnabled ? (
                        <TripBoardContainer className="main-wrap">
                            <TripBoard trips={trips} settings={settings} />
                        </TripBoardContainer>
                    ) : null}
                </Main>
            </Box>
        </ThemeProvider>
    );
}

const Main = styled("main")<{ transparent: boolean }>((props) => ({
    position: "relative",
    flexGrow: 1,
    backgroundColor: props.transparent ? "transparent" : "#222",
    alignItems: "center",
    justifyContent: "center",
}));
const MenuIconStyled = styled(MenuIcon)({
    verticalAlign: "middle",
    lineHeight: "initial",
});
const TripBoardContainer = styled("div")({
    width: "90%",
    margin: "auto",
});
