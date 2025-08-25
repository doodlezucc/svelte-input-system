<script lang="ts" module>
	import { getContext } from 'svelte';

	const CONTEXT_KEY = Symbol('input-layer');

	export interface InputLayerContext {}

	export function useInputLayer() {
		return getContext<InputLayerContext>(CONTEXT_KEY);
	}
</script>

<script lang="ts">
</script>
