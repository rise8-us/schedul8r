const today = new Date()
today.setHours(0, 0, 0)
const activeYearMonth = today.getFullYear() + guaranteeTwoDigits(today.getMonth())
const todayAsNumber = +(
  today.getFullYear() +
  guaranteeTwoDigits(today.getMonth()) +
  guaranteeTwoDigits(today.getDate())
)

let currentMonth = today.getMonth()
let currentYear = today.getFullYear()
let selectedDay
let selectedTime
let confirmMeeting
let meetingSettings = {
  duration: 0,
}
let isMobile = false

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

$(function() {
  setIsMobile()

  generateCalendarContent(currentMonth, currentYear)
  generateInfoBlock()

  window.addEventListener('resize', () => {
    setIsMobile()

    if (isMobile) {
      handleMobileView()
    } else {
      $('#logo').removeClass('hidden')
      $('#infoBlock').removeClass('hidden')

      $('#mobileDuration').remove()
      $('#timeInfoWrap').remove()

      selectedDay && $('#time').addClass('enabled')

      if (!confirmMeeting) {
        $('#calendar').removeClass('hidden')
        $('#calendarTitle').removeClass('hidden')
        $('#backButton').addClass('hidden')
      }
    }
  })

  google.script.url.getLocation(fetchMeetingInfo)
})

function fetchMeetingInfo(location) {
  const { parameter } = location

  google.script.run
    .withSuccessHandler(setMeetingInfo)
    .withFailureHandler((error) => console.error(error))
    .getMeetingInfo(parameter.meetingType ?? 'default', parameter.appId)
}

function setMeetingInfo(newSettings) {
  meetingSettings = newSettings

  $('#meetingType').empty().removeClass('skeleton').append(newSettings.title)
  $('#meetingDuration').empty().removeClass('skeleton').append(`${newSettings.duration} min`)

  const { firstDayOfWeek, maxWeeks } = generateCalendarData(currentMonth, currentYear)
  generateDays(maxWeeks, currentYear, currentMonth, firstDayOfWeek)

  google.script.run
    .withSuccessHandler(setMeetingHostInfo)
    .withFailureHandler((error) => console.error(error))
    .getProfileByEmail(newSettings.host)
}

function setMeetingHostInfo(hostInfo) {
  const { name, photo, title } = hostInfo

  $('#hostName').empty().removeClass('skeleton').append(name)
  $('#hostTitle').empty().removeClass('skeleton').append(title)

  if (photo) $('#hostPhoto').empty().removeClass('skeleton').attr('src', photo)
  else $('#hostPhoto').remove()
}

function generateCalendarContent(monthInt, yearInt) {
  const { maxWeeks } = generateCalendarData(monthInt, yearInt)

  const calendar = $('#calendar')
  calendar.empty()
  let children = ''

  $('#time').empty().append('<span id="timeWrap" class="time__wrap"/>')

  generateCalendarHeader(calendar, monthInt, yearInt)

  for (const weekday of WEEKDAYS) {
    children += `<h6 class="weekday">${weekday.substring(0, 3)}</h6>`
  }

  calendar.append(`<div class="weekdays">${children}</div>`)
  calendar.append('<div id="calendarWeekdays" class="calendar__weekdays" />')

  generateCalendarSkeleton(maxWeeks)
}

function generateCalendarSkeleton(maxWeeks) {
  const calendarWeekdays = $('#calendarWeekdays')

  for (let i = 0; i < maxWeeks; i++) {
    let children = ''

    for (let j = 1; j <= 7; j++) {
      children += '<div class="day__skeleton skeleton"></div>'
    }

    calendarWeekdays.append(`<div class="week week__skeleton">${children}</div>`)
  }
}

function generateCalendarData(month, year) {
  const firstOfMonth = new Date(year, month, 1)
  const firstDayOfWeek = firstOfMonth.getDay()
  const maxWeeks = Math.ceil((firstDayOfWeek + 35) / 7)

  return { firstDayOfWeek, maxWeeks }
}

