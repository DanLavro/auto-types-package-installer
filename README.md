# Auto Types Packages Installer

Auto Types Packages Installer is a command-line tool that simplifies the installation of npm packages and their corresponding type definitions.

https://github.com/DanLavro/auto-types-package-installer/assets/88592292/0cebc30d-85bf-4d00-bb50-611f1dba8355

## Installation

To use Auto Types Packages Installer, make sure you have [Node.js](https://nodejs.org) installed on your system. Then, follow these steps:

1. Clone the repository inside your project directory:

```bash
git clone https://github.com/your-username/auto-types-packages-installer.git
```

2. Add directory to .gitignore file or create one if it doesn't exist:

```bash
echo "auto-types-packages-installer/" >> .gitignore
```

3. Add the following script to your package.json file:

```json
"scripts": {
    "autoinstall": "node ./auto-types-packages-installer/dist/main.js"
}
```

## Usage

After completing the installation, you can use the Auto Types Packages Installer to easily install npm packages and their associated type definitions. Here's how it works:

1. Launch the Auto Types Packages Installer by running the following command:

```bash
npm run autoinstall
```

2. The installer will display a prompt: `auto-types-install >>`

3. Enter the command `npm install <package-name>` to install a package and its corresponding type definitions, you can use `i` instead of `install`. For example:

```bash
auto-types-install >> npm install lodash
```

4. The installer will automatically install the package and search for the appropriate type definitions. If found, it will install the type definitions as well.

5. The installer will display the installation status for both the package and the type definitions.
