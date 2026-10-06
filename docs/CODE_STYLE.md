# Code Style Requirements

- The cleaner and more minimal the code the better, while faithfully implementing required behaviour and features.
- Minimizing code, while maintaining feature and functionality requirements is the goal, but not at the expense of code readability.
- Favour solutions that result in modular, reusable code - without over-generalizing solutions. If a modular, reusable approach would result in less code, use it. If a modular, reusable approach would result in more readable and maintainable code, use it.
- Extra time and effort put into sound and maintainable implementation decisions now, is multiples of that time saved later by avoiding rewrites and sifting through hastily made slop ('more haste, less speed').
- Comment code according to the [comments policy](CODE_COMMENTS.md).
- For key architectural decisions, stop and discuss first, presenting your top options and some pros and cons of each.

When fixing bugs, adding or changing features, or refactoring, ask: "How can I simplify the code? How can I make it more maintainable? Are there opportunities to reduce the number of lines of code here?"

## Testing

- Apply the same discernment, attention to detail and clarity to the test plan and test cases as you should to feature implementation and architecture.
- Respect the value of velocity. Expensive tests should only be run when needed. Separate test sets by the types of files that have been updated and their roles.
- Test run decisions should be rule based and deterministic where possible.
- Visual testing, or other high token burn testing should be run on a batch of code edits where possible and during rapid iteration allow the human to review visually as this is most often quicker than an agent check - saving time and tokens.
