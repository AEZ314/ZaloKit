<svelte:head>
	<script>
		(function () {
			try {
				var raw = localStorage.getItem('theme'); // PersistedState stores JSON (e.g. "\"dark\"")
				var t;

				try {
					t = raw ? JSON.parse(raw) : 'dark';
				} catch (e) {
					// parse JSON string
					t = raw || 'dark';
				} // fallback if format changes later

				if (t !== 'light' && t !== 'dark' && t !== 'soft') t = 'dark';

				var el = document.documentElement;
				el.classList.remove('light', 'dark', 'soft');
				el.classList.add(t);
			} catch (e) {}
		})();
	</script>
</svelte:head>
