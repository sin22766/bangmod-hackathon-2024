<script lang="ts">
	import { onMount } from 'svelte';
	import { inview } from 'svelte-inview';

	import { Section, currentSection } from '$lib/components/homes/Navbar/navbar';

	let backMountain: HTMLImageElement;
	let logo: HTMLElement;

	const scrollParallax = (event: MouseEvent) => {
		console.log("Scroll")
		if (!backMountain || !logo) return;
		const y = event.target.scrollTop;
		console.log(y);

		backMountain.style.transform = `scale(${y * 0.0025 + 1})`;

		if (window.innerWidth > 1024) return;
		logo.style.top = `${y * 1.05}px`;
	};

	onMount(() => {
		window.addEventListener('scroll', scrollParallax);

		return () => window.removeEventListener('scroll', scrollParallax);
	});
</script>

<div
	use:inview={{ rootMargin: '-10%' }}
	on:inview_enter={() => ($currentSection = Section.Hero)}
	class="relative h-screen w-full bg-gradient-to-b from-[#3E245D] via-[#EF4D91] to-[#FEEFA0]"
>
	<div
		bind:this={logo}
		class="
          absolute z-20 h-full w-full translate-y-48 transform md:z-30 xl:z-40 2xl:flex
          2xl:-translate-y-36
          2xl:justify-center
        "
	>
		<img class="m-auto w-2/3 md:w-2/5 2xl:w-1/3" src="/logo.webp" alt="" />
	</div>
	<img
		src="bg2.webp"
		alt=""
		class="
            absolute bottom-0 z-40 w-full translate-y-2 transform md:z-30 md:translate-y-[6rem]
          "
	/>
	<div class="absolute h-screen w-full">
		<div class="relative z-0 flex h-full w-full items-end justify-center">
			<img id="lampBack1" class="lamp absolute scale-[2] md:scale-100" src="/lampBack.svg" alt="" />
			<img id="lampBack2" class="lamp absolute scale-[2] md:scale-100" src="/lampBack.svg" alt="" />
			<img
				id="lampMid"
				class="lamp absolute scale-[1.5] md:scale-100"
				src="/lampFront.svg"
				alt=""
			/>
			<img
				id="lampFront"
				class="lamp absolute scale-[1.5] md:scale-100"
				src="/lampFront1.svg"
				alt=""
			/>
		</div>
	</div>
	<div
		class="absolute bottom-0 z-10
        w-full -translate-y-32 scale-[2.0] transform
        md:-translate-y-24 md:scale-[1.5]
        lg:-translate-y-2 lg:scale-[1.0]
      "
	>
		<img bind:this={backMountain} class="z-10 w-full" src="bg1.webp" alt="" />
		<div class="-mt-2 h-8 w-full bg-gradient-to-r from-[#763874] to-[#8F4581] md:h-32 lg:h-64" />
	</div>
</div>

<style>
	.lamp {
		animation-name: floatUp;
		animation-iteration-count: infinite;
	}

	#lampBack1 {
		animation-duration: 20s;
		animation-delay: 4s;
	}

	#lampBack2 {
		animation-duration: 17s;
		animation-delay: 2s;
	}

	#lampMid {
		animation-duration: 25s;
		animation-delay: 1s;
	}

	#lampFront {
		animation-duration: 17s;
		animation-delay: 3s;
	}

	@keyframes floatUp {
		0% {
			bottom: 0;
		}
		100% {
			bottom: 110%;
		}
	}
</style>
