/**
 * ==============================================================================
 * 🌟 GOOGLE APPS SCRIPT CHO GOLDEN STUDIO - LUXURY PHOTO STUDIO (TINH GỌN)
 * ==============================================================================
 * 
 * 📌 ĐẶC ĐIỂM:
 * 1. Tối giản 100%: KHÔNG cần Short.io, KHÔNG cần Tab Gửi khách, KHÔNG cần Chi nhánh.
 * 2. Tự động quét toàn bộ Concept & Ảnh chất lượng cao từ Google Drive.
 * 3. Tự động loại bỏ ảnh preview (chỉ lấy ảnh hoàn thiện).
 * 4. Tự động tạo Link Folder Drive (Cột U) và Link mở Concept trên Web (Cột V).
 * 5. Cố định dòng "NHẠC NỀN" ở cuối danh sách (nếu có).
 * 6. Hỗ trợ chọn nhiều Chủ đề (Multi-select Tags) từ Dropdown cột Chủ đề.
 */

// ==============================================================================
// 🔑 1. CẤU HÌNH HỆ THỐNG
// ==============================================================================

// ID Thư mục gốc chứa toàn bộ các concept trên Google Drive của bạn
const ROOT_FOLDER_ID = "1WQRFi6lQqTgkEtvRijZCX--sHTUjroUL"; 

// Tên miền Website của bạn (dùng để sinh link mở thẳng concept trên web)
const WEBSITE_DOMAIN = "https://goldenstudio.vn";


// ==============================================================================
// 📌 2. TẠO MENU TRÊN GOOGLE SHEETS
// ==============================================================================
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("✦ GOLDEN STUDIO")
    .addItem("🔄 1. Đồng bộ nhanh (Chỉ quét concept mới)", "syncDriveToSheetsQuick")
    .addItem("♻️ 2. Đồng bộ toàn bộ (Quét lại tất cả ảnh)", "syncDriveToSheetsFull")
    .addSeparator()
    .addItem("🔗 3. Cập nhật lại Link Drive & Link Web", "updateAllLinks")
    .addItem("🧹 4. Xóa chữ 'Tất cả' & Làm sạch tag cột Chủ đề", "cleanAllInvalidTags")
    .addSeparator()
    .addItem("🛠️ 5. Khởi tạo cấu trúc bảng chuẩn", "runInitialization")
    .addToUi();
}


// ==============================================================================
// 📌 3. HÀM TÌM SHEET CONCEPT
// ==============================================================================
function getConceptSheet(ss) {
  const sheets = ss.getSheets();
  for (let i = 0; i < sheets.length; i++) {
    const name = sheets[i].getName().toLowerCase().normalize("NFC");
    if (name.includes("cập nhật") || name.includes("cap nhat") || name.includes("concept") || name.includes("đồng bộ") || name.includes("dong bo") || name.includes("kho")) {
      return sheets[i];
    }
  }
  return sheets[0]; 
}


// ==============================================================================
// 📌 4. KHỞI TẠO TIÊU ĐỀ BẢNG CHUẨN
// ==============================================================================
function runInitialization() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = getConceptSheet(ss);
  if (!sheet) {
    SpreadsheetApp.getUi().alert("Lỗi", "Không tìm thấy trang tính phù hợp!", SpreadsheetApp.getUi().ButtonSet.OK);
    return;
  }
  initializeHeaders(sheet);
  SpreadsheetApp.getUi().alert("Khởi tạo thành công", "Đã khởi tạo bảng chuẩn tinh gọn. Bạn có thể nhấn 'Đồng bộ nhanh' hoặc 'Đồng bộ toàn bộ' ngay!", SpreadsheetApp.getUi().ButtonSet.OK);
}

