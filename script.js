// 設定假設的容量限制 (例如 10MB)
const MAX_STORAGE = 10 * 1024 * 1024;
let usedStorage = 0;

// 正確的密碼
const CORRECT_PASSWORD = "0520078";

function updateStorageInfo() {
    const remainingStorage = MAX_STORAGE - usedStorage;
    document.getElementById('storageInfo').innerText = `剩餘容量: ${(remainingStorage / 1024 / 1024).toFixed(2)} MB`;
}

function uploadFiles() {
    const fileInput = document.getElementById('fileInput');
    const files = fileInput.files;
    const fileList = document.getElementById('fileList');
    
    for (let file of files) {
        // 模擬上傳並檢查大小
        if (usedStorage + file.size <= MAX_STORAGE) {
            usedStorage += file.size;
            const li = document.createElement('li');
            li.textContent = `${file.name} - ${(file.size / 1024 / 1024).toFixed(2)} MB`;
            fileList.appendChild(li);
        } else {
            alert(`文件 ${file.name} 超出可用容量`);
        }
    }
    
    updateStorageInfo();
}

function checkPassword() {
    const passwordInput = document.getElementById('passwordInput').value;
    const errorMessage = document.getElementById('errorMessage');

    if (passwordInput === CORRECT_PASSWORD) {
        document.getElementById('loginContainer').style.display = 'none';
        document.getElementById('driveContainer').style.display = 'block';
    } else {
        errorMessage.innerText = "密碼錯誤，請再試一次。";
    }
}

// 初始更新容量信息
updateStorageInfo();
