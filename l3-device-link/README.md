# L3 Device Link

A responsive, cross-platform starter interface for a device-linking platform.

## Current status

This first milestone includes:
- Responsive dashboard and navigation
- Device-pairing dialog with a **demo-only** locally generated code
- Local file selection and drag-and-drop staging (files are not uploaded or transferred)
- Browser screen-capture capability check
- Feature placeholders and a privacy-first remote-control plan
- PWA web app manifest

**Important:** This is an interface prototype, not a functioning device-linking service. It does not pair devices, send files, stream screens to another device, or remotely control devices yet. The demo pairing code is not authentication.

## Run locally

No build tools or dependencies are required.

1. Open this folder in GitHub Codespaces.
2. In the terminal run:

   ```bash
   python3 -m http.server 8000
   ```

3. In Codespaces, open the forwarded port 8000.
4. The dashboard should appear in the browser.

For screen-capture APIs, use the forwarded HTTPS URL or `localhost`.

## Planned milestones

1. **Real pairing:** backend signaling, short-lived one-time pairing tokens, QR codes, device approval and revocation.
2. **File transfer:** WebRTC data channels, transfer progress, size limits, cancellation and integrity checks.
3. **Screen sharing:** WebRTC media streaming with explicit consent and visible stop controls.
4. **Remote assistance:** narrowly scoped, OS-supported actions with explicit approval on the controlled device. iOS and browser limitations may require native companion apps.
5. **Hardening:** authentication, rate limiting, abuse prevention, encryption, privacy controls and security testing.

## Security principles

- Never trust a pairing code by itself; validate it server-side and expire it quickly.
- Require approval on both devices.
- Do not expose remote-control endpoints without authentication and authorization.
- Make active sessions visible and easy to stop.
- Avoid storing transferred file contents on the signaling server.
