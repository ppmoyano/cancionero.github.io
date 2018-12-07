import React, { Component } from 'react'
import { reverse, sortBy } from 'lodash'
import { Link } from 'react-router-dom'

import Button from '@material-ui/core/Button'
import Grid from '@material-ui/core/Grid'
import InputAdornment from '@material-ui/core/InputAdornment'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import TextField from '@material-ui/core/TextField'
import Typography from '@material-ui/core/Typography'

import ContentLimiter from './ContentLimiter'
import DateSignifier from './DateSignifier'
import Hero from './Hero'
import SetLink from './SetLink'

import { Magnify as MagnifyIcon } from 'mdi-material-ui'

class SetList extends Component {
	state = {
		searchText: ''
	}

	componentDidMount() {
		//Set the page title to make it easier to locate
		document.title = 'Setlists'
	}

	filterSets = set => {
		return (
			set.title.toLowerCase().includes(this.state.searchText) ||
			set.author.toLowerCase().includes(this.state.searchText)
		)
	}

	handleSearchChange = event => {
		this.setState({
			searchText: event.target.value
		})
	}

	render() {
		const { setFocusedSet, sets = [] } = this.props
		const { searchText } = this.state

		return (
			<div>
				<Hero>
					<ContentLimiter>
						<Grid container justify="space-between">
							<Grid item>
								<Typography variant="h4" color="inherit">
									Sets
								</Typography>
							</Grid>
							<Grid item>
								<Grid container spacing={16} alignItems="center">
									<Grid item>
										<TextField
											color="inherit"
											label="Titles, authors"
											onChange={this.handleSearchChange}
											value={searchText}
											InputProps={{
												endAdornment: (
													<InputAdornment position="end">
														<MagnifyIcon />
													</InputAdornment>
												)
											}}
										/>
									</Grid>
									<Grid item>
										<Link to="/sets/new">
											<Button color="primary" variant="contained">
												New set
											</Button>
										</Link>
									</Grid>
								</Grid>
							</Grid>
						</Grid>
					</ContentLimiter>
				</Hero>
				<ContentLimiter>
					<Table>
						<TableHead>
							<TableRow>
								<TableCell>Date</TableCell>
								<TableCell>Set</TableCell>
							</TableRow>
						</TableHead>

						<TableBody>
							{reverse(sortBy(sets.filter(this.filterSets), 'setDate')).map(
								set => (
									<TableRow key={set.id}>
										<TableCell>
											<DateSignifier date={set.setDate} />
										</TableCell>

										<TableCell>
											<SetLink setFocusedSet={setFocusedSet} set={set}>
												<Typography variant="title" gutterBottom>
													{set.title}
												</Typography>
											</SetLink>
											<Typography>{set.author}</Typography>
										</TableCell>
									</TableRow>
								)
							)}
						</TableBody>
					</Table>
				</ContentLimiter>
			</div>
		)
	}
}

export default SetList
