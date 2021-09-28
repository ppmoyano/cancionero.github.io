import React, { Component } from 'react'
import { styled } from '@material-ui/core/styles';
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd'
import uniqBy from 'lodash/fp/uniqBy'

import { parseISO } from 'date-fns'

import withStyles from '@mui/styles/withStyles';
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import Grid from '@mui/material/Grid'
import Grow from '@mui/material/Grow'
import Hidden from '@mui/material/Hidden'
import IconButton from '@mui/material/IconButton'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'

import * as actions from '../redux/actions'
import DateSignifier from './DateSignifier'
import Hero from './Hero'
import SetSongRow from './SetSongRow'
import SetFormContainer from '../containers/SetFormContainer'
import SongSelectorDialog from '../containers/SongSelectorDialog'
import { Pencil as PencilIcon } from 'mdi-material-ui'

const PREFIX = 'SetViewer';

const classes = {
    form: `${PREFIX}-form`,
    formFooter: `${PREFIX}-formFooter`,
    deleteButton: `${PREFIX}-deleteButton`
};

const Root = styled('div')((
    {
        theme
    }
) => ({
    [`& .${classes.form}`]: theme.mixins.gutters({
		paddingBottom: theme.spacing(2),
		paddingTop: theme.spacing(2),
		width: 500,
	}),

    [`& .${classes.formFooter}`]: {
		marginTop: theme.spacing(2),
	},

    [`& .${classes.deleteButton}`]: {
		color: theme.palette.error.main,
	}
}));

class SetViewer extends Component {
	static propTypes = {
		classes: PropTypes.object,
		history: PropTypes.object,
		onChangeKey: PropTypes.func,
		onRemoveSet: PropTypes.func,
		onSongMove: PropTypes.func,
		user: PropTypes.object,
		// Redux props
		set: PropTypes.object,
		updateSet: PropTypes.func.isRequired,
	}

	state = {
		isLoading: false,
		isSongSelectorVisible: false,
		mode: '',
	}

	componentDidMount() {
		this.handleProps({})
	}

	componentDidUpdate(prevProps) {
		this.handleProps(prevProps)
	}

	handleProps = prevProps => {
		const { set } = this.props
		if (set && prevProps.set && prevProps.set.title !== set.title) {
			document.title = 'Set: ' + set.title
		}
	}

	handleAddASong = () => this.setState({ isSongSelectorVisible: true })

	handleSaveSet = data => {
		data.id = this.props.set.id
		this.props.updateSet(data)
		this.toggleEditMode(false)()
	}

	handleDeleteSet = () => this.props.onRemoveSet && this.props.onRemoveSet()

	handleDragEnd = ({ destination, source }) => {
		const set = { ...this.props.set }
		const setSongs = Array.from(set.songs)

		const [song] = setSongs.splice(source.index, 1)
		setSongs.splice(destination.index, 0, song)

		set.songs = setSongs

		if (set) {
			this.props.setCurrentSetId(set.id)
			this.props.updateSet(set)
		}
	}

	handleSongSelectorClose = setSongs => {
		this.setState({ isSongSelectorVisible: false })
		const set = { ...this.props.set }
		set.songs = uniqBy('id')([...set.songs, ...setSongs])
		this.handleSaveSet(set)
	}

	changeKey = (songId, amount) =>
		this.props.onChangeKey && this.props.onChangeKey(songId, amount)

	toggleEditMode = value => () => this.setState({ mode: value ? 'edit' : '' })

	transposeDown = song => this.changeKey(song.id, -1)
	transposeUp = song => this.changeKey(song.id, 1)

	renderTableContent = provided => {
		const { set } = this.props
		const { mode } = this.state
		return (
			<TableBody {...provided.droppableProps}>
				{set.songs.length ? (
					set.songs.map((song, index) => (
						<Draggable
							draggableId={song.id}
							index={index}
							isDragDisabled={mode !== 'edit'}
							key={song.id}
						>
							{provided => (
								<SetSongRow
									mode={mode}
									onChangeKey={this.changeKey}
									provided={provided}
									setId={set.id}
									setKey={song.key}
									songIndex={index}
									songId={song.id}
								/>
							)}
						</Draggable>
					))
				) : (
					<TableRow key={'id-none'}>
						<TableCell />

						<TableCell>
							<Typography variant={'h6'}>
								This set has no songs
							</Typography>
						</TableCell>
					</TableRow>
				)}
				{provided.placeholder}
			</TableBody>
		)
	}

