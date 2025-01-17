import Parser from '../parsers/song-parser'
import find from 'lodash/fp/find'
import forEach from 'lodash/fp/forEach'
import toLower from 'lodash/toLower'

// prettier-ignore
export const sectionData = [
	{ abbreviation: 'BR', color: '#03a9f4', title: 'Bridge' },
	{ abbreviation: 'BR1', color: '#03a9f4', title: 'Bridge 1' },
	{ abbreviation: 'BR2', color: '#03a9f4', title: 'Bridge 2' },
	{ abbreviation: 'CH', color: '#ff5252', title: 'Chorus' },
	{ abbreviation: 'CH1', color: '#ff5252', title: 'Chorus 1' },
	{ abbreviation: 'CH2', color: '#ff5252', title: 'Chorus 2' },
	{ abbreviation: 'CH3', color: '#ff5252', title: 'Chorus 3' },
	{ abbreviation: 'CH4', color: '#ff5252', title: 'Chorus 4' },
	{ abbreviation: 'PC', color: '#ff9800', title: 'Pre-chorus', regex: /^pre[-\s]?chorus:?$/i },
	{ abbreviation: 'PC1', color: '#ff9800', title: 'Pre-chorus 1', regex: /^pre[-\s]?chorus\s1:?$/i },
	{ abbreviation: 'PC2', color: '#ff9800', title: 'Pre-chorus 2', regex: /^pre[-\s]?chorus\s2:?$/i },
	{ abbreviation: 'IN', color: '#00bcd4', title: 'Intro' },
	{ abbreviation: 'OUT', color: '#444', title: 'Outro', regex: /^out(ro|tro)?:?$/i },
	{ abbreviation: 'END', color: '#444', title: 'End' },
	{ abbreviation: 'INT', color: 'silver', title: 'Interlude' },
	{ abbreviation: 'INS1', color: 'silver', title: 'Interlude 1' },
	{ abbreviation: 'INS2', color: 'silver', title: 'Interlude 2' },
	{ abbreviation: 'INST', color: 'silver', title: 'Instrumental' },
	{ abbreviation: 'TAG', color: '#444', title: 'Tag' },
	{ abbreviation: 'TAG1', color: '#444', title: 'Tag 1' },
	{ abbreviation: 'TAG2', color: '#444', title: 'Tag 2' },
	{ abbreviation: 'HOOK', color: '#444', title: 'Hook' },
	{ abbreviation: 'V', color: '#444', title: 'Verse' },
	{ abbreviation: '1', color: '#444', title: 'Verse 1' },
	{ abbreviation: '2', color: '#444', title: 'Verse 2' },
	{ abbreviation: '3', color: '#444', title: 'Verse 3' },
	{ abbreviation: '4', color: '#444', title: 'Verse 4' },
	{ abbreviation: '5', color: '#444', title: 'Verse 5' },
	{ abbreviation: '6', color: '#444', title: 'Verse 6' },
	{ abbreviation: '7', color: '#444', title: 'Verse 7' },
	{ abbreviation: '8', color: '#444', title: 'Verse 8' },
	{ abbreviation: '9', color: '#444', title: 'Verse 9' },
	{ abbreviation: '10', color: '#444', title: 'Verse 10' },
	{ abbreviation: '10', color: '#444', title: 'Verse 11' },
]

export const getSectionFromTitle = title =>
	find(section => {
		if (section.regex) {
			return section.regex.test(title)
		} else {
			return toLower(section.title) === toLower(title)
		}
	})(sectionData) || {}

const getSections = lines => {
	const sections = []
	let sectionIndex = 0

	forEach(line => {
		if (line.type === 'section') {
			const section = getSectionFromTitle(line.text)
			sections.push({
				abbreviation: section.abbreviation,
				color: section.color,
				title: section.title,
				index: sectionIndex,
			})
			console.log({ section, line })
			sectionIndex++
		}
	})(lines)

	return sections
}

const getSongSections = song => {
	if (!song) return []
	const parser = new Parser()
	const lines = parser.parse(song.content)
	return getSections(lines)
}

export default getSongSections
