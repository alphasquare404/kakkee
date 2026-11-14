# Kakkee as a Suwayomi Custom WebUI

Kakkee can be served by Suwayomi itself through the server's **Custom Web UI** mode. No separate web host is required, and the API remains same-origin.

## Build

```bash
npm ci
npm run build:webui
```

The output is written to `dist/`.

`build:webui` enables custom-WebUI mode. In that mode the app:

- defaults the server URL to `window.location.origin`
- connects automatically when served by the Suwayomi server
- still falls back to the Connection form if the server cannot be reached

For a root deployment, `VITE_FRONTEND_BASE_PATH` stays `/`. For a server subpath, build with the matching base:

```bash
VITE_FRONTEND_BASE_PATH=/suwayomi/ npm run build:webui
```

## Install

1. In Suwayomi open **Settings → Server → Web interface** and set **Interface** to **Custom**.
2. Stop the server.
3. Copy the **contents** of `dist/` into the server's `webUI` directory.
   `index.html` must be directly inside `webUI`, not inside a nested folder.
4. Start the server and open its address.

## webUI directory

```text
Windows : C:\Users\<Account>\AppData\Local\Tachidesk\webUI
macOS   : /Users/<Account>/Library/Application Support/Tachidesk/webUI
Linux   : /home/<account>/.local/share/Tachidesk/webUI
Docker  : /home/suwayomi/.local/share/Tachidesk/webUI
```

For Docker, keep `webUI` inside the persistent data volume.

## Updates

The Custom interface is not updated by Suwayomi automatically. For each release:

1. Build a new `dist/`.
2. Stop the server.
3. Replace the contents of `webUI`.
4. Start the server.

## Authentication

- `NONE`: connects directly.
- `UI_LOGIN`: Kakkee shows the login form.
- `BASIC_AUTH` and `SIMPLE_LOGIN`: handled by the server/browser before the UI loads.

Use HTTPS for PWA installation and service-worker behavior.