function initializeHeaders(sheet) {
  sheet.clear();
  const headers = [
    "STT", "Chủ đề", "Tên concept", "Giá gói", "Mô tả", "Ẩn", "Best Seller", 
    "img1", "img2", "img3", "img4", "img5", "img6", "img7", "img8", "img9", "img10", "img11", "img12", 
    "Folder ID", "Link ảnh drive", "Link ảnh web"
  ];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length)
    .setFontWeight("bold")
    .setBackground("#111111")
    .setFontColor("#FFFFFF")
  sheet.setFrozenRows(1);
  
  // Tự động tạo sẵn ô Checkbox cho cột Ẩn (cột F) và Best Seller (cột G)
  sheet.getRange("F2:G200").insertCheckboxes();
}


// ==============================================================================
// 📌 5. CÁC HÀM TIỆN ÍCH & TẠO LINK
// ==============================================================================

// Sinh link dẫn thẳng vào thư mục Google Drive của Concept
function generateFolderDriveLink(folderId) {
  if (!folderId) return "";
  return "https://drive.google.com/drive/folders/" + folderId;
}

// Sinh link mở thẳng Concept trên Website
function generateConceptWebLink(stt) {
  if (!stt) return "";
  const domain = WEBSITE_DOMAIN.replace(/\/+$/, "");
  return domain + "/?concept=" + encodeURIComponent(stt);
}

// Tự động tìm vị trí các cột theo tên tiêu đề thực tế
function getColumnIndices(headers) {
  const normHeaders = headers.map(h => String(h || "").trim().toLowerCase().normalize("NFC"));
  
  function findCol(keywords, defaultIndex) {
    for (const kw of keywords) {
      const idx = normHeaders.indexOf(kw.toLowerCase().normalize("NFC"));
      if (idx !== -1) return idx;
    }
    return defaultIndex;
  }

  return {
    stt: findCol(["stt", "số thứ tự"], 0),
    theme: findCol(["chủ đề", "chu de", "category"], 1),
    title: findCol(["tên concept", "concept", "title"], 2),
    price: findCol(["giá gói", "giá", "gia", "price"], 3),
    desc: findCol(["mô tả", "mo ta", "description"], 4),
    hide: findCol(["ẩn", "an", "hidden"], 5),
    best: findCol(["best seller", "bán chạy", "hot"], 6),
    imgStart: findCol(["img1", "ảnh 1"], 7),
    folderId: findCol(["folder id", "folderid", "drivefolderid"], 19),
    driveFolderLink: findCol(["link ảnh drive", "link ảnh driver", "link drive", "link folder drive"], 20),
    conceptWebLink: findCol(["link ảnh web", "link web", "link website"], 21)
  };
}

// Tìm dòng cuối thực sự có chứa dữ liệu
function getLastRealRow(sheet, colIdx) {
  const values = sheet.getDataRange().getValues();
  for (let i = values.length - 1; i >= 0; i--) {
    if (values[i][colIdx.stt] !== "" || values[i][colIdx.title] !== "" || values[i][colIdx.folderId] !== "") {
      return i + 1;
    }
  }
  return 1;
}


// ==============================================================================
// 📌 6. ĐỒNG BỘ DỮ LIỆU TỪ GOOGLE DRIVE (CORE ENGINE)
// ==============================================================================

function syncDriveToSheetsQuick() {
  syncDriveToSheetsCore(true);
}

function syncDriveToSheetsFull() {
  syncDriveToSheetsCore(false);
}

