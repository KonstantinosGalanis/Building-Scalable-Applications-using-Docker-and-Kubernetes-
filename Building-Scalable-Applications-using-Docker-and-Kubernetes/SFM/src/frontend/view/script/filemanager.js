// DOM Elements
const foldersSection = document.getElementById('folder-section');
const readFolderBtn = document.getElementById('read-folder-btn');
const folderPathTxt = document.getElementById('folder-location-txt');
const backBtn = document.getElementById('back-btn');
const upBtn = document.getElementById('up-btn');
const crtBtn = document.getElementById('crt-btn');
const dltBtn = document.getElementById('dlt-btn');
const mvBtn = document.getElementById('mv-btn');
const rnmBtn = document.getElementById('rnm-btn');
const downloadButton = document.getElementById('dnl-btn');

// Data
let currentDir = 'C:/';
let previousDir = [];

const clearFoldersSection = () => {
    while (foldersSection.firstChild) {
        foldersSection.removeChild(foldersSection.firstChild);
    }
};

const fetchFolderDetails = (folderPath) => {
    fetch(`/read-folder?path=${encodeURIComponent(folderPath)}`)
        .then(response => response.json())
        .then(data => {
            updateUIWithFolderDetails(data);
        })
        .catch(error => {
            console.error('Error fetching folder details:', error);
        });
};

const updateUIWithFolderDetails = (res) => {
    clearFoldersSection();

    // List Folders
    res.folders.forEach(folder => {
        const folderElement = document.createElement('a');
        const folderIcon = document.createElement('span');
        const folderName = document.createElement('span');
        
        folderName.innerText = ' ' + folder;
        folderIcon.innerText = '📁';
        
        folderElement.appendChild(folderIcon);
        folderElement.appendChild(folderName);
        folderElement.setAttribute('href', '#');
        folderElement.setAttribute('class', 'collection-item folder-item folder');
        
        folderElement.addEventListener('click', (e) => {
            e.preventDefault();
            previousDir.push(currentDir);
            currentDir = currentDir === 'C:/' ? `C:/${folder}` : `${currentDir}/${folder}`;
            folderPathTxt.value = currentDir;
            fetchFolderDetails(currentDir);
        });       

        foldersSection.appendChild(folderElement);
    });

    // List Files
    res.files.forEach(file => {
        const fileElement = document.createElement('a');
        const fileIcon = document.createElement('span');
        const fileName = document.createElement('span');
        
        fileName.innerText = ' ' + file;
        fileIcon.innerText = '🗄️';
        
        fileElement.appendChild(fileIcon);
        fileElement.appendChild(fileName);
        fileElement.setAttribute('href', '#');
        fileElement.setAttribute('class', 'collection-item folder-item file');
        
        fileElement.addEventListener('click', (e) => {
            e.preventDefault();
            // Here you would handle the file opening
            console.log(`Opening file: ${file.trim()}`);
        });

        foldersSection.appendChild(fileElement);
    });
};


readFolderBtn.addEventListener('click', () => {
    console.log(folderPathTxt.value)
    clearFoldersSection()
    fetchFolderDetails(folderPathTxt.value);
    // TODO: add reload animation
    // TODO: add validator for same current and previous folder 
    //       If the same don't overwrite previousDir with currentDir
});

backBtn.addEventListener('click', () => {
    if (previousDir.length == 0) return;

    currentDir = previousDir.pop();
    folderPathTxt.value = currentDir;
    fetchFolderDetails(currentDir);
});

upBtn.addEventListener('click', () => {
    if (currentDir.toLowerCase() === 'c:/') return;

    previousDir.push(currentDir);
    const dirComponents = currentDir.split('/');

    dirComponents.pop();
    if(dirComponents.length > 1)
        currentDir = dirComponents.join('/');
    else
        currentDir = dirComponents + '/';
    folderPathTxt.value = currentDir;
    fetchFolderDetails(currentDir);
    
});