function generateCalendarHeader(calendar, month, year) {
  const ids = ['decrement', 'increment']
  const header = `
    <div class="month">
      <h2 id="monthYear">${MONTHS[month]} ${year}</h2>
      <div style="display: flex;">
        ${getMonthArrow(ids[0], 'left__icon')}
        ${getMonthArrow(ids[1], 'right__icon')}
      </div>
    </div>
  `

  calendar.append(header)

  for (const id of ids) {
    $(`#${id}`)
      .off('click')
      .on('click', (event) => {
        const [newYear, newMonth] = calculateNewYearAndMonth(currentYear, currentMonth, id)
        const newYearMonth = newYear + guaranteeTwoDigits(newMonth)

        if (id === 'decrement') {
          if (+activeYearMonth === +newYearMonth) $('#decrement').addClass('disabled')
          if (+activeYearMonth > +newYearMonth) return
        } else {
          $('#decrement').removeClass('disabled')
        }

        createRipple(event)
        currentYear = newYear
        currentMonth = newMonth

        const { firstDayOfWeek, maxWeeks } = generateCalendarData(newMonth, newYear)

        updateHeader(newMonth, newYear)
        generateDays(maxWeeks, newYear, newMonth, firstDayOfWeek)
      })
  }
}

function generateDays(maxWeeks, yearInt, monthInt, firstDayOfWeek) {
  const calendarWeekdays = $('#calendarWeekdays')
  calendarWeekdays.empty()

  for (let i = 0; i < maxWeeks; i++) {
    let children = ''
    let buttonIds = []

    for (let j = 1; j <= 7; j++) {
      const day = new Date(yearInt, monthInt, i * 7 + j - firstDayOfWeek)
      const dateCheck = beforeToday(day)
      const id = [day.getFullYear(), guaranteeTwoDigits(day.getMonth()), guaranteeTwoDigits(day.getDate())].join('-')
      let disabled = ''

      buttonIds.push(id)
      if (dateCheck < 1 || [0, 6].some((weekend) => day.getDay() === weekend)) disabled = 'disabled'

      children += `
        <div class="day ${disabled}">
          <button id="${id}" value="${day}" class="day__btn" ${disabled}>
            <p>${day.getDate()}</p>
            ${!dateCheck ? '<span class="today" />' : ''}
          </button>
        </div>
      `
    }

    calendarWeekdays.append(`<div class="week">${children}</div>`)

    addDayButtonsClickListener(buttonIds)
  }
}

function updateHeader(month, year) {
  const calendarHeader = $('#monthYear')
  calendarHeader[0].innerText = `${MONTHS[month]} ${year}`
}

function fetchAvailability(dateString) {
  const time = $('#time')
  const timeWrap = $('#timeWrap')

  time.addClass('enabled')

  timeWrap.empty()
  timeWrap.append(getLoadingSpinner())

  google.script.run
    .withSuccessHandler(generateHourButtons)
    .withFailureHandler(console.error)
    .preview(meetingSettings, dateString)
}

function generateHourButtons(data) {
  const timeWrap = $('#timeWrap')
  timeWrap.empty()

  isMobile && addMobileDurationInfoBlock()

  if (data.length === 0) {
    timeWrap.append(`
      <div class="time__wrap empty">
        <h2>There are no open time slots that are currently available for this day.</h2>
      </div>
    `)
  }

  for (let timeBlock of data) {
    const displayTime = getShortTime(timeBlock)

    timeWrap.append(`
      <div id="timeWrap-${timeBlock}" class="time__button-wrap">
        <button id="${timeBlock}" value="${timeBlock}" class="time__button-option">${displayTime}</button>
      </div>
    `)

    $(`#${timeBlock}`)
      .off('click')
      .on('click', (event) => {
        createRipple(event)

        if (+selectedTime?.id === timeBlock) {
          $('#timeConfirmButton').remove()
          selectedTime.classList.remove('selected')
          selectedTime = undefined

          return
        }

        if (selectedTime) selectedTime.classList.remove('selected')
        $('#timeConfirmButton').remove()

        const confirmBtn = $(`#timeWrap-${timeBlock}`)
        confirmBtn.append('<button id="timeConfirmButton" class="time__button-confirm">Confirm</button>')

        selectedTime = document.getElementById(timeBlock)
        selectedTime.classList.add('selected')

        $('#timeConfirmButton')
          .off('click')
          .on('click', (event) => {
            confirmMeeting = true

            createRipple(event)
            generateRequestorForm(timeBlock)
          })
      })
  }
}

