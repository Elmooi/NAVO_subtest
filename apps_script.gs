// Google Apps Script - NaVo 음성 평가 설문 응답 저장
// 사용법:
//   1. Google Sheets를 새로 만들고 [확장 프로그램] > [Apps Script]를 엽니다.
//   2. 이 코드를 붙여넣고 저장합니다.
//   3. [배포] > [새 배포] > 유형: 웹 앱
//      - 실행 계정: 나(본인)
//      - 액세스 권한: 모든 사용자(익명 포함)
//   4. 배포 후 표시되는 URL을 index.html의 SCRIPT_URL에 붙여넣습니다.

const SHEET_NAME = "응답";

function doPost(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(SHEET_NAME);

    // 시트가 없으면 생성 + 헤더 추가
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
      const headers = ["타임스탬프"];
      for (let i = 1; i <= 16; i++) headers.push(`Q1_${i}`);
      for (let i = 1; i <= 15; i++) headers.push(`Q2_${i}`);
      sheet.appendRow(headers);
      sheet.getRange(1, 1, 1, headers.length)
        .setFontWeight("bold")
        .setBackground("#4F6EF7")
        .setFontColor("#FFFFFF");
      sheet.setFrozenRows(1);
    }

    const data = JSON.parse(e.postData.contents);

    const row = [data.timestamp || new Date().toISOString()];
    for (let i = 1; i <= 16; i++) row.push(data[`Q1_${i}`] || "");
    for (let i = 1; i <= 15; i++) row.push(data[`Q2_${i}`] || "");

    sheet.appendRow(row);

    return ContentService
      .createTextOutput(JSON.stringify({ status: "ok" }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: "error", message: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// 로컬 테스트용 (Apps Script 에디터에서 직접 실행)
function testDoPost() {
  const mockData = { timestamp: new Date().toISOString() };
  for (let i = 1; i <= 16; i++) mockData[`Q1_${i}`] = String(Math.ceil(Math.random() * 5));
  for (let i = 1; i <= 15; i++) mockData[`Q2_${i}`] = String(Math.ceil(Math.random() * 5));

  const mockEvent = { postData: { contents: JSON.stringify(mockData) } };
  const result = doPost(mockEvent);
  Logger.log(result.getContent());
}