const createFolder = (folderName) => {
    const fullPath = `${currentDir}/${folderName}`;
    
    fetch(`/create-folder`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ path: fullPath })
    })
    .then(response => {
        if (response.ok) {
            fetchFolderDetails(currentDir); // Fetch updated folder details
        } else {
            response.text().then(text => {
                console.error('Error creating folder:', text);
                alert(text); // Display the error message to the user
            });
        }
    })
    .catch(error => {
        console.error('Error creating folder:', error);
        alert('Error creating folder: ' + error.message); // Display the error message to the user
    });
};

crtBtn.addEventListener('click', () => {
    const newFolderName = prompt("Enter new folder name:");
    if (newFolderName && newFolderName.trim() !== '') {
        createFolder(newFolderName);
    }
    else {
        alert("Please enter a valid name.");
    }
});

const deleteItem = (itemName) => {
    const fullPath = `${currentDir}/${itemName}`;
    fetch(`/delete-item`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ path: fullPath })
    })
    .then(response => {
        if (response.ok) {
            fetchFolderDetails(currentDir); // Refresh the folder view
        } else {
            response.text().then(text => {
                console.error('Error deleting item:', text);
                alert(text); // Display the error message to the user
            });
        }
    })
    .catch(error => {
        console.error('Error deleting item:', error);
        alert('Error deleting item: ' + error.message); // Display the error message to the user
    });
};

dltBtn.addEventListener('click', () => {
    const itemToDelete = prompt("Enter the name of the item to delete:");
    if (itemToDelete && itemToDelete.trim() !== '') {
        deleteItem(itemToDelete.trim());
    } else {
        alert("Please enter a valid name.");
    }
});

const moveItem = (itemName, newPath) => {
    const fullPath = `${currentDir}/${itemName}`;
    fetch(`/move-item`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fromPath: fullPath, toPath: newPath })
    })
    .then(response => {
        if (response.ok) {
            fetchFolderDetails(currentDir);
        } else {
            response.text().then(text => {
                console.error('Error moving item');
                alert(text); // Display the error message to the user
            });
 
        }
    })
    .catch(error => {
        console.error('Error moving item:', error);
        alert('Error moving item: ' + error.message); // Display the error message to the user
    });
};

mvBtn.addEventListener('click', () => {
    const itemToMove = prompt("Enter the name of the item to move:");
    const moveToPath = prompt("Enter the new path for the item:");

    if (itemToMove && moveToPath) {
        moveItem(itemToMove, moveToPath);
    } 
    else if (!itemToMove && moveToPath){
        alert("Please enter a valid name for the item to move.");
    }
    else if (itemToMove && !moveToPath){
        alert("Please enter a valid name for the new path.");
    }
    else if (!itemToMove && !moveToPath){
        alert("Please enter a valid name for both.");
    }
});

const renameItem = (oldName, newName) => {
    const oldPath = `${currentDir}/${oldName}`;
    const newPath = `${currentDir}/${newName}`;

    fetch(`/rename-item`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ oldPath, newPath })
    })
    .then(response => {
        if (response.ok) {
            fetchFolderDetails(currentDir); // Refresh the folder view
        } else {
            response.text().then(text => {
                console.error('Error renaming item:', text);
                alert(text);
            });
        }
    })
    .catch(error => {
        console.error('Error renaming item:', error);
        alert('Error renaming item: ' + error.message);
    });
};

rnmBtn.addEventListener('click', () => {
    const oldItemName = prompt("Enter the name of the item to rename:");
    const newItemName = prompt("Enter the new name for the item:");

    if (oldItemName && newItemName && oldItemName.trim() !== '' && newItemName.trim() !== '') {
        renameItem(oldItemName.trim(), newItemName.trim());
    } else if (!oldItemName && newItemName){
        alert("Please enter a valid name for the item to rename.");
    }
    else if (oldItemName && !newItemName){
        alert("Please enter a valid new name.");
    }
    else if (!oldItemName && !newItemName){
        alert("Please enter a valid name for both.");
    }
});