function generateRequestorForm(timeBlock) {
  $('#scheduleIcon').empty().append(getSendIcon())
  $('#dateTimeWrap').addClass('hidden')
  $('#detailsWrap').removeClass('hidden')
  $('#backButton').removeClass('hidden')
  $('#logo').removeClass('hidden')
  $('#infoBlock').removeClass('hidden')
  $('#dateTime').empty().append(addTimeFrame())
  $('#timeZone').empty().append(addTimezone())
  $('#dateTime-value').empty().append(buildDurationString(timeBlock, meetingSettings.duration))

  $('#scheduleEventButton')
    .off('click')
    .on('click', (event) => {
      createRipple(event)

      const requestorName = document.getElementById('fullName')
      const requestorEmail = document.getElementById('mail')

      const requestor = {
        requestorName: requestorName.value,
        requestorEmail: requestorEmail.value
      }
      // TODO: Handle extra info
      // const requestorExtraInfo = document.getElementById("question0");
      let shouldSchedule = true

      if (!requestorName.validity.valid) {
        $('#fullNameWrap').addClass('invalid')
        shouldSchedule = false
      } else {
        $('#fullNameWrap').removeClass('invalid')
      }

      if (!requestorEmail.validity.valid) {
        $('#mailWrap').addClass('invalid')
        shouldSchedule = false
      } else {
        $('#mailWrap').removeClass('invalid')
      }

      if (shouldSchedule) {
        $('#scheduleIcon').empty().append(getProcessingIcon())
        $('#scheduleEventButton').attr('disabled', true).addClass('disabled')

        google.script.run
          .withSuccessHandler(() => showSuccessMark(requestorName.value, $('#hostName').text(), requestorEmail.value))
          .scheduleEvent(meetingSettings, timeBlock, requestor)
      }
    })
}

function showSuccessMark(attendeeName, host, attendeeEmail) {
  $('#backButton').addClass('hidden')
  $('#detailsWrap').addClass('hidden')
  $('#selectionContainer').append(getCheckmark(attendeeName, host, attendeeEmail))
}

function generateInfoBlock() {
  const infoBlock = $('#infoBlock')

  $('#meetingInfo').prepend(getBackIcon())

  $('#backButton')
    .off('click')
    .on('click', (event) => {
      createRipple(event)

      $('#dateTime').empty()
      $('#timeZone').empty()

      if (isMobile) {
        if (confirmMeeting) {
          confirmMeeting = false
        } else if (selectedDay || selectedTime) {
          selectedDay?.classList?.remove('selected')
          $('#timeConfirmButton').remove()
          $('#timeWrap').empty()

          selectedDay = undefined
          selectedTime = undefined
        }

        handleMobileView()
      } else {
        confirmMeeting && (confirmMeeting = false)

        $('#backButton').addClass('hidden')
        $('#dateTimeWrap').removeClass('hidden')
        $('#detailsWrap').addClass('hidden')
      }
    })

  infoBlock.append(`
    <div class="host__wrap">
      <image id="hostPhoto" class="host__photo skeleton"></image>
      <div class="host">
        <h4 id="hostName" class="host__name skeleton"></h4>
        <h5 id="hostTitle" class="host__title skeleton"></h5>
      </div>
    </div>
    <h2 id="meetingType" class="meeting__type skeleton"></h2>
    <div class="meetingDuration__wrap">
      <div id="duration" class="info__section">
        ${getClockIcon()}
        <h4 id="meetingDuration" class="info skeleton meeting__duration"></h4>
      </div>
      <div class="info__section">
        ${getVideoIcon()}
        <h4 class="info">Web conferencing details provided upon confirmation.</h4>
      </div>
    </div>
    <div id="dateTime" class="info__section"></div>
    <div id="timeZone" class="info__section"></div>
  `)
}

