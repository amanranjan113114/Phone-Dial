# Dial — Simple Caller (PWA)

A minimal HTML/CSS/JavaScript dial pad for Android browsers and installable PWAs.

## Features
- Interactive 0–9, `*`, and `#` keypad
- Editable phone-number field, clear, and backspace
- Call button opens the device's configured phone app with a `tel:` URL
- Recent dial attempts saved locally in browser `localStorage`
- Re-dial from history and clear history
- PWA manifest and service worker for install/offline app shell
- Responsive, accessible, clean UI

## Run locally

PWA features require HTTPS or localhost. Do not open `index.html` as a `file://` URL.

### Option A: Python
From this folder, run:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000` on your computer.

### Option B: VS Code
Install the Live Server extension, right-click `index.html`, and choose **Open with Live Server**.

## Test on an Android phone
1. Host the folder on an HTTPS static host (for example, GitHub Pages or another HTTPS web host).
2. Open the HTTPS URL in Chrome on Android.
3. Enter a test number and tap the green call button.
4. Android should open its phone app or a configured calling handler. Confirm the call in the native app.
5. To install, use Chrome's menu and select **Install app** or **Add to Home screen**. The exact label varies by browser/version.

## Deploy to GitHub Pages
1. Create a GitHub repository.
2. Upload all files from this folder to the repository root.
3. In **Settings → Pages**, select the branch and root folder as the deployment source.
4. Wait for the published HTTPS URL, then open it on Android.

## Important behavior and privacy
- This website does not place a cellular call itself. `tel:` hands the number to the device's calling app; the user confirms the call.
- Browser/desktop behavior varies, and the site cannot force a SIM selection, bypass device confirmation, or know whether the call connected.
- Recent numbers are stored only in this browser profile on this device. They are not uploaded to a server. Clearing site data/browser storage may remove them.
- History records a **dial attempt**, not a verified completed call.
- `localStorage` is not encrypted. Avoid using this on a shared device if the saved numbers are private.
- The app shell can load offline after the first successful visit, but calling still requires the device's supported phone handler and cellular service.
