const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs').promises;
const fsSync = require('fs');
const chokidar = require('chokidar');

let mainWindow;
let watcher;

const fileExtensions = {
  images: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'tiff', 'webp', 'ico', 'psd', 'raw', 'heif', 'heic'],
  videos: ['mkv', 'webm', 'mpg', 'mp2', 'mpeg', 'mp4', 'm4v', 'avi', 'wmv', 'mov', 'qt', 'flv'],
  documents: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'rtf', 'odt', 'epub'],
  audio: ['mp3', 'wav', 'flac', 'aac', 'ogg', 'wma', 'mid', 'midi'],
  archives: ['zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'xz'],
  code: ['js', 'jsx', 'ts', 'tsx', 'py', 'java', 'cpp', 'c', 'html', 'css', 'php', 'rb', 'go', 'rs'],
  data: ['json', 'xml', 'csv', 'sql', 'db', 'yaml', 'yml']
};

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, 'assets/icon.png'),
    titleBarStyle: 'default',
    autoHideMenuBar: true
  });

  mainWindow.loadFile('renderer/index.html');
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (watcher) watcher.close();
  if (process.platform !== 'darwin') app.quit();
});

ipcMain.handle('select-folder', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory']
  });
  return result.filePaths[0];
});

ipcMain.handle('get-files', async (event, folderPath) => {
  try {
    const files = await fs.readdir(folderPath);
    const fileDetails = [];
    
    for (const file of files) {
      const filePath = path.join(folderPath, file);
      const stats = await fs.stat(filePath);
      
      if (stats.isFile()) {
        fileDetails.push({
          name: file,
          path: filePath,
          size: stats.size,
          modified: stats.mtime,
          category: getFileCategory(file)
        });
      }
    }
    
    return fileDetails;
  } catch (error) {
    throw new Error(`Failed to read directory: ${error.message}`);
  }
});

ipcMain.handle('organize-files', async (event, folderPath) => {
  try {
    const results = { moved: [], errors: [] };
    
    for (const category of Object.keys(fileExtensions)) {
      const categoryPath = path.join(folderPath, category.charAt(0).toUpperCase() + category.slice(1));
      if (!fsSync.existsSync(categoryPath)) {
        await fs.mkdir(categoryPath, { recursive: true });
      }
    }
    
    const othersPath = path.join(folderPath, 'Others');
    if (!fsSync.existsSync(othersPath)) {
      await fs.mkdir(othersPath, { recursive: true });
    }
    
    const files = await fs.readdir(folderPath);
    
    for (const file of files) {
      const filePath = path.join(folderPath, file);
      const stats = await fs.stat(filePath);
      
      if (stats.isFile()) {
        try {
          const category = getFileCategory(file);
          const targetFolder = category === 'others' ? 'Others' : 
                              category.charAt(0).toUpperCase() + category.slice(1);
          const targetPath = path.join(folderPath, targetFolder, file);
          
          await fs.rename(filePath, targetPath);
          results.moved.push({ file, category: targetFolder });
        } catch (error) {
          results.errors.push({ file, error: error.message });
        }
      }
    }
    
    return results;
  } catch (error) {
    throw new Error(`Failed to organize files: ${error.message}`);
  }
});

ipcMain.handle('start-watching', async (event, folderPath) => {
  if (watcher) watcher.close();
  
  watcher = chokidar.watch(folderPath, { 
    ignored: /^\./, 
    persistent: true,
    ignoreInitial: true
  });
  
  watcher.on('add', async (filePath) => {
    const fileName = path.basename(filePath);
    const category = getFileCategory(fileName);
    
    try {
      const targetFolder = category === 'others' ? 'Others' : 
                          category.charAt(0).toUpperCase() + category.slice(1);
      const targetDir = path.join(path.dirname(filePath), targetFolder);
      
      if (!fsSync.existsSync(targetDir)) {
        await fs.mkdir(targetDir, { recursive: true });
      }
      
      const targetPath = path.join(targetDir, fileName);
      await fs.rename(filePath, targetPath);
      
      mainWindow.webContents.send('file-moved', { 
        file: fileName, 
        category: targetFolder 
      });
    } catch (error) {
      mainWindow.webContents.send('file-error', { 
        file: fileName, 
        error: error.message 
      });
    }
  });
  
  return true;
});

ipcMain.handle('stop-watching', async () => {
  if (watcher) {
    watcher.close();
    watcher = null;
  }
  return true;
});

function getFileCategory(fileName) {
  const ext = path.extname(fileName).toLowerCase().slice(1);
  
  for (const [category, extensions] of Object.entries(fileExtensions)) {
    if (extensions.includes(ext)) {
      return category;
    }
  }
  
  return 'others';
}