function addMobileTimeInfoBlock() {
  $('#timeInfoWrap').remove()

  const date = new Date(selectedDay.value)

  $('#time').prepend(`
    <div id="timeInfoWrap" class="time__info-wrap">
      <div class="time__info">
        <p class="time__info-weekday">${WEEKDAYS[date.getDay()]}</p>
        <p>${date.getDate()} ${MONTHS[date.getMonth()]}, ${date.getFullYear()}</p>
      </div>
    </div>
  `)
}

function addMobileDurationInfoBlock() {
  const timeWrap = $('#timeWrap')

  $('#mobileDuration').remove()

  timeWrap.prepend(`
    <div id="mobileDuration" class="mobile__duration">
      <h2>Select a Time</h2>
      <p>Duration: ${meetingSettings.duration}min</p>
    </div>
  `)
}

function addTimeFrame() {
  return `
    ${getCalendarIcon()}
    <h4 id="dateTime-value" class="info"></h4>
  `
}

function addTimezone() {
  return `
    ${getGlobeIcon()}
    <h4 class="info">${Intl.DateTimeFormat().resolvedOptions().timeZone.replace('/', ' / ').replace('_', ' ')}</h4>
  `
}

function getMonthArrow(id, classNames = '') {
  return `
  <button id="${id}" class="${id === 'decrement' ? 'disabled' : ''}">
    <svg class="${classNames}" fill="#000000" viewBox="0 0 24 24">
      <path d="M8.59 16.59 13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" />
    </svg>
  </button>
  `
}

function getLoadingSpinner() {
  return `
    <div class="spinner__container">
      <div class="spinner" />
    </div>
  `
}

function getProcessingIcon() {
  return `
    <div class="loading">
      <div></div>
      <div></div>
      <div></div>
      <div></div>
    </div>
  `
}

function getSendIcon() {
  return `
    <svg viewBox="0 0 24 24" height="24px" width="24px">
      <path fill="#FFF" d="M2.01 21 23 12 2.01 3 2 10l15 2-15 2z"></path>
    </svg>
  `
}

function getClockIcon() {
  return `
    <svg fill="#d3d3d3" viewBox="0 0 24 24" height="24px" width="24px">
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm4.2 14.2L11 13V7h1.5v5.2l4.5 2.7-.8 1.3z" />
    </svg>
  `
}

function getVideoIcon() {
  return `
    <svg fill="#d3d3d3" viewBox="0 0 24 24" height="24px" width="24px" style="min-width: 24px;">
      <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" />
    </svg>
  `
}

function getCalendarIcon() {
  return `
    <svg fill="#d3d3d3" viewBox="0 0 24 24" height="24px" width="24px">
      <path d="M20 3h-1V1h-2v2H7V1H5v2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 18H4V8h16v13z" />
    </svg>
  `
}

function getGlobeIcon() {
  return `
    <svg fill="#d3d3d3" viewBox="0 0 24 24" height="24px" width="24px">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
    </svg>
  `
}

function getBackIcon() {
  return `
    <div style="position: relative;">
      <button id="backButton" class="back__button hidden">
        <svg fill="#800031" viewBox="0 0 24 24" height="40px" width="40px">
          <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
        </svg>
      </button>
    </div>
  `
}

function getCheckmark(name, host, email) {
  return `
    <div class="event__scheduled">
      <div class="checkmark">
        <svg viewBox="0 0 130.2 130.2">
          <circle class="path circle" fill="none" stroke="#73AF55" stroke-width="6" stroke-miterlimit="10" cx="65.1" cy="65.1" r="62.1"/>
          <polyline class="path check" fill="none" stroke="#73AF55" stroke-width="6" stroke-linecap="round" stroke-miterlimit="10" points="100.2,40.2 51.5,88.8 29.8,67.5 "/>
        </svg>
      </div>
      <p class="meeting__booked">${name}, you've booked a meeting with ${host}, please check your email, ${email} or your google calendar for the meeting invitation.</p>
    </div>
  `
}