	render() {
		const { set, } = this.props
		const { mode, isSongSelectorVisible } = this.state
		if (!(set.setDate instanceof Date) && !isNaN(set.setDate)) {
			console.log(
				'TODO: setviewer needs work - setDate is not a javascript date'
			)
			set.setDate = parseISO(set.setDate)
		}

		return set ? (
			<Root className={'set-viewer'}>
				<Hero>
					<Grid container spacing={1}>
						<Grid item xs>
							{mode === 'edit' ? (
								<SetFormContainer
									initialValues={{
										author: set.author,
										setDate: set.setDate,
										title: set.title,
										venue: set.venue,
									}}
									onCancel={this.toggleEditMode(false)}
									onDelete={this.handleDeleteSet}
									onSubmit={this.handleSaveSet}
									isEdit
								/>
							) : (
								<Grid container spacing={3}>
									<Hidden mdDown>
										<Grid item>
											<Grow
												in={Boolean(set.setDate)}
												mountOnEnter
											>
												<div>
													{set.setDate && (
														<DateSignifier
															date={set.setDate}
														/>
													)}
												</div>
											</Grow>
										</Grid>
									</Hidden>
									<Grid item>
										<Typography variant={'h4'}>
											{set.title}
										</Typography>
										<Typography variant={'caption'}>
											{set.author}
											{set.venue ? ' @ ' + set.venue : ''}
										</Typography>
									</Grid>
								</Grid>
							)}
						</Grid>

						{mode !== 'edit' && (
							<Grid item>
								<Hidden smUp>
									<IconButton
										size={'small'}
										variant={'contained'}
										aria-label={'Edit'}
										onClick={this.toggleEditMode(
											mode !== 'edit'
										)}
									>
										<PencilIcon />
									</IconButton>
								</Hidden>
								<Hidden only={'xs'}>
									<Button
										onClick={this.toggleEditMode(
											mode !== 'edit'
										)}
										variant={'contained'}
									>
										Edit set
									</Button>
								</Hidden>
								<Button
									color={'primary'}
									onClick={this.handleAddASong}
									variant={'contained'}
								>
									<Hidden only={'xs'}>Add a song</Hidden>
									<Hidden smUp>Add</Hidden>
								</Button>
							</Grid>
						)}

						<Grid item>
							<SongSelectorDialog
								onClose={this.handleSongSelectorClose}
								open={isSongSelectorVisible}
							/>
						</Grid>
					</Grid>
				</Hero>

				<section className={'section'}>
					<Container maxWidth={'xl'}>
						<Table
							className={classes.table}
							aria-labelledby={'tableTitle'}
						>
							<TableHead>
								<TableRow>
									{mode === 'edit' && (
										<TableCell
											padding={'checkbox'}
											style={{ width: 0 }}
										>
											Move
										</TableCell>
									)}
									<TableCell
										padding={'checkbox'}
										style={{ width: 0 }}
									>
										#
									</TableCell>
									<TableCell>Song</TableCell>
									<TableCell
										padding={'checkbox'}
										style={{ width: 0 }}
									>
										Key
									</TableCell>
									{mode === 'edit' && (
										<TableCell
											padding={'checkbox'}
											style={{ width: 0 }}
										>
											Delete
										</TableCell>
									)}
								</TableRow>
							</TableHead>

							<DragDropContext onDragEnd={this.handleDragEnd}>
								<Droppable droppableId={'droppable'}>
									{provided => (
										<>
											{this.renderTableContent(provided)}
										</>
									)}
								</Droppable>
							</DragDropContext>
						</Table>
					</Container>
				</section>
			</Root>
		) : null;
	}
}

const mapStateToProps = (state, ownProps) => ({
	set: state.sets.byId[ownProps.setId],
})

export default connect(mapStateToProps, actions)((SetViewer))
