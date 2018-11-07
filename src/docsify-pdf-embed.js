const DEBUG = 1;
const PDF_VIEWER_WIDTH = '100%';
const PDF_VIEWER_HEIGHT = '50rem';
const PDF_MARGIN_TOP = '2rem';
const PDF_MARGIN_BOTTOM = '5rem';

! function() {
	var verbose_log = function(log){
		if (DEBUG) {
			console.log(log);
		}
	}

	var renderer_func = function(code, lang, base=null) { 
		var pdf_renderer = function(code, lang, verify) {
			function unique_id_generator(){
				function rand_gen(){
					return Math.floor((Math.random()+1) * 65536).toString(16).substring(1);
				}
				return rand_gen() + rand_gen() + '-' + rand_gen() + '-' + rand_gen() + '-' + rand_gen() + '-' + rand_gen() + rand_gen() + rand_gen();
			}
			if(!lang.localeCompare('pdf', 'en', {sensitivity: 'base'})){
				if(verify){
					return true;
				}else{
					var divId = "markdown_code_pdf_container_" + unique_id_generator().toString();
					var container_list = new Array();
					if(localStorage.getItem('pdf_container_list')){
						container_list = JSON.parse(localStorage.getItem('pdf_container_list'));	
					}
					container_list.push({"pdf_location": code, "div_id": divId});
					localStorage.setItem('pdf_container_list', JSON.stringify(container_list));
					return (
						'<div style="margin-top:'+ PDF_MARGIN_TOP +'; margin-bottom:'+ PDF_MARGIN_BOTTOM +';" id="'+ divId +'">'
							+ code +
						'</div>'
					);
				} 
			}
			return false;
		}
		if(pdf_renderer(code, lang, true)){
		   return pdf_renderer(code, lang, false);
		}
	    /* SECTION START: Put other custom code rendering functions here
			i.e. If the language of the code block is LaTex, 
			put the code below to replace original code block with the text: 
			'Using LaTex is much better than handwriting!' inside a div container.

			if (lang == "latex") {
				return ('<div class="container">Using LaTex is much better than handwriting!</div>');
			}
			
	 	SECTION END */
		return (base ? base : this.origin.code.apply(this, arguments));
	}

	var pdf_renderer = {code: renderer_func};
	var doc_md = window.$docsify.markdown = (window.$docsify.markdown || {});
	var doc_md_rend = doc_md.renderer = (window.$docsify.markdown.renderer || {});
	doc_md_rend.code = (doc_md_rend.code ? doc_md_rend.code : renderer_func);

	// Allowing Docsify to execute the script to embed PDF
	window.$docsify.executeScript = true;

	// Linking Docsift to the PDF plugin
	window.$docsify.plugins = [
		function(hook, vm) {
			hook.init(function() {
				verbose_log('PDF Code Block Loader Plugin Initialized');
			});
			hook.afterEach(function(html, next) {
				verbose_log('PDF Code Block Loader Plugin After Hook Initialized');
				container_list = JSON.parse(localStorage.getItem('pdf_container_list'));
				verbose_log(container_list);
				if(container_list){
					html += '<script>';
					container_list.forEach(function(container){
						html += '\
						var options = {\
							fallbackLink: "<p>This is a <a href="'+ container['pdf_location'] +'"">fallback link</a> for the PDF you are tying to access.</p>",\
							height: "'+ PDF_VIEWER_HEIGHT +'",\
							width: "'+ PDF_VIEWER_WIDTH +'",\
						};\
						PDFObject.embed("'+ container['pdf_location'] +'", "#'+ container['div_id'] +'", options);';
					});
					html += '<\/script>';
				}
				localStorage.clear();
				next(html);
			});
		}
	].concat(window.$docsify.plugins || [])
}();
