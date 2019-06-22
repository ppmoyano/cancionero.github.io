import { call, put, select, takeEvery } from 'redux-saga/effects'
import { eventChannel } from 'redux-saga'
import slugify from 'slugify'
import { format } from 'date-fns'
import map from 'lodash/fp/map'
import pick from 'lodash/fp/pick'
import filter from 'lodash/fp/filter'

import { db } from '../../firebase'
import {
	ADD_SET,
	REMOVE_SET,
	REMOVE_SET_SONG,
	UPDATE_SET,
	mergeSets,
	removeSet,
	setSetSongs,
} from '../actions'

const setsCollection = db.collection('sets')

const setsChannel = () =>
	eventChannel(emitter => {
		setsCollection.onSnapshot(querySnapshot => {
			const sets = []
			querySnapshot.forEach(snapshot => {
				const data = snapshot.data()
				if (typeof data.setDate === 'object') {
					data.setDate = format(
						new Date(data.setDate.seconds * 1000),
						'yyyy-MM-dd'
					)
				}
				sets.push({ id: snapshot.id, ...data })
			})
			emitter(sets)
		})
		return () => {}
	})

export function* setsSaga() {
	const setsChan = yield call(setsChannel)
	yield takeEvery(setsChan, handleSetsEvent)
	yield takeEvery(ADD_SET, handleAddSet)
	yield takeEvery(REMOVE_SET, handleRemoveSet)
	yield takeEvery(REMOVE_SET_SONG, handleRemoveSetSong)
	yield takeEvery(UPDATE_SET, handleUpdateSet)
}

function* handleAddSet({ payload: newSet }) {
	const state = yield select()
	newSet.author = state.user.name
	newSet.slug = slugify(newSet.title)
	newSet.songs = newSet.songs || []

	const set = yield setsCollection.add(newSet)
	yield put(
		mergeSets([
			{
				...newSet,
				id: set.id,
			},
		])
	)
}

function* handleRemoveSet({ payload: setId }) {
	yield setsCollection.doc(setId).delete()
	yield put(removeSet(setId))
}

function* handleRemoveSetSong({ payload }) {
	const state = yield select()
	const set = state.sets.byId[payload.setId]
	const songs = filter(s => s.id !== payload.songId)(set.songs)
	set.songs = songs
	yield put(setSetSongs(payload.setId, songs))
	yield setsCollection.doc(payload.setId).update({ songs })
}

function* handleUpdateSet({ payload: set }) {
	if (set.title) {
		set.slug = slugify(set.title)
	}
	if (set.date) {
		set.setDate = set.date
	}

	yield put(mergeSets([set]))

	if (set.songs) {
		const setSongs = []
		for (let i = 0; i < set.songs.length; i++) {
			const song = set.songs[i]
			setSongs.push({
				id: song.id,
				key: song.key,
			})
		}

		set.songs = setSongs
	}

	yield setsCollection.doc(set.id).update(set)
}

function* handleSetsEvent(sets) {
	const formattedSets = map(set => {
		set.songs = map(song => pick(['id', 'key'])(song))(set.songs)
		return set
	})(sets)
	yield put(mergeSets(formattedSets))
}