<script lang="ts">
	import CurrentGuess from '$lib/components/CurrentGuess.svelte';
	import FutureGuess from '$lib/components/FutureGuess.svelte';
	import PastGuess from '$lib/components/PastGuess.svelte';
	import ResultsPage from '$lib/components/ResultsPage.svelte';
	import { search } from '$lib/search';
	import { ChevronRight, Archive, ChevronLeft } from '@o7/icon';
	import SONG_INFO from 'songs/info';
	import { page } from '$app/stores';
	import type { Puzzle } from '$lib/api';
	import type {
		SubmitGuessOutput,
		SubmitGuessInput,
	} from '$lib/server/submitGuess';
	import Dialogs from '$lib/components/Dialogs.svelte';
	import ErrorTooltip from '$lib/components/ErrorTooltip.svelte';
	import { get_local_session } from '$lib/local-session.svelte';
	import SpeedrunTimer from '$lib/components/SpeedrunTimer.svelte';
	import { get_settings } from '$lib/settings.svelte';

	const {
		puzzle: puzzle_in,
		is_archive,
	}: { puzzle: Puzzle; is_archive: boolean } = $props();

	let puzzle = $state(puzzle_in);
	$effect(() => {
		puzzle = puzzle_in;
	});

	const params = $derived($page.url.search);

	let submit_error = $state<string | undefined>(undefined);
	let submit_pending = $state(false);
	const api_root = $derived.by(() => {
		if ($page.url.pathname.startsWith('/archive/')) {
			return `${$page.url.pathname}/api`;
		}
		return '/api';
	});
	async function submit_guess(input: SubmitGuessInput) {
		submit_pending = true;
		submit_error = undefined;
		try {
			const res = await fetch(`${api_root}/guess${params}`, {
				method: 'POST',
				body: JSON.stringify(input),
			});
			if (!res.ok) {
				const text = await res.text();
				let message = text;
				try {
					const json = JSON.parse(text);
					if ('message' in json) {
						message = json.message;
					}
				} catch (_) {
					/* ignore */
				}
				throw new Error(message);
			}
			const result = await res.json<SubmitGuessOutput>();

			// Process result
			const song = puzzle.songs[input.songIndex]!;
			song.done = result.done;
			song.answer = result.answer;
			song.guessIndex = result.guessIndex;

			const raw = input.guess ?? '';
			const song_name =
				input.guess === null ? null : (search(input.guess)?.name ?? null);

			song.clues[input.guessIndex]!.guess = {
				raw,
				song: song_name,
				correct: result.correct,
			};
			if (song.done) {
				local_session.stop_timer(puzzle.songIndex);
			}
		} catch (e) {
			if (e instanceof Error) {
				submit_error = e.message;
			} else {
				submit_error = String(e);
			}
		} finally {
			submit_pending = false;
		}
	}

	let next_song_button = $state<HTMLButtonElement>();
	let next_song_error = $state<ErrorTooltip>();

	let next_song_pending = $state(false);
	async function next_song() {
		next_song_pending = true;
		next_song_error?.clear();
		try {
			const res = await fetch(`${api_root}/next${params}`, {
				method: 'POST',
			});
			if (!res.ok) {
				const text = await res.text();
				let message = text;
				try {
					const json = JSON.parse(text);
					if ('message' in json) {
						message = json.message;
					}
				} catch (_) {
					/* ignore */
				}
				throw new Error(message);
			}
			if (puzzle.songIndex >= puzzle.songs.length - 1) {
				puzzle.done = true;
				return;
			}
			puzzle.songIndex++;
		} catch (err) {
			const message = err instanceof Error ? err.message : String(err);
			next_song_error?.show(message, next_song_button!, undefined, 'top');
		} finally {
			next_song_pending = false;
		}
	}

	$effect(() => {
		// eslint-disable-next-line @typescript-eslint/no-unused-expressions
		puzzle.songs[puzzle.songIndex]!.guessIndex;
		const next_input = document.getElementById('current-guess');
		next_input?.focus();
	});

	$effect(() => {
		if (puzzle.songs[puzzle.songIndex]!.done) {
			const button = document.getElementById('next-song');
			button?.focus();
		}
	});

	const song = $derived(puzzle.songs[puzzle.songIndex]!);

	const audioUrls = $derived.by(() => {
		return song.clues.map(
			(_, index) =>
				`/clue/${puzzle.date}/${puzzle.songIndex}/${index}.flac${params}`,
		);
	});

	const dots = $derived.by(() => {
		return puzzle.songs.map((song, i) => {
			if (i > puzzle.songIndex) {
				return { bg: '' };
			}
			const correct = song.clues.some((c) => c.guess?.correct);
			return {
				bg: !song.done
					? 'bg-lightpink'
					: correct
						? 'bg-green-500'
						: 'bg-red-500',
				c: i === puzzle.songIndex,
			};
		});
	});

	const settings = get_settings();
	const local_session = get_local_session();
