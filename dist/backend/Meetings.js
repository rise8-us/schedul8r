// For / pre v1 use.
const PERSONAL_EMAIL = "jwills@rise8.us";
const PERSONAL_DISPLAY_NAME = "Jeffrey Wills";

const meetingTypes = {
    phone: {
        title: "Phone Screening",
        description: "Intial meeting to setup follow on meetings",
        duration: 15, //minutes
        hosts: [PERSONAL_EMAIL],
        calendar: PERSONAL_EMAIL,
        getNextHost: function () {return this.hosts[Math.floor(Math.random() * this.hosts.length)]}
    },
    swe_rpi: {
        title: "Pairing Session - Software",
        description: "Assess your technical and pairing abilities",
        duration: 60,
        hosts: [PERSONAL_EMAIL, 'dlamberson@rise8.us','akrish@rise8.us', 'pduong@rise8.us'],
        calendar: "SWE RPI",
        getNextHost: function () {return this.hosts[Math.floor(Math.random() * this.hosts.length)]}
    },
    pe_rpi: {
        title: "Pairing Session - Platform",
        description: "",
        duration: 90,
        hosts: [PERSONAL_EMAIL],
        calendar: PERSONAL_EMAIL,
        getNextHost: function () {return this.hosts[Math.floor(Math.random() * this.hosts.length)]}
    },
    culture: {
        title: "Culture Session",
        description: "",
        duration: 30,
        hosts: [PERSONAL_EMAIL],
        calendar: PERSONAL_EMAIL,
        getNextHost: function () {return this.hosts[Math.floor(Math.random() * this.hosts.length)]}
    },
    default: {
        title: "Sync up",
        description: "",
        duration: 60,
        hosts: [PERSONAL_EMAIL],
        calendar: PERSONAL_EMAIL,
        getNextHost: function () {return this.hosts[Math.floor(Math.random() * this.hosts.length)]}
    }
};

const meetingHosts = {
    [PERSONAL_EMAIL]: {
        email: PERSONAL_EMAIL,
        displayName: PERSONAL_DISPLAY_NAME,
        timeZone: 'America/New_York',
        officeHours: [9, 17],
        buffers: [0, 0], //not currently implemented
    },
    ['dlamberson@rise8.us']: {
        email: 'dlamberson@rise8.us',
        timeZone: 'America/New_York',
        displayName: 'Lambo',
        officeHours: [9, 17],
        buffers: [0, 0], //not currently implemented
    },
    ['akrish@rise8.us']: {
        email: 'akrish@rise8.us',
        timeZone: 'America/New_York',
        displayName: 'Krish',
        officeHours: [9, 17],
        buffers: [0, 0], //not currently implemented
    },
    ['pduong@rise8.us']: {
        email: 'pduong@rise8.us',
        displayName: 'Peter Duong',
        timeZone: 'America/Los_Angeles',
        officeHours: [9, 17],
        buffers: [0, 0], //not currently implemented
    }
};

function getMeetingDetails(meetingType) {
    return meetingTypes[meetingType] ?? meetingTypes.default;
}

function getMeetingHost(hostName) {
    return meetingHosts[hostName];
}

function getMeetingTypes() {
    return meetingTypes;
}

function getMeetingHosts() {
    return meetingHosts;
}
