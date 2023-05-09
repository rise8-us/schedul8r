// AppScript runs as single file in google.  All variables and methods are available to all other backend files.
let meeting = {};
let host = {}

function getMeetingInfo(type) {
  type?.toLowerCase();

  meeting = getMeetingDetails(type);
  host = getRandomHost(meeting);

  meeting.host = host.email;
  meeting.displayName = host.displayName;

  delete meeting.hosts;

  return meeting;
}

function preview(meeting, start) {
  meeting.host = getMeetingHost(meeting.host)
  start = new Date(...start.split("-"), 0, 0, 0).toISOString();

  let startWindow = relativeTimeWindowForHost(meeting.host.timeZone, start);
  let endWindow = new Date(startWindow);
  startWindow.setHours(startWindow.getHours() + meeting.host.officeHours[0]);
  endWindow.setHours(endWindow.getHours() + meeting.host.officeHours[1]);

  let officeHours = { start: startWindow, end: endWindow };

  const busyTimes = getFreebusyTimes(meeting, {
    start: startWindow,
    end: endWindow,
  });

  let possibleEvents = [];
  let proposedEvent = {
    start: startWindow,
    end: new Date(startWindow.getTime() + meeting.duration * 60000),
  };

  while (proposedEvent.end.getTime() < endWindow.getTime()) {
    if (isNotDuringBusy(busyTimes, proposedEvent, officeHours)) {
      possibleEvents.push(proposedEvent.start.getTime());
    }

    proposedEvent.start.setTime(proposedEvent.start.getTime() + 15 * 60000);
    proposedEvent.end.setTime(proposedEvent.end.getTime() + 15 * 60000);
  }
  return possibleEvents;
}

function scheduleEvent(meeting, startTime, guestEmail) {
  startTime = new Date(startTime);
  const endTime = new Date(startTime.getTime() + meeting.duration * 60000);
  let attendees = [host.email, guestEmail];

  if (meeting.hasBotGuest) {attendees.push(BOT_EMAIL)}

  const calendar = getCalendar(meeting.calendar);
  const resource = {
    start: {dateTime: startTime.toISOString() },
    end: { dateTime: endTime.toISOString() },
    attendees: attendees.reduce((a,e) => {a.push({email: e}); return a}, []),
    conferenceData: {
      createRequest: {
        requestId: Math.random().toString(36).substring(7),
        conferenceSolutionKey : {
          type: 'hangoutsMeet'
        }
      },
    },
    summary: meeting.title,
    description: meeting.description,
  };

  Calendar.Events.insert(resource, calendar.getId(), { conferenceDataVersion: 1 })
}

function getFreebusyTimes({ host: { email } }, { start, end }) {
  const request = {
    timeMin: start.toISOString(),
    timeMax: end.toISOString(),
    groupExpansionMax: 100,
    calendarExpansionMax: 100,
    items: [
      {
        id: email,
      },
    ],
  };

  return Calendar.Freebusy.query(request).calendars[email].busy.map((b) => {
    b.start = new Date(b.start);
    b.end = new Date(b.end);
    return b;
  });
}

function isNotDuringBusy(busyTimes, proposedEvent, officeHours) {
  for (const busyTime of busyTimes) {
    //verfiy start is not during busy or before/after office hours
    if (
        (proposedEvent.start.getTime() >= busyTime.start.getTime() &&
            proposedEvent.start.getTime() < busyTime.end.getTime()
        ) ||
        proposedEvent.start.getTime() < officeHours.start.getTime() ||
        proposedEvent.start.getTime() > officeHours.end.getTime()
    ) {
      return false;
    }
    //verfiy end is not during busy or after office hours
    if (
        (proposedEvent.end.getTime() > busyTime.start.getTime() &&
            proposedEvent.end.getTime() <= busyTime.end.getTime()
        ) ||
        proposedEvent.end.getTime() > officeHours.end.getTime()
    ) {
      return false;
    }
  }
  return true;
}

function getCalendar(calendarName) {
  let calendar = CalendarApp.getCalendarsByName(calendarName)[0];
  calendar =
      calendar != null ? calendar : CalendarApp.getCalendarById(calendarName);

  if (calendar) {
    return calendar;
  } else {
    throw new Error("Calendar not found: " + calendarName);
  }
}

function relativeTimeWindowForHost(timeZone, startTime) {
  const start = new Date(startTime);
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
  });
  const offset = 24 - new Date(Date.parse(formatter.format(start))).getHours();

  start.setHours(offset);

  return start;
}