</script>

{#if puzzle.done}
	<ResultsPage {puzzle} {is_archive} />
{:else}
	<div class="relative w-96 max-w-full text-center font-bold sm:text-xl">
		<a
			class="absolute left-0 top-0 p-0.5 hover:scale-110 active:scale-95"
			aria-label="Archive"
			title="Play past games"
			href="/archive"
		>
			{#if is_archive}
				<ChevronLeft />
			{:else}
				<Archive />
			{/if}
		</a>
		<Dialogs {puzzle} />
		{#if settings.speedrun}
			<SpeedrunTimer class="absolute bottom-0 right-0" />
		{/if}
		{#if is_archive}
			<div title="Archived" class="flex items-center justify-center gap-1">
				<Archive class="inline align-text-top" />
				<span>Day #{puzzle.dayIndex}</span>
			</div>
		{:else}
			<p>Day #{puzzle.dayIndex}</p>
		{/if}
		<div class="mx-auto my-1 flex items-center justify-center gap-2">
			{#each dots as dot}
				<div
					class:border-4={dot.c}
					class:border-2={!dot.c}
					class="{dot.bg} size-5 rounded-full border-white"
				></div>
			{/each}
		</div>
		<p>Song {puzzle.songIndex + 1} / {puzzle.songs.length}</p>
	</div>
	{#each song.clues as clue, index}
		{#if song.guessIndex === index && !song.done}
			<CurrentGuess
				{clue}
				done={song.done}
				audio_url={audioUrls[index] as string}
				{submit_error}
				{submit_pending}
				onguess={(guess) => {
					local_session.start_timer(puzzle.songIndex);
					submit_guess({
						date: puzzle.date,
						songIndex: puzzle.songIndex,
						guessIndex: song.guessIndex,
						guess,
					});
				}}
				song_index={puzzle.songIndex}
				past_guesses={song.clues}
			/>
		{:else if clue.guess}
			<PastGuess
				{clue}
				song_index={puzzle.songIndex}
				done={song.done}
				audio_url={audioUrls[index] as string}
			/>
		{:else}
			<FutureGuess
				{clue}
				song_index={puzzle.songIndex}
				done={song.done}
				audio_url={audioUrls[index] as string}
			/>
		{/if}
	{/each}

	{#if song.done}
		{@const info = SONG_INFO[song.answer!]!}
		{@const link =
			typeof info.l === 'string'
				? info.l
				: `https://tidal.com/browse/track/${info.l}?u`}
		<div
			class="relative mt-8 flex flex-col items-center gap-4 rounded-lg border border-black/50 bg-lightpink px-4 py-3 text-black shadow-[0.25rem_0.25rem_0_0px] shadow-shadow sm:flex-row"
		>
			<div class="flex max-w-80 items-center gap-2">
				<a
					href={link}
					class="size-20 shrink-0 overflow-hidden rounded-md bg-pink"
					target="_blank"
					rel="noreferrer"
				>
					<img
						class="h-full w-full"
						src="/covers/{info.c}.webp"
						alt="Cover art"
					/>
				</a>
				<div>
					<a
						href={link}
						class="text-xl font-medium hover:underline"
						target="_blank"
						rel="noreferrer"
						>{song.answer}
					</a>
					<p>{info.a.replace('%', 'Porter Robinson')}</p>
				</div>
			</div>
			<button
				id="next-song"
				bind:this={next_song_button}
				class="group flex items-center gap-1 whitespace-nowrap rounded-full bg-pink px-4 py-2 font-bold text-black ring-black transition-shadow hover:ring-1 focus:ring-1"
				disabled={next_song_pending}
				onclick={() => {
					next_song();
				}}
			>
				{#if puzzle.songIndex >= puzzle.songs.length - 1}
					View Results
				{:else}
					Song {puzzle.songIndex + 2}
				{/if}
				<ChevronRight
					class="transition-transform group-hover:translate-x-1 group-focus:translate-x-1"
				/>
			</button>
		</div>
	{/if}
{/if}
<ErrorTooltip bind:this={next_song_error} />