// helpers

function handleMobileView() {
  if (confirmMeeting) {
    $('#logo').removeClass('hidden')
    $('#infoBlock').removeClass('hidden')
  } else if (selectedDay) {
    $('#calendar').addClass('hidden')
    $('#logo').addClass('hidden')
    $('#infoBlock').addClass('hidden')
    $('#calendarTitle').addClass('hidden')
    $('#detailsWrap').addClass('hidden')

    $('#backButton').removeClass('hidden')
    $('#dateTimeWrap').removeClass('hidden')

    $('#time').addClass('enabled')

    addMobileTimeInfoBlock()
    addMobileDurationInfoBlock()
  } else {
    $('#backButton').addClass('hidden')

    $('#logo').removeClass('hidden')
    $('#infoBlock').removeClass('hidden')
    $('#timeInfoWrap').remove()
    $('#time').removeClass('enabled')
    $('#calendar').removeClass('hidden')
    $('#calendarTitle').removeClass('hidden')
  }
}

function setIsMobile() {
  const { width } = visualViewport

  isMobile = width < 615
}

function guaranteeTwoDigits(numberToValidate) {
  return numberToValidate.toString().padStart(2, '0')
}

function beforeToday(dateToCompare) {
  const monthString = guaranteeTwoDigits(dateToCompare.getMonth())
  const dayString = guaranteeTwoDigits(dateToCompare.getDate())
  const dateToCompareAsNumber = +(dateToCompare.getFullYear() + monthString + dayString)

  if (todayAsNumber === dateToCompareAsNumber) return 0

  return dateToCompareAsNumber < todayAsNumber ? -1 : 1
}

function addDayButtonsClickListener(buttonIds) {
  for (const buttonId of buttonIds) {
    $(`#${buttonId}`)
      .off('click')
      .on('click', (event) => {
        createRipple(event)

        selectedTime = undefined

        if (selectedDay?.id === buttonId) {
          selectedDay.classList.remove('selected')
          $('#time').removeClass('enabled')
          selectedDay = undefined

          return
        }

        if (selectedDay) selectedDay.classList.remove('selected')

        selectedDay = document.getElementById(buttonId)
        selectedDay.classList.add('selected')

        isMobile && handleMobileView()

        fetchAvailability(buttonId)
      })
  }
}

function createRipple(event) {
  const button = event.currentTarget

  const circle = document.createElement('span')
  const diameter = Math.max(button.clientWidth, button.clientHeight)
  const radius = diameter / 2

  circle.style.width = circle.style.height = `${diameter}px`
  circle.style.left = `${event.clientX - button.offsetLeft - radius}px`
  circle.style.top = `${event.clientY - button.offsetTop - radius}px`
  circle.classList.add('ripple')

  const ripple = button.getElementsByClassName('ripple')[0]

  if (ripple) {
    ripple.remove()
  }

  button.appendChild(circle)
}

function calculateNewYearAndMonth(year, month, type) {
  let newMonth
  let newYear

  if (type === 'decrement') {
    newMonth = +month - 1 < 0 ? 11 : +month - 1
    newYear = +month === 0 ? +year - 1 : year
  } else {
    newMonth = (+month + 1) % 12
    newYear = +month === 11 ? +year + 1 : year
  }

  return [newYear, newMonth]
}

function buildDurationString(start, duration) {
  const startTimeArray = getShortTime(start).split(' ')
  const end = new Date(start + duration * 60000)
  const endTime = getShortTime(end.getTime())

  const startTime = startTimeArray[1] === endTime.split(' ')[1] ? startTimeArray[0] : startTimeArray.join(' ')

  return `${startTime} - ${endTime}, ${WEEKDAYS[end.getDay()]}, ${
    MONTHS[end.getMonth()]
  } ${end.getDate()}, ${end.getFullYear()}`
}

function getShortTime(time) {
  return new Date(time).toLocaleTimeString([], { timeStyle: 'short' })
}

// end helpers
