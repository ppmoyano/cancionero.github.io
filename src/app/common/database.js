import {uniqBy} from 'lodash';
import PouchDB from 'pouchdb';
import PouchDBFindPlugin from 'pouchdb-find';

PouchDB.plugin( PouchDBFindPlugin );

export const db = new PouchDB( 'chordboard' );

db.createIndex( {
	index: { fields: [ 'type' ] }
} );

const remoteDbSettings = {
	adapter: 'http',
	auth:    {
		username: 'justinlawrence',
		password: 'cXcmbbLFO8'
	}
};
const localDB = new PouchDB( 'chordboard' );
const remoteDB = new PouchDB( 'https://couchdb.cloudno.de/chordboard', remoteDbSettings );

export const sync = localDB.sync( remoteDB, {
	live:  true,
	retry: true
} );

export const Sets = {
	addSongToSet: ( setId, song ) => {

		return db.get( setId ).then( doc => {

			doc.songs.push( {
				_id: song._id,
				key: song.key
			} );
			doc.songs = uniqBy( doc.songs, '_id' );

			return db.put( doc ).catch( err => {

				if ( err.name === 'conflict' ) {

					console.error( 'database - pouchdb query conflict: Sets.addSongToSet', err );

				} else {

					console.error( 'database - pouchdb query failed: Sets.addSongToSet', err );

				}

			} );

		} );

	},
	getAll:       () => {

		return db
			.find( {
				selector: {
					type: 'set'
				}
			} )
			.then( result => result.docs )
			.catch( err => {
				console.warn( 'database - pouchdb query failed: Sets.getAll', err );
			} );

	}
};

export default db;