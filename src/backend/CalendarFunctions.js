// AppScript runs as single file in google.  All variables and methods are available to all other backend files.
function getMeetingInfo(type) {
  type?.toLowerCase()

  const meeting = getMeetingDetails(type)
  meeting.host = getRandomHost(meeting)

  delete meeting.hosts

  return meeting
}

function preview(meeting, startString) {
  const { duration, host } = meeting
  const { email, timeZone, officeHours, buffers } = getMeetingHost(host)

  const startISOString = new Date(...startString.split('-'), 0, 0, 0).toISOString()
  let start = relativeTimeWindowForHost(timeZone, startISOString)
  let end = new Date(start)

  start.setHours(start.getHours() + officeHours[0])
  end.setHours(end.getHours() + officeHours[1])

  let workWindow = { start, end }
  let busyTimes = getFreeBusyTimes(email, workWindow)
  if (buffers[0] > 0 || buffers[1] > 0) {
    busyTimes = busyTimes.map((b) => {
      b.start.setMinutes(b.start.getMinutes() - buffers[0])
      b.end.setMinutes(b.end.getMinutes() + buffers[1])
      return b
    })
  }
  let possibleEvents = []
  let proposedEvent = {
    start,
    end: new Date(start.getTime() + duration * 60000),
  }

  while (proposedEvent.end.getTime() <= end.getTime()) {
    if (isNotBusy(busyTimes, proposedEvent, workWindow)) {
      possibleEvents.push(proposedEvent.start.getTime())
    }

    proposedEvent.start.setTime(proposedEvent.start.getTime() + 15 * 60000)
    proposedEvent.end.setTime(proposedEvent.end.getTime() + 15 * 60000)
  }

  return possibleEvents
}

function scheduleEvent(meeting, startString, guestEmail) {
  const { description, duration, host, title } = meeting
  const { email } = getMeetingHost(host)
  const calendar = getCalendar(meeting.calendar)
  const startTime = new Date(startString)
  const endTime = new Date(startTime.getTime() + duration * 60000)
  const attendees = [email, guestEmail]

  if (meeting.hasBotGuest) {
    attendees.push(BOT_EMAIL)
  }

  const resource = {
    start: { dateTime: startTime.toISOString() },
    end: { dateTime: endTime.toISOString() },
    attendees: attendees.map((email) => ({ email })),
    conferenceData: {
      createRequest: {
        requestId: Math.random().toString(36).substring(7),
        conferenceSolutionKey: {
          type: 'hangoutsMeet',
        },
      },
    },
    summary: title,
    description: description,
  }

  Calendar.Events.insert(resource, calendar.getId(), {
    conferenceDataVersion: 1,
  })
}

function getFreeBusyTimes(email, workWindow) {
  const request = {
    timeMin: workWindow.start.toISOString(),
    timeMax: workWindow.end.toISOString(),
    groupExpansionMax: 100,
    calendarExpansionMax: 100,
    items: [
      {
        id: email,
      },
    ],
  }

  return Calendar.Freebusy.query(request).calendars[email].busy.map((b) => {
    b.start = new Date(b.start)
    b.end = new Date(b.end)

    return b
  })
}

function isNotBusy(busyTimes, proposedEvent, officeHours) {
  for (const busyTime of busyTimes) {
    //verify start is not during busy or before/after office hours
    if (
      (proposedEvent.start.getTime() >= busyTime.start.getTime() &&
        proposedEvent.start.getTime() < busyTime.end.getTime()) ||
      proposedEvent.start.getTime() < officeHours.start.getTime() ||
      proposedEvent.start.getTime() > officeHours.end.getTime()
    ) {
      return false
    }
    //verify end is not during busy or after office hours
    if (
      (proposedEvent.end.getTime() > busyTime.start.getTime() &&
        proposedEvent.end.getTime() <= busyTime.end.getTime()) ||
      proposedEvent.end.getTime() > officeHours.end.getTime()
    ) {
      return false
    }
    //verify not busy during proposed event
    if (
      (busyTime.start.getTime() >= proposedEvent.start.getTime() &&
        busyTime.start.getTime() < proposedEvent.end.getTime()) ||
      (busyTime.end.getTime() > proposedEvent.start.getTime() && busyTime.end.getTime() <= proposedEvent.end.getTime())
    ) {
      return false
    }
  }
  return true
}

function getCalendar(calendarName) {
  const calendar = CalendarApp.getCalendarsByName(calendarName)[0] ?? CalendarApp.getCalendarById(calendarName)

  if (calendar) {
    return calendar
  } else {
    throw new Error('Calendar not found: ' + calendarName)
  }
}

function relativeTimeWindowForHost(timeZone, startTime) {
  const start = new Date(startTime)
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
  })
  const offsetDate = new Date(Date.parse(formatter.format(start)))

  const offsetInHours = 24 - offsetDate.getHours()
  const offsetInMinutes = offsetInHours > 0 ? offsetDate.getMinutes() : -offsetDate.getMinutes()

  start.setHours(offsetInHours % 24, offsetInMinutes % 60)

  return start
}
