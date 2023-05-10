// AppScript runs as single file in google.  All variables and methods are available to all other backend files.
const MEETING_DB_NAME = 'meetingDB'
const meetingDB = openDB()
const meetings = getSheetValues(meetingDB, 'meetings')
const hosts = getSheetValues(meetingDB, 'hosts')

function getMeetingDetails(meetingId) {
  return mapObject(meetings, meetingId)
}

function getRandomHost(meeting) {
  const host =
    typeof meeting.hosts === 'string' ? meeting.hosts : meeting.hosts[Math.floor(Math.random() * meeting.hosts.length)]

  return mapObject(hosts, host)
}

function getMeetingHost(hostId) {
  return mapObject(hosts, hostId)
}

function openDB() {
  const files = DriveApp.getFilesByName(MEETING_DB_NAME)

  if (files.hasNext()) {
    const file = files.next()
    const sheet = SpreadsheetApp.open(file)

    return sheet
  } else {
    Logger.log('File not found: ' + fileName)
  }
}

function mapObject(sheet, rowKey) {
  const colHeaders = getColumnHeaders(sheet)
  const row = getRow(sheet, rowKey)

  if (!row) return {}

  return colHeaders.reduce((o, v, i) => {
    o[v] =
      typeof row[i] === 'string' && row[i].includes(',')
        ? row[i].split(',').reduce((a, v) => {
          v = v.trim()
          a.push(isNaN(v) ? v : Number(v))

          return a
        }, [])
        : row[i]

    return o
  }, {})
}

function getRow(sheet, rowKey) {
  return sheet.find((v) => v.includes(rowKey))
}

function getColumnIndex(sheet, colHeader) {
  return getColumnHeaders(sheet).indexOf(colHeader)
}

function getColumnHeaders(sheetValues) {
  return sheetValues[0]
}

function getSheetValues(spreadsheet, sheetName) {
  return spreadsheet.getSheetByName(sheetName).getDataRange().getValues()
}
