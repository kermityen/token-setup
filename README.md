# token-setup

A Figma plugin to scaffold your color token Variable collection in seconds.
No blank slate. No naming guesswork.

## What it does

token-setup gives you a Carbon-inspired semantic token structure out of the box.
Select the groups you need, configure levels and states,
and sync directly into your Figma Variable collection with one click.

## Install

Search **token-setup** in the Figma Community, or install directly:
[figma.com/community/plugin/1615009680241482416](https://www.figma.com/community/plugin/1615009680241482416)

## How to use

1. Open the plugin in any Figma file
2. Select token groups (or click **CORE** for a sensible default)
3. Configure levels, states, and modes as needed
4. Click **Sync to Figma** — your Variable collection is ready

## Token groups

| Group | Type | Description |
|---|---|---|
| background | bg | Page-level background |
| surface | layered | Container / card backgrounds |
| surface-accent | bg | Decorative fills (tags, badges) |
| text | text | Text colors |
| link | link | Link colors and states |
| icon | icon | Icon colors |
| button | button | Button backgrounds and states |
| field | layered | Form input backgrounds |
| border | layered | Border colors |
| divider | bg | Separator lines |
| shadow | shadow | Shadow colors |
| overlay | bg | Modal / drawer overlays |
| skeleton | skeleton | Loading skeleton colors |
| interactive | layered | Shared interactive state color |
| support | support | Error, success, warning, info |
| focus | focus | Focus ring colors |
| gradient | gradient | Gradient stop colors |

## Naming convention

Naming conventions inspired by [Carbon Design System](https://carbondesignsystem.com/).

Tokens follow the pattern `group/level-state`, e.g.:
- `surface/01`
- `surface/01-hover`
- `surface/01-pressed`
- `background/01`
- `background/inverse`

All tokens are initialized with `#FFFFFF` as placeholder.
Fill in your brand colors after syncing.

## Feedback

Found a bug or have a suggestion?
[Open an issue on GitHub](https://github.com/kermityen/token-setup/issues)

## License

MIT
