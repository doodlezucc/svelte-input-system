<script lang="ts">
	import ExampleConditional from './example/ExampleConditional.svelte';

	let spawnExample = $state(true);
</script>

<input type="checkbox" bind:checked={spawnExample} />

<h1>Example (Conditional)</h1>

{#if spawnExample}
	<ExampleConditional />
{/if}
