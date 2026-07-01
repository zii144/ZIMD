# macOS code signing & notarization

The release workflow (`.github/workflows/release.yml`) will sign and notarize
the macOS build automatically **once these six repository secrets are set**.
Until then, builds are produced unsigned.

> Security: add every value through GitHub's **Settings → Secrets and variables
> → Actions → New repository secret**. Never paste secrets into chat, commit
> them, or share the `.p12`/passwords with anyone.

## Prerequisites

- An **Apple Developer Program** membership ($99/yr).
- Xcode command line tools (`xcode-select --install`).

## 1. Create a Developer ID Application certificate

1. In Xcode: **Settings → Accounts → [your team] → Manage Certificates → +
   → Developer ID Application**. (Or create it in the Apple Developer portal.)
2. In **Keychain Access**, find the new "Developer ID Application: …"
   certificate, right-click → **Export**, save as `cert.p12`, and set an
   export password (you'll reuse it below).

## 2. Turn the certificate into secrets

Run on your Mac:

```bash
# base64 of the .p12 -> APPLE_CERTIFICATE
base64 -i cert.p12 | pbcopy   # now paste into the GitHub secret
```

| Secret name                  | Value                                                            |
| ---------------------------- | ---------------------------------------------------------------- |
| `APPLE_CERTIFICATE`          | base64 of `cert.p12` (command above)                             |
| `APPLE_CERTIFICATE_PASSWORD` | the export password you set in step 1                            |
| `APPLE_SIGNING_IDENTITY`     | `Developer ID Application: Your Name (TEAMID)`                   |
| `APPLE_ID`                   | your Apple ID email                                              |
| `APPLE_PASSWORD`             | an **app-specific password** (see below)                        |
| `APPLE_TEAM_ID`              | your 10-character Team ID                                        |

- **`APPLE_SIGNING_IDENTITY`** — the exact certificate name. Find it with:
  ```bash
  security find-identity -v -p codesigning
  ```
- **`APPLE_PASSWORD`** — create at
  [appleid.apple.com](https://appleid.apple.com) → **Sign-In and Security →
  App-Specific Passwords**. (Do **not** use your real Apple ID password.)
- **`APPLE_TEAM_ID`** — shown in the Apple Developer portal (Membership) and in
  the identity string above.

## 3. Tag a release

```bash
git tag v0.1.0
git push origin v0.1.0
```

The workflow signs the `.app`, staples the notarization ticket, and uploads a
notarized `.dmg` to a draft release. First launch on another Mac will open
without Gatekeeper warnings.

## Verifying locally (optional)

```bash
spctl -a -vvv --type install "ZIMD.app"   # should say: accepted, source=Notarized Developer ID
codesign -dv --verbose=4 "ZIMD.app"
```

## Windows (later)

Windows signing is not wired up yet. It needs a code-signing certificate
(OV/EV) and either Tauri's `bundle.windows.certificateThumbprint` or a signing
secret. Track this as a follow-up when you have a Windows certificate.
