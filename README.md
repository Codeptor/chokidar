# Chokidar File Organizer

An Electron desktop application that helps you organize and monitor files automatically based on their types.

## Features

- **File Organization**: Automatically sort files into appropriate folders based on their type (images, videos, documents, audio, etc.)
- **Real-time Monitoring**: Watch folders for new files and organize them automatically as they appear
- **User-friendly Interface**: Clean and intuitive interface built with Tailwind CSS
- **File Preview**: Browse and preview files before organizing them
- **Activity Logging**: Track all file operations in real-time

## Screenshots

(Screenshots will be added here)

## Installation

### Prerequisites
- Node.js (v14.x or later)
- pnpm package manager

### Setup
1. Clone the repository:
   ```
   git clone https://github.com/yourusername/chokidar.git
   cd chokidar
   ```

2. Install dependencies:
   ```
   pnpm install
   ```

## Usage

### Development Mode
Run the application in development mode:
```
pnpm start
```

### Build for Production
Create a production build:
```
pnpm build
```

Note: Building on Windows might require administrator privileges due to symbolic link creation.

## How It Works

1. Select a folder using the "Select Folder" button
2. Use "Organize Now" to sort files into categories
3. Enable "Start Watching" to automatically organize new files as they appear
4. Monitor the activity log to track operations

## File Categories

The application organizes files into the following categories:

- **Images**: jpg, jpeg, png, gif, bmp, svg, etc.
- **Videos**: mp4, avi, mkv, mov, webm, etc.
- **Documents**: pdf, doc, docx, txt, xls, ppt, etc.
- **Audio**: mp3, wav, flac, aac, etc.
- **Archives**: zip, rar, 7z, tar, etc.
- **Code**: js, py, java, cpp, html, css, etc.
- **Data**: json, xml, csv, sql, etc.
- **Others**: Any file type not matching the above categories

## Technologies Used

- [Electron](https://www.electronjs.org/) - Cross-platform desktop framework
- [Chokidar](https://www.npmjs.com/package/chokidar) - File watcher library
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework

## Project Structure

```
├── main.js           # Electron main process
├── preload.js        # Preload script for secure IPC
├── package.json      # Project configuration
├── assets/           # Application assets
└── renderer/         # Frontend files
    ├── index.html    # Main HTML page
    └── app.js        # Frontend JavaScript
```

## License

ISC

## Contributing

Contributions are welcome! Feel free to submit a pull request.
