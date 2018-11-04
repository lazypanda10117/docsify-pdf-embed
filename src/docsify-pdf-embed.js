const DEBUG = 1;
const PDF_VIEWER_HEIGHT = '50rem';

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
					return Math.floor((Math.random()) * 65536).toString(16).substring(1);
				}
				return rand_gen() + rand_gen() + '-' + rand_gen() + '-' + rand_gen() + '-' + rand_gen() + '-' + rand_gen() + rand_gen() + rand_gen();
			}
			if(!lang.localeCompare('pdf', 'en', {sensitivity: 'base'})){
				if(verify){
					return true;
				}else{
					return (
						'<div style="height:'+ PDF_VIEWER_HEIGHT +';" id="markdown_code_pdf_container_'+ unique_id_generator().toString() +'">'+ code +'</div>'
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

	window.$docsify.plugins = [
		function(hook, vm) {
			hook.init(function() {
				verbose_log('PDF Code Block Loader Plugin Initialized');
			});
			hook.afterEach(function(html, next) {
				verbose_log('PDF Code Block Loader Plugin After Hook Initialized');
				search_exp = /<div style=".+;" id="markdown_code_pdf_container_(([a-z]|\d)+[-]){4}([a-z]|\d)+">.+(\.pdf)<\/div>/g;
				
				/// Regex to be improved when positive lookbehind is supported
				pdf_search_approx = /">.+(?=<\/div>)/;
				element_id_search_approx = /id=".+(?=">)/;

				while(true){
					search_match = search_exp.exec(html);
					if(search_match){
						exact_text = search_match[0];
						pdf_search_result = pdf_search_approx.exec(exact_text);
						element_id_search_result = element_id_search_approx.exec(exact_text);
						pdf_location = pdf_search_result[0].substring(2);
						element_id = element_id_search_result[0].substring(4);
						html += '<script>PDFObject.embed("'+ pdf_location +'", "#' + element_id +'")<\/script>'; 
					}else{
						break;
					}
				}
				next(html);
			});
		}
	].concat(window.$docsify.plugins || [])
}();