function syncDriveToSheetsCore(isQuick) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const ui = SpreadsheetApp.getUi();
  
  const sheet = getConceptSheet(ss);
  if (!sheet) {
    ui.alert("Lỗi hệ thống", "Không tìm thấy trang tính phù hợp.", ui.ButtonSet.OK);
    return;
  }
  
  if (!ROOT_FOLDER_ID || ROOT_FOLDER_ID === "YOUR_GOOGLE_DRIVE_FOLDER_ID_HERE") {
    ui.alert("Lỗi cấu hình", "Vui lòng mở Trình biên tập kịch bản và cập nhật ROOT_FOLDER_ID.", ui.ButtonSet.OK);
    return;
  }
  
  try {
    const rootFolder = DriveApp.getFolderById(ROOT_FOLDER_ID);
    
    // Đọc tiêu đề cột hiện tại
    const dataRange = sheet.getDataRange();
    let values = dataRange.getValues();
    let headers = values[0] || [];
    
    if (headers.length < 5 || headers.indexOf("STT") === -1) {
      initializeHeaders(sheet);
      SpreadsheetApp.flush();
      values = sheet.getDataRange().getValues();
      headers = values[0];
    }
    
    const colIdx = getColumnIndices(headers);
    
    // --- 1. LỌC VÀ LƯU DÒNG NHẠC NỀN NẾU CÓ ---
    let musicRowData = null;
    let musicRowIndex = -1;
    for (let r = 1; r < values.length; r++) {
      const isMusic = String(values[r][colIdx.title] || '').toUpperCase() === 'NHẠC NỀN';
      if (isMusic) {
        musicRowData = values[r];
        musicRowIndex = r + 1;
        break;
      }
    }

    if (isQuick && musicRowIndex > 0) {
      sheet.deleteRow(musicRowIndex);
      SpreadsheetApp.flush();
      values = sheet.getDataRange().getValues();
    }
    
    // --- 2. TẬP HỢP FOLDER ID ĐÃ CÓ ---
    const sheetDataMap = new Map();
    const existingFolderIds = new Set();
    for (let r = 1; r < values.length; r++) {
      const fId = values[r][colIdx.folderId];
      if (fId) {
        sheetDataMap.set(fId, r);
        existingFolderIds.add(fId);
      }
    }
    
    const conceptFoldersList = [];
    const processedFolderIds = new Set();
    
    // Quét toàn bộ thư mục concept trong rootFolder
    findConceptFoldersRecursive(rootFolder, conceptFoldersList, existingFolderIds, isQuick, true);
    
    // --- 3. XỬ LÝ GHI DỮ LIỆU ---
    if (isQuick) {
      // ĐỒNG BỘ NHANH
      const lastRealRow = getLastRealRow(sheet, colIdx);
      const newRows = [];
      
      for (const concept of conceptFoldersList) {
        const newRow = new Array(headers.length).fill("");
        const newStt = lastRealRow + newRows.length + 1;
        
        newRow[colIdx.stt] = newStt;
        newRow[colIdx.theme] = "";
        newRow[colIdx.title] = concept.conceptName;
        newRow[colIdx.price] = "";
        newRow[colIdx.desc] = "";
        newRow[colIdx.hide] = false;
        newRow[colIdx.best] = false;
        
        for (let i = 0; i < 12; i++) {
          newRow[colIdx.imgStart + i] = i < concept.images.length ? `https://drive.google.com/file/d/${concept.images[i]}/view` : "";
        }
        
        newRow[colIdx.folderId] = concept.folderId;
        newRow[colIdx.driveFolderLink] = generateFolderDriveLink(concept.folderId);
        newRow[colIdx.conceptWebLink] = generateConceptWebLink(newStt);
        
        newRows.push(newRow);
      }
      
      if (newRows.length > 0) {
        sheet.getRange(lastRealRow + 1, 1, newRows.length, headers.length).setValues(newRows);
        applySheetFormatting(sheet, lastRealRow + 1, lastRealRow + newRows.length, colIdx);
      }
      
      if (musicRowData) {
        const finalRow = sheet.getLastRow() + 1;
        musicRowData[colIdx.stt] = "";
        sheet.getRange(finalRow, 1, 1, headers.length).setValues([musicRowData]);
        applySheetFormatting(sheet, finalRow, finalRow, colIdx);
      }
      
      fillDriveAndWebLinks(sheet, colIdx);
      ui.alert("Đồng bộ nhanh hoàn tất", `Đã cập nhật thêm ${newRows.length} concept mới từ Google Drive!`, ui.ButtonSet.OK);
      
    } else {
      // ĐỒNG BỘ TOÀN BỘ
      for (const concept of conceptFoldersList) {
        const cId = concept.folderId;
        processedFolderIds.add(cId);
        
        if (sheetDataMap.has(cId)) {
          const r = sheetDataMap.get(cId);
          values[r][colIdx.title] = concept.conceptName;
          for (let i = 0; i < 12; i++) {
            values[r][colIdx.imgStart + i] = i < concept.images.length ? `https://drive.google.com/file/d/${concept.images[i]}/view` : "";
          }
          values[r][colIdx.driveFolderLink] = generateFolderDriveLink(cId);
          values[r][colIdx.conceptWebLink] = generateConceptWebLink(values[r][colIdx.stt]);
        } else {
          const newRow = new Array(headers.length).fill("");
          const rowStt = values.length;
          newRow[colIdx.stt] = rowStt;
          newRow[colIdx.theme] = "";
          newRow[colIdx.title] = concept.conceptName;
          newRow[colIdx.price] = "";
          newRow[colIdx.desc] = "";
          newRow[colIdx.hide] = false;
          newRow[colIdx.best] = false;
          
          for (let i = 0; i < 12; i++) {
            newRow[colIdx.imgStart + i] = i < concept.images.length ? `https://drive.google.com/file/d/${concept.images[i]}/view` : "";
          }
          
          newRow[colIdx.folderId] = cId;
          newRow[colIdx.driveFolderLink] = generateFolderDriveLink(cId);
          newRow[colIdx.conceptWebLink] = generateConceptWebLink(rowStt);
          values.push(newRow);
        }
      }
      
      const newValues = [headers];
      let stt = 1;
      for (let r = 1; r < values.length; r++) {
        const fId = values[r][colIdx.folderId];
        const isMusic = String(values[r][colIdx.title] || '').toUpperCase() === 'NHẠC NỀN';
        if (isMusic) continue;
        
        if (fId && processedFolderIds.has(fId)) {
          const row = values[r];
          row[colIdx.stt] = stt;
          row[colIdx.driveFolderLink] = generateFolderDriveLink(fId);
          row[colIdx.conceptWebLink] = generateConceptWebLink(stt);
          stt++;
          newValues.push(row);
        }
      }
      
      if (musicRowData) {
        musicRowData[colIdx.stt] = "";
        newValues.push(musicRowData);
      }
      
      sheet.clearContents();
      sheet.getRange(1, 1, newValues.length, headers.length).setValues(newValues);
      applySheetFormatting(sheet, 2, newValues.length, colIdx);
      
      ui.alert("Đồng bộ toàn bộ hoàn tất", `Đã làm mới danh sách với ${newValues.length - 1} concept và khớp 100% Link Drive & Link Web!`, ui.ButtonSet.OK);
    }
    
  } catch (error) {
    ui.alert("Lỗi đồng bộ", "Có lỗi xảy ra: " + error.toString(), ui.ButtonSet.OK);
  }
}


