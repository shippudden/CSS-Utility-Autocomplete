# CSS Utility Autocomplete

A powerful Visual Studio Code extension that provides intelligent autocomplete suggestions for CSS utility classes across multiple languages and frameworks.

## Features

- 🚀 Intelligent autocomplete for CSS utility classes
- 🔄 Support for both Tailwind CSS and Bootstrap
- 🌐 Multi-language support:
  - HTML
  - JavaScript
  - TypeScript
  - React (JSX/TSX)
- 📝 Context-aware suggestions based on HTML elements
- 🔍 Hover information for class descriptions
- ⚡ Real-time fetching of latest framework classes
- ⚙️ Customizable with your own classes
- 🎯 Framework switcher in status bar

## Installation

1. Open Visual Studio Code
2. Go to the Extensions view (Ctrl+Shift+X or Cmd+Shift+X on Mac)
3. Search for "CSS Utility Autocomplete"
4. Click Install

## Usage

The extension works automatically in supported file types. Here are some examples:

- HTML: `<div class="">`
- React: `<div className="">`
- JavaScript/TypeScript: `const styles = `\${classes}``

Autocomplete suggestions will appear automatically when you start typing inside the quotes.

### Switching Frameworks

1. Look for the "CSS Framework" item in the status bar (bottom-right corner)
2. Click on it to switch between Tailwind CSS and Bootstrap
   
Alternatively:
1. Open the Command Palette (Ctrl+Shift+P or Cmd+Shift+P on Mac)
2. Type "Set CSS Framework" and select it
3. Choose between Tailwind and Bootstrap

### Custom Classes

You can add your own custom classes:

1. Open VS Code settings (File > Preferences > Settings)
2. Search for "CSS Utility Autocomplete"
3. Find "Css Utility Autocomplete: Custom Classes"
4. Add your custom classes to the array

## Features in Detail

### Context-Aware Suggestions

The extension provides different suggestions based on the HTML element you're working with:

- `<div>`: Layout-related classes
- `<button>`: Button-specific classes
- `<input>`: Form control classes
- And more...

### Real-Time Framework Updates

The extension automatically fetches the latest classes from:
- Tailwind CSS documentation
- Bootstrap documentation

This ensures you always have the most up-to-date class suggestions.

### Performance Optimization

- Debounced suggestions to prevent performance issues
- Cached framework classes to reduce API calls
- Efficient class filtering and sorting

## Configuration

You can configure the extension in your VS Code settings:

- `cssUtilityAutocomplete.customClasses`: An array of custom CSS classes to include in autocomplete suggestions

## Known Issues

- Autocomplete may not trigger in some specific scenarios in non-HTML files
- Hover information is currently only available for HTML files

We're actively working on resolving these issues. Your feedback and contributions are welcome!

## Contributing

If you'd like to contribute to the development of this extension, please feel free to submit issues or pull requests on our GitHub repository.

## License

This extension is licensed under the MIT License.
