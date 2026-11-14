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

### Install without flattening directories

The release archive contains `assets/` and `icons/`. Never extract it with `unzip -j` or any tool that strips directory names. The included installer handles extraction, validation, backup, and ownership:

```bash
sudo bash scripts/install-custom-webui.sh kakkee-webui.tar.gz
```

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

## Troubleshooting: white screen

A white screen after installing usually means `index.html` was copied but the asset directories were not. Missing files are often answered by the SPA fallback with `index.html` and status `200`, so the Network tab may look “successful” even though the JavaScript was never loaded.

Check from a shell on the server:

```bash
cd /DATA/AppData/suwayomi-server/files/webUI
ls -l index.html manifest.webmanifest sw.js
ls -l assets/ icons/
find . -maxdepth 1 -type d
```

`assets/`, `icons/`, and all files referenced by `index.html` must exist directly under `webUI`.

Check the deployed asset over HTTP:

```bash
curl -I https://your-server/assets/index-*.js
```

It must return JavaScript, not `text/html`. If it returns the `index.html` body, the file is missing or the server is looking at a different `webUI` directory.

Fix by extracting the archive over the directory, then restarting the server:

```bash
unzip -o kakkee-webui.zip -d /DATA/AppData/suwayomi-server/files/webUI
chown -R 1000:1000 /DATA/AppData/suwayomi-server/files/webUI
```

Do not extract into a nested `kakkee-webui/` or `dist/` directory.

### Assets still return `index.html` after fixing the folder

An OpenResty/Nginx cache can keep the old fallback response per asset URL. Test with a cache-busting query:

```bash
curl -sI 'https://your-server/assets/index-*.js?cachebust=1' | grep -i content-type
```

If that returns JavaScript but the URL without the query returns HTML, the files are correct and only the proxy cache is stale. Restart the Suwayomi service and the OpenResty/Nginx gateway, or purge the cached fallback response. Then clear the browser service worker/site data and hard reload.