// ==============================================================================
// 📌 7. QUÉT ĐỆ QUY TÌM ẢNH TRONG GOOGLE DRIVE (LỌC PREVIEW)
// ==============================================================================
function findConceptFoldersRecursive(folder, conceptFoldersList, existingFolderIds, isQuick, isRoot) {
  const folderId = folder.getId();
  const folderName = folder.getName();
  
  if (isQuick && existingFolderIds.has(folderId)) {
    return;
  }
  
  const files = folder.getFiles();
  const images = [];
  const allowedExtensions = ["jpg", "jpeg", "png", "webp", "heic"];
  
  while (files.hasNext()) {
    const file = files.next();
    const fileNameLower = file.getName().toLowerCase();
    
    // BỘ LỌC THÔNG MINH: Bỏ qua hoàn toàn nếu tên tệp tin chứa chữ "preview"
    if (fileNameLower.includes("preview")) {
      continue; 
    }
    
    const ext = fileNameLower.split('.').pop().toLowerCase();
    if (allowedExtensions.includes(ext)) {
      images.push(file.getId());
    }
  }
  
  // Nếu thư mục này có ảnh (và không phải thư mục gốc) -> Coi là 1 Concept
  if (images.length >= 1 && !isRoot) {
    images.sort();
    conceptFoldersList.push({
      folderId: folderId,
      conceptName: folderName,
      images: images
    });
  }
  
  const subFolders = folder.getFolders();
  while (subFolders.hasNext()) {
    const subFolder = subFolders.next();
    findConceptFoldersRecursive(subFolder, conceptFoldersList, existingFolderIds, isQuick, false);
  }
}


