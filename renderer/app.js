class FileOrganizer {
    constructor() {
        this.selectedFolder = null;
        this.isWatching = false;
        this.init();
    }

    init() {
        this.bindEvents();
        this.setupIPC();
    }

    bindEvents() {
        document.getElementById('selectFolderBtn').addEventListener('click', this.selectFolder.bind(this));
        document.getElementById('organizeBtn').addEventListener('click', this.organizeFiles.bind(this));
        document.getElementById('watchBtn').addEventListener('click', this.startWatching.bind(this));
        document.getElementById('stopWatchBtn').addEventListener('click', this.stopWatching.bind(this));
    }

    setupIPC() {
        window.electronAPI.onFileMoved((event, data) => {
            this.logActivity(`✅ Moved ${data.file} to ${data.category}`, 'success');
        });

        window.electronAPI.onFileError((event, data) => {
            this.logActivity(`❌ Error moving ${data.file}: ${data.error}`, 'error');
        });
    }

    async selectFolder() {
        try {
            const folderPath = await window.electronAPI.selectFolder();
            if (folderPath) {
                this.selectedFolder = folderPath;
                document.getElementById('selectedPath').textContent = folderPath;
                document.getElementById('controlsSection').classList.remove('hidden');
                
                await this.loadFilePreview();
                this.logActivity(`📁 Selected folder: ${folderPath}`, 'info');
            }
        } catch (error) {
            this.logActivity(`❌ Error selecting folder: ${error.message}`, 'error');
        }
    }

    async loadFilePreview() {
        try {
            const files = await window.electronAPI.getFiles(this.selectedFolder);
            const fileList = document.getElementById('fileList');
            const filePreview = document.getElementById('filePreview');
            
            if (files.length === 0) {
                fileList.innerHTML = '<p class="text-gray-500 col-span-full">No files found in this folder</p>';
            } else {
                fileList.innerHTML = files.map(file => `
                    <div class="p-3 border rounded-lg bg-gray-50">
                        <div class="font-medium truncate">${file.name}</div>
                        <div class="text-sm text-gray-500">${this.formatFileSize(file.size)}</div>
                        <div class="text-xs text-blue-600 mt-1">${file.category}</div>
                    </div>
                `).join('');
            }
            
            filePreview.classList.remove('hidden');
        } catch (error) {
            this.logActivity(`❌ Error loading files: ${error.message}`, 'error');
        }
    }

    async organizeFiles() {
        if (!this.selectedFolder) return;

        try {
            document.getElementById('organizeBtn').disabled = true;
            document.getElementById('organizeBtn').textContent = '⏳ Organizing...';

            const results = await window.electronAPI.organizeFiles(this.selectedFolder);
            
            results.moved.forEach(item => {
                this.logActivity(`✅ Moved ${item.file} to ${item.category}`, 'success');
            });

            results.errors.forEach(item => {
                this.logActivity(`❌ Error moving ${item.file}: ${item.error}`, 'error');
            });

            this.logActivity(`🎉 Organized ${results.moved.length} files with ${results.errors.length} errors`, 'info');
            
            await this.loadFilePreview();

        } catch (error) {
            this.logActivity(`❌ Error organizing files: ${error.message}`, 'error');
        } finally {
            document.getElementById('organizeBtn').disabled = false;
            document.getElementById('organizeBtn').textContent = '🗂️ Organize Now';
        }
    }

    async startWatching() {
        if (!this.selectedFolder) return;

        try {
            await window.electronAPI.startWatching(this.selectedFolder);
            this.isWatching = true;
            
            document.getElementById('watchBtn').classList.add('hidden');
            document.getElementById('stopWatchBtn').classList.remove('hidden');
            
            this.logActivity('👀 Started watching folder for new files', 'info');
        } catch (error) {
            this.logActivity(`❌ Error starting watcher: ${error.message}`, 'error');
        }
    }

    async stopWatching() {
        try {
            await window.electronAPI.stopWatching();
            this.isWatching = false;
            
            document.getElementById('watchBtn').classList.remove('hidden');
            document.getElementById('stopWatchBtn').classList.add('hidden');
            
            this.logActivity('⏹️ Stopped watching folder', 'info');
        } catch (error) {
            this.logActivity(`❌ Error stopping watcher: ${error.message}`, 'error');
        }
    }

    logActivity(message, type = 'info') {
        const logContent = document.getElementById('logContent');
        const timestamp = new Date().toLocaleTimeString();
        
        const colors = {
            info: 'text-blue-600',
            success: 'text-green-600',
            error: 'text-red-600'
        };

        const logEntry = document.createElement('div');
        logEntry.className = `text-sm ${colors[type]}`;
        logEntry.innerHTML = `<span class="text-gray-400">[${timestamp}]</span> ${message}`;
        
        if (logContent.firstChild && logContent.firstChild.textContent.includes('No activity yet')) {
            logContent.innerHTML = '';
        }
        
        logContent.insertBefore(logEntry, logContent.firstChild);
        
        while (logContent.children.length > 50) {
            logContent.removeChild(logContent.lastChild);
        }
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}

new FileOrganizer();
