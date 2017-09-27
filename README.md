# vscodemod – Run codemod on selected code

VSCode Extension for doing JavaScript code modifications (AST to AST transformations) in VSCode using [jscodeshift](https://github.com/facebook/jscodeshift).

Currently work in progress, and only has one codemod installed: Converting from functions to arrow functions.
This was originally started as a way to toggle between the two (arrow functions and normal functions).

## Usage

![vscodemod](./assets/vscodemod.gif)


## Roadmap

- Support for custom codemods (reading from dir)
- More codemods.
- Dry-run preview?
- Integration with prettier if format on save?
- Smarter meny selection based on AST of selected code?
