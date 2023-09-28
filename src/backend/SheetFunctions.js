// AppScript runs as single file in google.  All variables and methods are available to all other backend files.
const MEETING_DB_NAME = 'meetingDB'
const meetingDB = openDB()
const meetings = getSheetValues(meetingDB, 'meetings')
const hosts = getSheetValues(meetingDB, 'hosts')


function getMeetingDetails(meetingId) {
  return mapObject(meetings, meetingId)
}

function getRandomHost(meeting) {
  if (typeof meeting.hosts === 'string') {
    return meeting.hosts
  }
  let host = meeting.hosts[Math.floor(Math.random() * meeting.hosts.length)]

  if (host === meeting.recentHost) {
    host = getRandomHost(meeting)
  }

  return host
}

function setRecentHost(host, meetingId) {
  const meetingIdIndex = getColumnIndex(meetings, 'id')
  const recentHostIndex = getColumnIndex(meetings, 'recentHost') + 1
  let rowIndex

  for (let i = 1  ; i < meetings.length ; i++) {
    //start at 1 as row 0 is column headers
    if (meetings[i][meetingIdIndex] === meetingId) {
      rowIndex = i + 1
      break
    }
  }
    meetingDB.getSheetByName('meetings').getRange(rowIndex, recentHostIndex).setValue(host)
}

function getMeetingHost(hostId) {
  return mapObject(hosts, hostId)
}

function openDB() {
  const files = DriveApp.getFilesByName(MEETING_DB_NAME)

  if (files.hasNext()) {
    const file = files.next()
    return SpreadsheetApp.open(file)
  }

  Logger.log('File not found: ' + MEETING_DB_NAME)
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
