function getRandomHost(meetingObj) {
    const hosts = meetingObj.hosts.split(",")
    const host = hosts[Math.floor(Math.random() * hosts.length)].trim();
    return getHostPrefrences(host)
}

function getHostPrefrences(host) {
    const hostPrefs = openSheetByName(HOST_PREFRENCES_FILE_NAME)
    return mapObject(hostPrefs, host);
}

function getMeetingById(id) {
    const meetings = openSheetByName(MEETINGS_FILE_NAME);
    return mapObject(meetings, id);
}

// utility functions
function openSheetByName(name) {
    const files = DriveApp.getFilesByName(name)

    if (files.hasNext()) {
        const file = files.next();
        const sheet = SpreadsheetApp.open(file);
        return sheet;
    } else {
        Logger.log("File not found: " + fileName);
    }
}

function mapObject(spreadsheet, rowKey) {
    const colHeaders = getColumnHeaders(spreadsheet)
    const row = getRow(spreadsheet, rowKey)
    return colHeaders.reduce((o,v,i) => { o[v] = row[i]; return o }, {})
}

function queryValue(spreadsheet, rowKey, colHeader) {
    const colIndex = getColumnIndex(spreadsheet, colHeader);
    return getRow(spreadsheet, rowKey)[colIndex];
}

function getRow(spreadsheet, rowKey) {
    return spreadsheet.getDataRange().getValues().find((v) => v.includes(rowKey));
}

function getColumnIndex(spreadsheet, colHeader) {
    return getColumnHeaders(spreadsheet).indexOf(colHeader);
}

function getColumnHeaders(spreadsheet) {
    spreadsheet.getDataRange().getValues()[0].length
    return spreadsheet.getSheetValues(1,1,1,10)[0].filter(c => c);
}



