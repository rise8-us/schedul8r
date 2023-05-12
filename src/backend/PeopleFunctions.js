function getProfileByEmail(email) {
  const person = People.People.searchDirectoryPeople({
    query: email,
    readMask: 'names,photos,organizations',
    sources: ['DIRECTORY_SOURCE_TYPE_DOMAIN_PROFILE'],
  }).people[0]

  const { photos, organizations, names } = person

  return {
    name: names?.[0]?.displayName || email,
    photo: photos?.[0]?.url,
    title: organizations?.[0]?.title,
  }
}
