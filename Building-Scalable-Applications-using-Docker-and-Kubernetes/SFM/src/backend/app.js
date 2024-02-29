const express = require('express');
const fs = require('fs');
const path = require('path');
const open = require('open');
const fsExtra = require('fs-extra');
const app = express();

const port = 3000;

// Serve static files (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, '..', 'frontend', 'view')));

app.use(express.json());

// Route for default directory
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'main.html'));
});

// Route for reading folder details
app.get('/read-folder', (req, res) => {
    const currentDir = req.query.path || "C:\\";

    fs.readdir(currentDir, { withFileTypes: true }, (err, files) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        let folders = [];
        let filesList = [];

        files.forEach(file => {
            if (file.isDirectory()) {
                folders.push(file.name);
            } else {
                filesList.push(file.name);
            }
        });

        res.json({ folders: folders, files: filesList });
    });
    console.log(`args: ${currentDir.replace(/\\/g, '/')}`);
});

app.post('/create-folder', (req, res) => {
    const folderPath = req.body.path;

    if (!folderPath || folderPath.trim() === '') {
        console.error('Invalid folder path provided.');
        return res.status(400).send('Invalid folder path provided.');
    }

    fs.stat(folderPath, (statErr, stats) => {
        // Check if the error is because the path does not exist
        if (statErr && statErr.code === 'ENOENT') {
            // Path does not exist, create the folder
            fs.mkdir(folderPath, { recursive: true }, (mkdirErr) => {
                if (mkdirErr) {
                    console.error('Error creating folder:', mkdirErr.message);
                    return res.status(500).send('Error creating folder');
                }
                console.log('Folder created successfully');
                res.send('Folder created successfully');
            });
        } else if (!statErr) {
            console.error('A folder with the same name already exists!');
            return res.status(400).send('A folder with the same name already exists!');
        } else {
            // Some other error occurred
            console.error('Error accessing path:', statErr.message);
            return res.status(500).send('Error accessing path');
        }
    });
});

app.post('/delete-item', (req, res) => {
    const itemPath = req.body.path;

     // Check if the file or folder exists
     fs.stat(itemPath, (statErr, stats) => {
        if (statErr && statErr.code === 'ENOENT') {
            // Item does not exist, send an error response
            console.log('The file or folder does not exist.');
            return res.status(400).send('The file or folder does not exist.');
        } else if (statErr) {
            // Some other error occurred
            console.error('Error accessing item:', statErr.message);
            return res.status(500).send('Error accessing item');
        }

        // Proceed to delete the item
        fs.rm(itemPath, { recursive: true, force: true }, (rmErr) => {
            if (rmErr) {
                console.error('Error deleting item:', rmErr.message);
                return res.status(500).send('Error deleting item');
            }
            console.log('Item deleted successfully');
            res.send('Item deleted successfully');
        });
    });
});

app.post('/move-item', async (req, res) => {
    const { fromPath, toPath } = req.body;
    try {
        // Check if the paths are valid
        if (!fromPath || !toPath) {
            throw new Error('Invalid paths provided');
        }

        // Check if the source item exists
        const exists = await fsExtra.pathExists(fromPath);
        if (!exists) {
            throw new Error('Source item does not exist');
        }

        // Perform the move operation
        await fsExtra.move(fromPath, toPath);
        console.log('Item moved successfully to ' + toPath);
        res.send('Item moved successfully');
    } catch (err) {
        console.error('Error moving item:', err.message);
        res.status(500).send('Error moving item: ' + err.message);
    }
});

app.post('/rename-item', (req, res) => {
    const { oldPath, newPath } = req.body;

    // Check if the original file or folder exists
    fs.stat(oldPath, (statErr, stats) => {
        if (statErr && statErr.code === 'ENOENT') {
            console.log('The original file or folder does not exist.');
            return res.status(400).send('The original file or folder does not exist.');
        } else if (statErr) {
            console.error('Error accessing item:', statErr.message);
            return res.status(500).send('Error accessing item');
        }

        // Proceed to rename the item
        fs.rename(oldPath, newPath, (renameErr) => {
            if (renameErr) {
                console.error('Error renaming item:', renameErr.message);
                return res.status(500).send('Error renaming item');
            }
            console.log('Item renamed successfully');
            res.send('Item renamed successfully');
        });
    });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  open(`http://localhost:${port}`);
});