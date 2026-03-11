# TrainBoard

Welcome to the TrainBoard repo.

## Getting started

You will need a TfNSW API key to be able to query train data from the API. You can obtain one for free at the [OpenData Transport NSW site](https://opendata.transport.nsw.gov.au/). You can then enter this key in the app settings once it's up and running.

It will need access to the following APIs:

- `Trip Planner APIs` - required
    - To show the list of departing trips
- `Public Transport - Realtime Vehicle Positions` - optional
    - To show vehicle positions with Google Maps

Because the TfNSW API doesn't support CORS requests, we need to use a proxy server.

You can either use a local proxy server, or a CloudFlare worker. See the proxy folder for more details.

## Run locally

1. Install dependencies:
    ```bash
    npm install
    ```
2. Start the development server:
    ```bash
    npm start
    ```
3. Open the app in your browser (Vite default):
    ```
    http://localhost:5173
    ```
4. Configure your proxy/API key in the app settings so API requests can succeed.

## Other useful commands

- Build production assets:
    ```bash
    npm run build
    ```
- Preview the production build locally:
    ```bash
    npm run serve
    ```
- Run linting and type checks:
    ```bash
    npm run lint
    ```
