!(function () {
	// Setup default configuration and merge with user-defined values
	window.$docsify = window.$docsify || {};
	const config = Object.assign(
		{
			DEBUG: false,
			viewerWidth: '100%',
			viewerHeight: '50rem',
			marginTop: '2rem',
			marginBottom: '5rem',
		},
		window.$docsify.pdf_embed || {},
	);

	const PDFContainers = [];

	/**
	 * Logs the given arguments if the DEBUG flag is set in the config.
	 *
	 * @param {...*} args - The arguments to be logged.
	 */
	function logVerbose(...args) {
		if (config.DEBUG) console.log(...args);
	}

	/**
	 * Determine if the current device is a mobile device.
	 *
	 * @return {boolean} True if the device is a mobile device, false otherwise.
	 */
	function isMobileDevice() {
		const userAgent =
			navigator.userAgent || navigator.vendor || window.opera;
		return /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(
			userAgent.substr(0, 4),
		);
	}

	/**
	 * Checks if a given URL is valid.
	 *
	 * @param {string} url - The URL to be validated.
	 * @return {boolean} Returns true if the URL is valid, otherwise false.
	 */
	function isValidURL(url) {
		const urlRegex =
			/^(http|https):\/\/[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi;
		return url.match(urlRegex);
	}

	/**
	 * Builds an absolute path based on a relative path.
	 *
	 * @param {string} relativePath - The relative path to build the absolute path from.
	 * @return {string} The absolute path.
	 */
	function buildAbsolutePath(relativePath) {
		return (
			window.location.protocol +
			'//' +
			window.location.hostname +
			'/' +
			relativePath
		);
	}

	/**
	 * Extracts the path of a PDF file from the given input string.
	 *
	 * @param {string} inputString - The input string from which the PDF path is to be extracted.
	 * @return {string|null} The extracted PDF path if found, otherwise null.
	 */
	function extractPDFPath(inputString) {
		const match = inputString.match(/[^/\\]+\.pdf\b/gi);
		return match ? match[0] : null;
	}

	/**
	 * A function that takes an original renderer and returns a custom renderer.
	 *
	 * @param {function} originalRenderer - The original renderer function.
	 * @return {function} The custom renderer function.
	 */
	function customRenderer(originalRenderer) {
		function uniqueIdGenerator() {
			return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
				/[xy]/g,
				function (c) {
					var r = (Math.random() * 16) | 0,
						v = c === 'x' ? r : (r & 0x3) | 0x8;
					return v.toString(16);
				},
			);
		}

		return function (code, lang) {
			if (lang === 'pdf') {
				const divId =
					'markdown_code_pdf_container_' + uniqueIdGenerator();

				PDFContainers.push({
					pdf_location: code,
					div_id: divId,
				});

				// Get the extracted pdf file/path and log it
				const pdfFileOrPath = extractPDFPath(code);
				if (pdfFileOrPath) {
					logVerbose(
						`Found location of %c${pdfFileOrPath}%c and pushed it to PDFContainers`,
						'color: red;',
						'color: black;',
					);
				} else {
					logVerbose(
						`Pushed a PDF location to PDFContainers without a discernible .pdf file/path.`,
					);
				}

				return `<div style="margin-top:${config.marginTop}; margin-bottom:${config.marginBottom};" id="${divId}"><a href="${code}"> Link </a> to ${code}</div>`;
			}

			// If not a PDF, and if there's an original renderer, call it
			if (originalRenderer) {
				return originalRenderer.apply(this, arguments);
			}

			// Default behavior for non-PDF content
			return code;
		};
	}

	// Setup Docsify Markdown rendering
	const docMarkdown = (window.$docsify.markdown =
		window.$docsify.markdown || {});
	const renderer = (docMarkdown.renderer =
		window.$docsify.markdown.renderer || {});
	renderer.code = customRenderer(renderer.code);

	const isMobileView = isMobileDevice();

	// Configure Docsify
	window.$docsify.executeScript = true;
	window.$docsify.plugins = [
		function (hook) {
			hook.init(() => {
				logVerbose('PDF Code Block Loader Plugin Initialized');
				logVerbose(
					`This is a ${
						isMobileView ? 'Mobile' : 'Non-mobile'
					} Viewer.`,
				);
			});

			hook.afterEach(function (html, next) {
				if (PDFContainers.length > 0) {
					if (isMobileView) {
						PDFContainers.forEach((container) => {
							const absolutePdfLocation = isValidURL(
								container.pdf_location,
							)
								? container.pdf_location
								: buildAbsolutePath(container.pdf_location);
							const viewLocation = `https://mozilla.github.io/pdf.js/web/viewer.html?file=${absolutePdfLocation}`;
							html += `<div id="${container.div_id}"><iframe style="overflow: auto; width: ${config.viewerWidth}; height: ${config.viewerHeight};" src="${viewLocation}" style="border: none;"></iframe></div>`;
						});
					} else {
						PDFContainers.forEach((container) => {
							html += `<div id="${container.div_id}"></div>`;
							setTimeout(() => {
								PDFObject.embed(
									container.pdf_location,
									`#${container.div_id}`,
									{
										height: config.viewerHeight,
										width: config.viewerWidth,
									},
								);
							}, 0);
						});
					}
				}

				// Clear containers after use
				PDFContainers.length = 0;
				next(html);
			});
		},
	].concat(window.$docsify.plugins || []);
})();
