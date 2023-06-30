import React, { useState } from 'react'
import { useForm } from 'react-hook-form'

import { Button, MenuItem, Paper, Stack, TextField } from '@mui/material'
import { TextareaAutosize } from '@mui/base'
import { styled } from '@mui/material/styles'

import { keyOptions } from './KeySelector'

import { mapRefToInputRef } from '../utils/forms'
import { useSong } from '../data/hooks'
import { useEffect } from 'react'

const PREFIX = 'SongForm'

const classes = {
	textEditor: `${PREFIX}-textEditor`,
	textEditorWrapper: `${PREFIX}-textEditorWrapper`,
}

const StyledForm = styled('form', { name: PREFIX })(({ theme }) => ({
	flex: `1 0 0`,

	[`& .${classes.textEditor}`]: {
		border: 'none',
		fontFamily: 'monospace',
		fontSize: theme.typography.h6.fontSize,
		padding: theme.spacing(3),
		resize: 'none',
		height: '100%',
		width: '100%',
		whiteSpace: 'nowrap',

		'&:focus': {
			outline: 'none',
		},
	},

	[`& .${classes.textEditorWrapper}`]: {
		display: 'flex',
		flex: '1 0 50vh',
		overflow: 'auto',
		width: '100%',
	},
}))

const useSongForm = (songId, config) => {
	const { data: song } = useSong(songId)
	const [hasLoaded, setHasLoaded] = useState(false)
	const { register, reset, ...rest } = useForm({
		defaultValues: {
			title: song?.title || '',
			author: song?.author || '',
			key: song?.key || 'C',
			content: song?.content || '',
			parserType: 'chords-above-words',
		},
		...config,
	})

	useEffect(() => {
		if (song && !hasLoaded) {
			setHasLoaded(true)
			reset({
				title: song.title || '',
				author: song.author || '',
				key: song.key || 'C',
				content: song.content || '',
			})
		}
	}, [hasLoaded, reset, song])

	return {
		fields: {
			title: mapRefToInputRef(register('title')),
			author: mapRefToInputRef(register('author')),
			key: mapRefToInputRef(register('key')),
			content: mapRefToInputRef(register('content')),
			parserType: mapRefToInputRef(register('parserType')),
		},
		register,
		...rest,
	}
}

const SongForm = ({ onCancel, onChange, onSubmit, songId }) => {
	const { fields, formState, handleSubmit, register, reset, watch } =
		useSongForm(songId)

	const watchAllFields = Boolean(onChange) && watch()

	useEffect(() => {
		if (onChange) {
			onChange(watchAllFields)
		}
	}, [onChange, watchAllFields])

	const handleCancel = () => {
		onCancel && onCancel()
	}

	return (
		<StyledForm onSubmit={handleSubmit(onSubmit)}>
			<Stack spacing={1}>
				<TextField
					id={'title'}
					label={'Song title'}
					fullWidth
					margin={'dense'}
					{...fields['title']}
				/>
				<TextField
					id={'author'}
					label={'Authors (comma separated)'}
					fullWidth
					margin={'dense'}
					{...fields['author']}
				/>

				<Stack direction={'row'} spacing={1} pt={1}>
					<TextField
						select
						label={'Song Key'}
						margin={'none'}
						sx={{ width: '10ch' }}
						defaultValue={formState.defaultValues.key}
						{...fields['key']}
					>
						{keyOptions.map(option => (
							<MenuItem key={option.key} value={option.key}>
								{option.label}
							</MenuItem>
						))}
					</TextField>

					<TextField
						select
						label={'Parser Type'}
						margin={'none'}
						sx={{ width: '25ch' }}
						defaultValue={formState.defaultValues.parserType}
						{...fields['parserType']}
					>
						<MenuItem value={'chords-above-words'}>
							Chords above words
						</MenuItem>
						<MenuItem value={'chordpro'}>Onsong</MenuItem>
					</TextField>
				</Stack>

				<Paper className={classes.textEditorWrapper}>
					{/* <TextareaAutosize
						className={classes.textEditor}
						placeholder={
							'Type words and chords here. Add colons after section headings eg. Verse 1:'
						}
						{...register('content')}
					/> */}
					<textarea
						className={classes.textEditor}
						{...register('content')}
					/>
				</Paper>

				<Stack
					direction={'row'}
					spacing={1}
					sx={{ justifyContent: 'flex-end', pt: 2 }}
				>
					<Button onClick={() => reset(formState.defaultValues)}>
						Reset
					</Button>
					<Button onClick={handleCancel}>Cancel</Button>

					<Button
						color={'primary'}
						variant={'contained'}
						type={'submit'}
					>
						Save
					</Button>
				</Stack>
			</Stack>
		</StyledForm>
	)
}

export default React.memo(SongForm)
