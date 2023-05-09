// AppScript runs as single file in google.  All variables and methods are available to all other backend files.
const MEETING_DB_NAME = "meetingDB";
const meetingDB = openDB();
const meetings = meetingDB.getSheetByName("meetings").getDataRange().getValues();
const hosts = meetingDB.getSheetByName("hosts").getDataRange().getValues();


function getMeetingDetails(meetingId) {
    return mapObject(meetings, meetingId)
}

function getRandomHost(meetingObj) {
    const host = meetingObj.hosts[Math.floor(Math.random() * hosts.length)];
    return mapObject(hosts, host)
}

function getMeetingHost(hostId) {
    return mapObject(hosts, hostId);
}

// // utility functions
function openDB() {
    const files = DriveApp.getFilesByName(MEETING_DB_NAME)

    if (files.hasNext()) {
        const file = files.next();
        const sheet = SpreadsheetApp.open(file);
        return sheet;
    } else {
        Logger.log("File not found: " + fileName);
    }
}

function mapObject(sheet, rowKey) {
    const colHeaders = getColumnHeaders(sheet)
    const row = getRow(sheet, rowKey)
    if (row === undefined || row === null) return {} //add default meeting
    return colHeaders.reduce((o,v,i) => {
            o[v] = typeof(row[i]) === 'string' && row[i].includes(",") ?
                row[i].split(",").reduce((a,v) => {a.push(v.trim()); return a}, []) :
                row[i];
            return o
        },
        {})
}

function getRow(sheet, rowKey) {
    return sheet.find((v) => v.includes(rowKey));
}

function getColumnIndex(sheet, colHeader) {
    return getColumnHeaders(sheet).indexOf(colHeader);
}

function getColumnHeaders(sheetValues) {
    return sheetValues[0];
}
