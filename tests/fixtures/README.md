# Theme reference

`theme-reference.css` is the exact theme-token stylesheet from pre-migration commit `e4eb519`, path `website/theme-tokens.css`. It is a test oracle, not a second runtime stylesheet. Browser checks render this fixed reference and the current site in the same browser, comparing computed colours and gradients at all eight presets and representative adjustment settings. Changes to this fixture require an intentional, reviewed theme change; do not regenerate it from current application CSS.