// ==============================================================================
// 📌 8. TỰ ĐỘNG CẬP NHẬT LINK DRIVE & LINK WEB KHỚP 100% VỚI STT
// ==============================================================================
function updateAllLinks() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = getConceptSheet(ss);
  if (!sheet) return;
  
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const colIdx = getColumnIndices(headers);
  const updatedCount = fillDriveAndWebLinks(sheet, colIdx);
  
  SpreadsheetApp.getUi().alert("Hoàn tất", `Đã cập nhật và khớp thành công ${updatedCount} link Drive và link Web!`, SpreadsheetApp.getUi().ButtonSet.OK);
}

function fillDriveAndWebLinks(sheet, colIdx) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return 0;
  
  const dataRange = sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn());
  const values = dataRange.getValues();
  let updatedCount = 0;
  
  for (let i = 0; i < values.length; i++) {
    const stt = values[i][colIdx.stt];
    const folderId = values[i][colIdx.folderId];
    const currentDrive = values[i][colIdx.driveFolderLink];
    const currentWeb = values[i][colIdx.conceptWebLink];
    
    let changed = false;
    if (folderId) {
      const expDrive = generateFolderDriveLink(folderId);
      if (currentDrive !== expDrive) {
        values[i][colIdx.driveFolderLink] = expDrive;
        changed = true;
      }
    }
    
    if (stt) {
      const expWeb = generateConceptWebLink(stt);
      if (currentWeb !== expWeb) {
        values[i][colIdx.conceptWebLink] = expWeb;
        changed = true;
      }
    }
    
    if (changed) updatedCount++;
  }
  
  if (updatedCount > 0) {
    dataRange.setValues(values);
    SpreadsheetApp.flush();
  }
  return updatedCount;
}


// ==============================================================================
// 📌 9. ĐỊNH DẠNG CHECKBOX (ẨN & BEST SELLER)
// ==============================================================================
function applySheetFormatting(sheet, startRow, endRow, colIdx) {
  if (startRow > endRow) return;
  const hideCol = colIdx.hide !== -1 ? colIdx.hide + 1 : 6;
  const bestCol = colIdx.best !== -1 ? colIdx.best + 1 : 7;
  
  sheet.getRange(startRow, hideCol, endRow - startRow + 1, 1).insertCheckboxes();
  sheet.getRange(startRow, bestCol, endRow - startRow + 1, 1).insertCheckboxes();
}


