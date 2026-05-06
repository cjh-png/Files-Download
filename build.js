    // 執行方式：node build.js
const fs = require('fs');
const path = require('path');

const folderPath = path.join(__dirname, 'files');
const outputPath = path.join(__dirname, 'data.js');

// 支援的副檔名定義
const extMap = {
  image: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.heic'],
  video: ['.mp4', '.mov', '.webm'],
  audio: ['.mp3', '.wav', '.m4a', '.aac']
};

function getFilesRecursively(dir) {
  let results = [];
  const list = fs.readdirSync(dir);

  list.forEach(file => {
    // 排除隱藏檔案 (如 .DS_Store)
    if (file.startsWith('.')) return;

    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat && stat.isDirectory()) {
      results = results.concat(getFilesRecursively(filePath));
    } else {
      const ext = path.extname(file).toLowerCase();
      let type = 'other';
      
      if (extMap.image.includes(ext)) type = 'image';
      else if (extMap.video.includes(ext)) type = 'video';
      else if (extMap.audio.includes(ext)) type = 'audio';

      // 只有在支援的清單內才加入
      if (type !== 'other') {
        results.push({
          name: file,
          path: path.relative(__dirname, filePath).replace(/\\/g, '/'),
          type: type,
          size: (stat.size / 1024 / 1024).toFixed(2) + 'MB' // 紀錄檔案大小
        });
      }
    }
  });
  return results;
}


console.log('🔍 正在掃描 files 資料夾...');
const allFiles = getFilesRecursively(folderPath);

// 生成 data.js 的內容
const content = `// 自動生成，請勿手動修改\nconst fileList = ${JSON.stringify(allFiles, null, 2)};`;

fs.writeFileSync(outputPath, content);
console.log(`✅ 成功！已識別 ${allFiles.length} 個媒體檔案，並更新至 data.js`);

//node build.js