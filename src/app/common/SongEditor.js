import {isNil} from 'lodash';
import slugify from 'slugify';
import PouchDB from 'pouchdb';
import PouchDBFindPlugin from 'pouchdb-find';

import {parseSong} from '../sheet/Sheet.js';
import Song from './Song.js';
import './SongEditor.scss';

PouchDB.plugin( PouchDBFindPlugin );

const db = new PouchDB( 'chordboard' );

db.createIndex( {
	index: { fields: [ 'type', 'slug' ] }
} );

class SongEditor extends PreactComponent {
	state = {
		author:    '',
		isLoading: false,
		title:     '',
		content:   '',
		song:      null
	};

	componentDidMount() {
		this.handleProps( this.props );
	}

	componentWillReceiveProps( nextProps ) {
		this.handleProps( nextProps );
	}

	handleProps = props => {

		this.setState( {
			isLoading: true
		} );

		if ( props.slug ) {

			db.find( {
				selector: {
					type: 'song',
					slug: props.slug
				}
			} ).then( result => {

				const song = new Song( result.docs[ 0 ] );

				this.setState( {
					author:    song.author,
					isLoading: false,
					title:     song.title,
					content:   song.content,
					song:      song
				} );

			} ).catch( err => {

				console.error( 'Sheet.handleProps -', err );

				this.setState( {
					author:    '',
					isLoading: false,
					title:     '',
					content:   '',
					song:      null
				} );

			} );

		}

	};

	onAuthorInput = event => {
		this.setState( { author: event.target.value } );
	};

	onContentInput = event => {
		const content = event.target.value;
		const song = Object.assign( {}, this.state.song, { content } );
		this.setState( { content, song } );
	};

	onTitleInput = event => {
		this.setState( { title: event.target.value } );
	};

	onSaveSong = () => {

		const { author, content, title, song } = this.state;
		const isNew = isNil( song._id );

		if ( isNew ) {

			// First check to see if the slug already exists.
			db.find( {
				selector: {
					type: 'song',
					slug: slugify( title )
				}
			} ).then( result => {

				if ( result.docs.length ) {

					// Slug already exists
					alert( 'Slug already exists' );

					// TODO: make the slug unique by appending a number to the
					// end Note: If we wanted to allow duplicate slugs across
					// database but unique per user, we would require some kind
					// of user context in the url. Something like what GitHub
					// do with the username first.

				} else {

					db.post( {
						type:    'song',
						users:   [ 'justin' ],
						slug:    slugify( title ),
						author:  author,
						title:   title,
						content: content
					} ).then( () => {

						alert( 'Added new task!');

						//TODO
						//PouchDB.sync( 'chordboard',
						// 'http://localhost:5984/chordboard' );

					} );

				}

			} ).catch( err => {
				console.error( err );
			} );

		} else {

			const data = Object.assign( {}, song );

			console.log( "put", data );

			data.author = author;
			data.content = content;
			data.slug = slugify( title );
			data.title = title;

			db.put( data ).then( () => {

				alert( 'Updated successfully!' );

				//TODO
				//PouchDB.sync( 'chordboard',
				// 'http://localhost:5984/chordboard' );

			} ).catch( err => {
				console.error( err );
			} );

		}

	};

	render( {}, { author, title, content, song } ) {

		return (
			<div class="song-editor">
				<div class="song-editor__left-column">
					<input
						type="text"
						class="song-editor__title"
						onInput={this.onTitleInput}
						placeholder="Title"
						value={title}/>
					<input
						type="text"
						class="song-editor__author"
						onInput={this.onAuthorInput}
						placeholder="Author"
						value={author}/>
					<textarea
						class="song-editor__content"
						onInput={this.onContentInput}
						placeholder="Content"
						rows="25"
					>
						{content}
					</textarea>
					<button onClick={this.onSaveSong}>Save</button>
				</div>

				<div class="song-editor__right-column">
					<div class="song-editor__preview">
						<div class="song-editor__preview-title">
							{title}
						</div>
						<div class="song-editor__preview-author">
							{author}
						</div>
						<div class="song-editor__preview-content">
							{parseSong( new Song( song ), [] )}
						</div>
					</div>
				</div>
			</div>
		);

	}
}

export default SongEditor;