// ==============================================================================
// 📌 10. MULTI-SELECT DROPDOWN CHO CỘT CHỦ ĐỀ & DỌN DẸP TAG TRÙNG
// ==============================================================================
function onEdit(e) {
  if (!e || !e.range) return;
  const sheet = e.source.getActiveSheet();
  const range = e.range;
  const conceptSheet = getConceptSheet(e.source);
  if (!conceptSheet || sheet.getName() !== conceptSheet.getName()) return;
  
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const colIdx = getColumnIndices(headers);
  const themeColNumber = colIdx.theme + 1;
  
  // Áp dụng cho cột Chủ đề từ dòng 2 trở đi
  if (range.getColumn() === themeColNumber && range.getRow() > 1) {
    const newValue = e.value;
    if (!newValue) return;
    
    const lock = LockService.getScriptLock();
    try {
      lock.waitLock(5000);
    } catch (f) {
      return;
    }
    
    try {
      const normalize = function(str) {
        if (!str) return "";
        return str.toString()
          .replace(/&amp;/g, "&")
          .replace(/\s+/g, " ")
          .trim();
      };
      
      const newStr = String(newValue).trim();
      const isTatCa = function(str) {
        const norm = normalize(str).toLowerCase();
        return norm === "tất cả" || norm === "tat ca" || norm === "all" || norm === "all works";
      };

      const oldParts = oldValue ? String(oldValue).split(",").map(p => p.trim()).filter(p => p && !isTatCa(p)) : [];
      const oldPartsNorm = oldParts.map(p => normalize(p).toLowerCase());
      
      const newParts = newStr.split(",").map(p => p.trim()).filter(p => p && !isTatCa(p));
      const newPartsNorm = newParts.map(p => normalize(p).toLowerCase());
      
      let isDeleteAction = true;
      if (oldPartsNorm.length === 0) {
        isDeleteAction = false;
      } else {
        for (const normPart of newPartsNorm) {
          if (!oldPartsNorm.includes(normPart)) {
            isDeleteAction = false;
            break;
          }
        }
      }
      
      if (isDeleteAction) {
        const uniqueNew = [];
        const seenNew = new Set();
        for (const part of newParts) {
          const norm = normalize(part).toLowerCase();
          if (!seenNew.has(norm) && norm !== "" && !isTatCa(part)) {
            seenNew.add(norm);
            uniqueNew.push(part.replace(/&amp;/g, "&").trim());
          }
        }
        range.setValue(uniqueNew.join(", "));
      } else {
        const combined = [...oldParts, ...newParts];
        const cleanCombined = [];
        const combinedSeen = new Set();
        for (const part of combined) {
          const norm = normalize(part).toLowerCase();
          if (!combinedSeen.has(norm) && norm !== "" && !isTatCa(part)) {
            combinedSeen.add(norm);
            cleanCombined.push(part.replace(/&amp;/g, "&").trim());
          }
        }
        range.setValue(cleanCombined.join(", "));
      }
    } catch (err) {
      console.error("Lỗi onEdit: " + err.toString());
    } finally {
      lock.releaseLock();
    }
  }
}

// Hàm dọn sạch hoàn toàn chữ "Tất cả" và các tag trùng lặp trong cột Chủ đề
function cleanAllInvalidTags() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = getConceptSheet(ss);
  if (!sheet) return;
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return;
  
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const colIdx = getColumnIndices(headers);
  const themeColNumber = colIdx.theme + 1;
  
  const range = sheet.getRange(2, themeColNumber, lastRow - 1, 1);
  const values = range.getValues();
  
  const normalize = function(str) {
    if (!str) return "";
    return str.toString()
      .replace(/&amp;/g, "&")
      .replace(/\s+/g, " ")
      .trim();
  };
  
  const isTatCa = function(str) {
    const norm = normalize(str).toLowerCase();
    return norm === "tất cả" || norm === "tat ca" || norm === "all" || norm === "all works";
  };
  
  let fixedCount = 0;
  for (let i = 0; i < values.length; i++) {
    const cellValue = String(values[i][0] || "");
    if (cellValue) {
      const parts = cellValue.split(/[,;\n]+/).map(p => p.trim()).filter(Boolean);
      const uniqueParts = [];
      const seen = new Set();
      
      for (let j = 0; j < parts.length; j++) {
        const part = parts[j];
        const norm = normalize(part).toLowerCase();
        // Loại bỏ hoàn toàn chữ Tất cả / All
        if (!isTatCa(part) && !seen.has(norm) && norm !== "") {
          seen.add(norm);
          uniqueParts.push(part.replace(/&amp;/g, "&").trim());
        }
      }
      
      const newValue = uniqueParts.join(", ");
      if (newValue !== cellValue) {
        values[i][0] = newValue;
        fixedCount++;
      }
    }
  }
  
  if (fixedCount > 0) {
    range.setValues(values);
    SpreadsheetApp.getUi().alert("Dọn dẹp thành công", `Đã xóa sạch chữ 'Tất cả' và sửa lỗi cho ${fixedCount} dòng! Các dấu tam giác đỏ đã biến mất.`, SpreadsheetApp.getUi().ButtonSet.OK);
  } else {
    SpreadsheetApp.getUi().alert("Thông báo", "Không tìm thấy chữ 'Tất cả' nào cần xóa.", SpreadsheetApp.getUi().ButtonSet.OK);
  }
}
