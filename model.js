//http://caragulak.nsupdate.info/proj/unicorn/index.html

function _resize(img, maxWidth, maxHeight){
    var ratio = 1;
    var canvas = document.createElement("canvas");
    canvas.style.display="none";
    var ctx = canvas.getContext("2d");

   
	
	canvas.width = maxWidth;
	canvas.height = maxHeight;

	ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
	var dataURL = canvas.toDataURL("image/png");

	return dataURL;
};

var EditorConfig = {
	model : null,
	defaults : {
		toolbar : ['bold', 'italic', 'strike','align-left','align-center','align-right','save','fullscreen'],
		buttons : {
			'align-left': {
				title  : 'Left',
				label  : '<i data-help="help Left" class="ui_toolbar_icon uk-icon-hover uk-icon-small uk-icon-align-left"></i>'
			},
			'align-center': {
				title  : 'Center',
				label  : '<i data-help="help Center" class="ui_toolbar_icon uk-icon-hover uk-icon-small uk-icon-align-center"></i>'
			},
			'align-right': {
				title  : 'Right',
				label  : '<i data-help="help Right" class="ui_toolbar_icon uk-icon-hover uk-icon-small uk-icon-align-right"></i>'
			},
			'save' : {
				title  : 'Save Chapter',
				label  : '<i data-help="help Chapter" class="ui_toolbar_icon uk-icon-hover uk-icon-small uk-icon-save"></i>'
			},
			bold : {
				title  : 'Bold',
				label  : '<i data-help="help Bold" class="ui_toolbar_icon uk-icon-hover uk-icon-small uk-icon-bold"></i>'
			},
			italic : {
				title  : 'Italic',
				label  : '<i data-help="help Italic" class="ui_toolbar_icon uk-icon-hover uk-icon-small uk-icon-italic"></i>'
			},
			strike : {
				title  : 'Strikethrough',
				label  : '<i data-help="help Strike" class="ui_toolbar_icon uk-icon-hover uk-icon-small uk-icon-strikethrough"></i>'
			},
			fullscreen: {
				title  : 'Fullscreen',
				label  : '<i data-help="help Fullscreen" class="ui_toolbar_icon uk-icon-hover uk-icon-small uk-icon-expand"></i>'
			}
		}
	},
	init : function(editor,addAction){
		editor.addButtons(this.defaults.buttons);
		addAction('bold', '<strong>$1</strong>');
		addAction('italic', '<em>$1</em>');
		addAction('strike', '<del>$1</del>');
		addAction('align-left', '<div class="uk-text-left">$1</div>');
		addAction('align-center', '<div class="uk-text-center">$1</div>');
		addAction('align-right', '<div class="uk-text-right">$1</div>');		
		
		this.model.initEditorButtons(editor);
	}
};
function ItemLibrary(config){
	this.config = config || {
		id : 1,
		type : {},
		item : {}
	};
	this.config.type = {
		'person' : 0,
		'item' : 1,
		'event' : 2,
		'place' : 3,
		'general' : 4
	};
	if(isNaN(this.config.id)){
		this.config.id = 1;
		this.config.item = {};
	} 
	//console.info('ItemLibrary',this.config);
};
ItemLibrary.prototype.GetType = function(){
	var arr = [];
	for(var type in this.config.type){
		arr.push({title : type,id : type});
	}
	return arr;
};
ItemLibrary.prototype.GetConfig = function(){
	return this.config;
};
ItemLibrary.prototype.GetTable = function(ItemTable,BookData){
	var chapter = {};
	for(var c in BookData.config.chapters){
		chapter[c] = {};
		for(var item_id in this.config.item){
			chapter[c][item_id] = {img:'',title:''};
		}
	}
	for(var item_id in this.config.item){
		var item = this.config.item[item_id];
		for(var i=0;i<item.length;i++){
			var data = item[i];
			data.data.chapter_id = data.chapter;
			//console.info('data',data);
			//if(!chapter[data.chapter]) chapter[data.chapter] = {};
			if(chapter[data.chapter]) chapter[data.chapter][item_id] = data.data;
		}
	}
	for(var ch in chapter){
		var item = chapter[ch];
		var items = [];
		for(var i in item){
			items.push(item[i]);
		}
		items.sort(function(a,b) { return a.id - b.id;});
		ItemTable.push({
			id : ch,
			items : items
		});
	}

	//console.info('GetTable',ItemTable());
	// data-bind="visible:img.length>0"
};
ItemLibrary.prototype.ChapterTree = function(chapter_id){
	var arr = [];
	for(var item_id in this.config.item){
		var item = this.config.item[item_id];
		for(var i=0;i<item.length;i++){
			var data = item[i];
			if(data.chapter==chapter_id){
				arr.push({
					index : i,
					item : item
				});
				break;
			}
		}
	}
	return arr;
};
ItemLibrary.prototype.GetItem = function(chapter_id,item_id){
	if(item_id && this.config.item[item_id]){
		var item = this.config.item[item_id];
		for(var i=0;i<item.length;i++){
			var data = item[i];
			if(data.chapter==chapter_id){
				return data.data;
			}
		}
	}
	return {
		img : '',
		title : '',
		description : '',
		type : ''
	}
};
ItemLibrary.prototype.Save = function(chapter_id,data){
	if(data.item_id){
		// update
		//console.info('Save Item[update]',chapter_id,data);
		var item = this.config.item[data.item_id];
		for(var i=0;i<item.length;i++){
			var idata = item[i];
			if(idata.chapter==chapter_id){
				item[i].data = data;// update
				return 1;
			}
		}
	}else{
		// new
		//console.info('Save Item[new]',chapter_id,data);
		data.item_id = this.config.id++;
		this.config.item[data.item_id] = [];
	}
	data.chapter_id = chapter_id;
	//data.index = this.config.item[data.item_id].length+1;
	this.config.item[data.item_id].push({
		chapter : chapter_id,
		data : data
	});
	return 0;// new added
};
ItemLibrary.prototype.Remove = function(Item){
	var item = this.config.item[Item.item_id];
	for(var i=item.length-1;i>=0;i--){
		var data = item[i];
		if(data.chapter==Item.chapter_id){
			item.splice(i,1);			
		}
	}
}
function setEditorText(editor,content,keyword){
	var x = $(editor).data('htmleditor');
	var editor = x.editor;
	editor.setValue(content);
	editor.htmleditor.render();
	editor.refresh();
	if(keyword && keyword.key){
		var doc = editor.getDoc();
		editor.markText({line: keyword.line, ch: keyword.match}, {line: keyword.line, ch: keyword.match+keyword.key.length}, {className: "styled-background"});
		var t = editor.charCoords({line: keyword.line, ch: keyword.match}, "local").top; 
		var middleHeight = editor.getScrollerElement().offsetHeight / 2; 
		editor.scrollTo(null, t - middleHeight - 5); 
	}
}
var MainModel = function() {
	// remove object
	// help dialog
	
	var self  = this;
	var htmleditor;
	var mainEditor = null;
	var offscreenEditor = null;
	function setup_image_loader(){
		$(".upload_image").on('change', function () {
			if (typeof (FileReader) == "undefined") {
				 alert("This browser does not support FileReader.");
				 return;
			}
			var pattr = $(this).attr('xattr').split(',');
			var previewImage = document.getElementById(pattr[0]);
			var countFiles = $(this)[0].files.length>0 ? 1 : 0;
			var imgPath = $(this)[0].value;
			var extn = imgPath.substring(imgPath.lastIndexOf('.') + 1).toLowerCase();
			
			for(var i=1;i<pattr.length;i++){
				if(extn==pattr[i]){
					var reader = new FileReader();
					reader.onload = function (e) {
						var attr = $('#'+pattr[0]).attr('xattr').split(',');
						var maxx = parseInt(attr[0]);
						var maxy = parseInt(attr[1]);
						previewImage.src = e.target.result; 
						var k = _resize(previewImage, maxx, maxy);
						previewImage.src = k;
					}

					reader.readAsDataURL($(this)[0].files[0]);
				}
			}
		});
	};
	function loadColorPicker(val){
		$(".color_picker_full").spectrum({
			preferredFormat: "rgb",
			color: val || "#ECC",
			flat: true,
			showInput: true,
			showButtons: false,
			move: function(color) {
					/*
				$('#dialogContent').css({
					'background-color':color.toHexString()
				});
				*/
			}
		}).spectrum("set",val || "#ECC");
	}
	self.is_updated = false;
	self.show_Chapters = ko.observable(true);
	self.show_Notes = ko.observable(true);
	self.show_Items = ko.observable(true);
	self.getEditorWidth = ko.computed(function () {
		var cssString = "uk-width-1-1";
		if (self.show_Notes() && self.show_Chapters()) {
			cssString = "uk-width-7-10"
		}
		else if (self.show_Notes()) {
			cssString = "uk-width-9-10"
		}
		else if (self.show_Chapters()) {
			cssString = "uk-width-8-10"
		}
		return cssString;
	});
	self.CreateMainEditor = function(){
//if: name == 'NAME1'
		if(mainEditor) return;
		try{
			var config = {
				height:500,
				show_button : function(){
					return [
						'<li class="uk-htmleditor-button-chapter"><a>C</a></li>',
						'<li class="uk-htmleditor-button-notes"><a>N</a></li>',
						'<li class="uk-htmleditor-button-items"><a>L</a></li>',
						'<li class="uk-htmleditor-button-help" data-help="help Documentation"><a class="uk-icon-hover uk-icon-small uk-icon-life-saver"></a></li>',
						'<li class="uk-htmleditor-button-library" data-help="help Library"><a class="uk-icon-hover uk-icon-small uk-icon-group"></a></li>',
						'<li class="uk-htmleditor-button-save-object" data-help="help Save"><a class="uk-icon-hover uk-icon-small uk-icon-archive">{:lblSave}</a></li>',
						'<li class="uk-htmleditor-button-load-object" data-help="help Load"><a class="uk-icon-hover uk-icon-small uk-icon-download">{:lblLoad}</a></li>',
						'<li class="uk-htmleditor-button-print" data-help="help Print"><a class="uk-icon-hover uk-icon-small uk-icon-print"></a></li>',
						'<li class="uk-htmleditor-button-plus" data-help="help NewChapter"><a class="uk-icon-hover uk-icon-small uk-icon-plus"></a></li>',
						'<li class="uk-htmleditor-button-note" data-help="help NewNote"><a class="uk-icon-hover uk-icon-small uk-icon-sticky-note"></a></li>'
					];
				}
			};
			
			
			mainEditor = window.UIkit.htmleditor($('#mainEditor'),config);
			$('#mainEditor').on('input',function(){
				self.is_updated = true;
				console.log('is_updated');
			});
			
			offscreenEditor = window.UIkit.htmleditor($('#offscreen_Editor'),config);
			
			$('.uk-htmleditor-button-library').hide();
		}catch(e){
			console.error('CreateMainEditor',e);
			mainEditor = null;
		}
	}

	self.initEditorButtons = function(editor){
		editor.htmleditor.on('click','.uk-htmleditor-button-chapter', function(e) {
			e.preventDefault();
			self.show_Chapters(!self.show_Chapters());
		});	
		editor.htmleditor.on('click','.uk-htmleditor-button-notes', function(e) {
			e.preventDefault();
			self.show_Notes(!self.show_Notes());
		});	
		editor.htmleditor.on('click','.uk-htmleditor-button-items', function(e) {
			e.preventDefault();
			self.show_Items(!self.show_Items());
		});	
		
		editor.on('action.save', function() {
			//console.log('action.save',model,this);
			self.SaveChapter();
		});
		editor.htmleditor.on('click','.uk-htmleditor-button-help', function(e) {
			e.preventDefault();
			// show help window
			self.OpenDialog('help');
			//window.open("help.html");			
		});	
		editor.htmleditor.on('click','.uk-htmleditor-button-library', function(e) {
			e.preventDefault();
			self.OpenDialog('item');
			// add new item/exist to current chapter
			//self.BookLoad();
		});		
		editor.htmleditor.on('click','.uk-htmleditor-button-load-object', function(e) {
			e.preventDefault();
			self.BookLoad();
		});		
		editor.htmleditor.on('click','.uk-htmleditor-button-save-object', function(e) {
			e.preventDefault();
			self.BookSave();
		});	
		editor.htmleditor.on('click','.uk-htmleditor-button-print', function(e) {
			e.preventDefault();
			self.BookPrint();
		});	
		editor.htmleditor.on('click','.uk-htmleditor-button-plus', function(e) {
			e.preventDefault();
			self.BookAddChapter();
		});	
		editor.htmleditor.on('click','.uk-htmleditor-button-note', function(e) {
			e.preventDefault();
			self.BookAddNote();
		});	
	};

	var itemLibrary = new ItemLibrary();
	var templates = {};
	$('.dtemplate').each(function(){
		var form = $(this).find('.uk-form');
		if(form.length>0)
			templates[$(this).attr('id')] = form.html();
		else
			templates[$(this).attr('id')] =  $(this).html();
	});
	function get_template(id){
		return templates[id];
	}
	//console.log('templates',templates);
	for(var t in templates){
		$('#'+t).remove();
	}
	EditorConfig.model = self;
	self.txtTemp1 = ko.observable();
	self.txtTemp2 = ko.observable();
	self.txtTemp3 = ko.observable();
	self.txtTemp4 = ko.observable();
	
	self.txtDialog1 = ko.observable();
	self.txtDialog2 = ko.observable();
	self.dlgMode = ko.observable();
	self.fileMode = ko.observable();
	
	self.appName = ko.observable('Unicorn - Book Writer, v1');
	
	self.txtName = ko.observable('New Book');
	self.txtAuthor = ko.observable('');

	self.CurrentChapter = ko.observable('<h1>Heading</h1>');
	self.Notes = ko.observableArray([]);
	self.Search = ko.observableArray([]);
	self.Chapters = ko.observableArray([]);
	self.SelectChapter = ko.observableArray([]);
	self.NoteList  = ko.observableArray([]);
	self.ItemTable  = ko.observableArray([]);
	self.currentTitle = ko.observable();
	self.currentHelp = ko.observable();
	self.selectedAttachment = ko.observable();
	self.currentObject = null;
	self.current_id = null;
	self.SearchWord =  ko.observable();
	self.BookStats = ko.observableArray([]);
	self.selectImage = function(){
		$('#fileUpload').click();
	};

	self.GetItemType = function(){
		return itemLibrary.GetType();
	};
	var BookData = {
		config : { // saved/loaded
			id 		: 1,
			name 	: '',
			author 	: '',
			description : '',
			lang : '',
			current : 0,//last working chapter
			chapters : {},
			notes 	: {},
			FB : {},
			Library : {}
		},
		getCoinfig : function(){
			this.config['Library'] = itemLibrary.GetConfig();
			return this.config;
		},
		refresh_hash:function(config,notes){
			if(notes){
				self.Notes.removeAll();
				for(var i in config.notes){
					self.Notes.push(config.notes[i]);
				}
			}else{
				self.Chapters.removeAll();
				self.SelectChapter.removeAll();
				self.SelectChapter.push({
					id : 0,
					title : '-'
				});
				for(var i in config.chapters){
					self.Chapters.push(config.chapters[i]);
					self.SelectChapter.push({
						id : config.chapters[i].id,
						title : config.chapters[i].title
					});
				}
			}
		},
		init : function(config){
			if(config) this.config = config;
			// missing attributes
			itemLibrary = new ItemLibrary(this.config['Library']);

			if(!this.config['description']) this.config['description'] = '';
			if(!this.config['Library']) this.config['Library'] = {};
			
			
			
			var info = this.config.FB['title-info'];
			if(info){
				this.config.date = info['date'];
				this.config.lang = info['lang'];
				
			}
			if(!this.config.date){
				this.config.date = new Date().toISOString().substr(0,10);
			}
			console.info('this.config',this.config);
			this.refresh_hash(this.config,true);
			this.refresh_hash(this.config,false);
		},
		note_add : function(obj){
			
			//console.info('note_add',obj);
			if(!obj.id){
				var id = this.config.id++;
				this.config.notes[id] = {
					id : id,
					color : obj.color,
					title : obj.title,
					help : obj.help,
					chapter_id : parseInt(obj.chapter_id)
				};
				this.refresh_hash(this.config,true);
				return this.config.notes[id];
			}else{
				// update
				this.config.notes[obj.id] = obj;
				this.refresh_hash(this.config,true);
			}
		},
		note_remove: function(id){
			if(this.config.notes[id]) {
				delete this.config.notes[id];
				this.refresh_hash(this.config,true);
			}
		},
		chapter_add : function(obj){
			
			if(!obj.id){
				var id = this.config.id++;
				obj.id = id;
				this.config.chapters[id] = {
					id : id,
					color : obj.color,
					title : obj.title,
					text : obj.text,
					help : obj.help,
					note : []
				};
				this.refresh_hash(this.config);
				return this.config.chapters[id];
			}else{
				// update
				this.config.chapters[obj.id] = obj;
				this.refresh_hash(this.config);
			}
			return obj.id;
		},
		chapter_get :function(id,all){
			if(this.config.chapters[id]) {
				return all ? this.config.chapters[id] : this.config.chapters[id].text;
			}
		},
		chapter_update: function(id,text){
			if(this.config.chapters[id]) {
				this.config.chapters[id].text = text;
			}
		},
		chapter_remove:  function(id){
			if(this.config.chapters[id]) {
				delete this.config.chapters[id];
				this.refresh_hash(this.config);
			}
		},
		chapter_list : function(){
			var arr = [];
			for(var i in this.config.chapters){
				arr.push(this.config.chapters[i]);
			}
			return arr;
		},
		html: function(){
			var arr = [
				'<div class="pdf_body">'
			];
			for(var i in this.config.chapters){
				var chp = this.config.chapters[i];
				arr.push('<div class="pdf_title">'+chp.title+'</div>');
				arr.push('<div class="pdf_content">'+chp.text+'</div>');
			}
			arr.push('</div>');
			return arr.join('');
		},
		search : function(key){
			var offscreen = $('#offscreen_Editor').data('htmleditor');
			var doc = offscreen.editor.getDoc();
			var Pos = doc.getCursor();
			var fold = function(str){return str.toLowerCase();};
			key = fold(key);
			//console.info('SearchWord',key,doc,Pos);
			self.Search.removeAll();
			for(var i in this.config.chapters){
				var chap = this.config.chapters[i];
				setEditorText('#offscreen_Editor',chap.text);
				var count = doc.lineCount();
				for(var l=0;l<count;l++){
					var orig = doc.getLine(l);
					if(orig){
						orig.slice(0);
						var line = fold(orig);
						var match = line.indexOf(key);
						if(match>-1){
							//console.info('offscreen[line]',l,line);
							self.Search.push({
								match : match,
								key : key,
								chapter : chap,
								line : l,
								text : line.replace(key,'<b style="color:red">'+key+'</b>')
							});
						}
					}
				}
			}
		},
		stats : function(){
			function simple(txt){
				return txt.replaceAll('\n','').replaceAll('<p>','').replaceAll('</p>','').replace(/\s+/g, " ").trim();
			}
			function countWords2(str) {
				var matches = str.match(/\S+/g);
				return matches ? matches.length : 0;
			}
			function countWords(s){
				s = s.replaceAll('.',' ');
				s = s.replaceAll(',',' ');
				s = s.replace(/(^\s*)|(\s*$)/gi,"");//exclude  start and end white-space
				s = s.replace(/[ ]{2,}/gi," ");//2 or more space to 1
				s = s.replace(/\n /,"\n"); // exclude newline with a start spacing
				return s.split(' ').length; 
			}
			var info = [];
			self.BookStats.removeAll();
			var sum = 0,min ,max ;
			for(var i in this.config.chapters){
				var chap = this.config.chapters[i];
				var text = simple(chap.text);
				var n = countWords2(text);
				if(!min || min>n) min = n;
				if(!max || max<n) max = n;
				info.push({
					title : simple(chap.title),
					count : n,
					ratio : 0,
					precent : 0
				});
				sum += n;
			}
			var range = max - min;
			for(var i=0;i<info.length;i++){
				info[i].ratio = range!=0 ? Math.round(100 * (info[i].count - min) / range) : 0;
				info[i].precent = Math.round(100 * (info[i].count / sum));
				self.BookStats.push(info[i]);
			}
			//console.info('stats',min,max,sum,sum / info.length, info);
		},
		get_book_fb2 : function(){
			var arr = [
				'<?xml version="1.0" encoding="utf-8"?>',
				'<FictionBook xmlns="http://www.gribuser.ru/xml/fictionbook/2.0" xmlns:l="http://www.w3.org/1999/xlink">',
				'<description>'
			];
			var info = BookData.config.FB['title-info'];
			var author = info['author'] ? info['author'].split(' ') : ['',''];
			arr.push('<title-info>');
			arr.push('<author>');
			arr.push('<first-name>'+author[0]+'</first-name>');
			arr.push('<last-name>'+author[1]+'</last-name>');
			arr.push('</author>');
			arr.push('<book-title>'+info['book-title']+'</book-title>');
			arr.push('<date>'+info['date']+'</date>');
			arr.push('<genre>'+info['genre']+'</genre>');
			arr.push('<lang>'+info['lang']+'</lang>');
			arr.push('<annotation>'+info['annotation']+'</annotation>');
			arr.push('</title-info>');
			
			arr.push('<document-info>');
			arr.push('</document-info>');
			arr.push('</description>');
			arr.push('<body>');
			arr.push('<title>');
			arr.push('<p>'+info['author']+'</p>');
			arr.push('<empty-line/>');
			arr.push('<p>'+info['book-title']+'</p>');
			arr.push('</title>');
			
			arr.push('<section><title><p>Annotation</p></title>');
			arr.push('<empty-line/>');
			arr.push('<p>'+info['annotation']+'</p>');
			arr.push('<empty-line/>');
			arr.push('<p id="lT0"></p>');
			arr.push('<p> • <a xlink:href="#lT0">'+info['book-title']+'</a></p>');
			for(var i in this.config.chapters){
				arr.push('<p> • <a xlink:href="#lT'+i+'">'+this.config.chapters[i].title+'</a></p>');
				arr.push('<empty-line/>');
			}
			arr.push('<empty-line/>');
			arr.push('</section>');
			for(var i in this.config.chapters){
				arr.push('<section><title><p  id="lT'+i+'">'+this.config.chapters[i].title+'</p></title>');
				arr.push(this.config.chapters[i].text);
				arr.push('<empty-line/>');
				arr.push('</section>');
			}
			arr.push('</body>');
			arr.push('</FictionBook>');
			
			return arr.join('');
		}
	};
	self.GetChapterTitle = function(chapter_id){
		var d = BookData.chapter_get(chapter_id,true);
		if(d){
			//console.log('GetChapterTitle',chapter_id,d);
			return self.GetTitle(d.title);
		}
	};
	function getMainEditorText(){
		var x = $('#mainEditor').data('htmleditor');
		var editor = x.editor;
		return editor.getValue();
	}
	self.SaveChapter = function(){
		var main = getMainEditorText();
		console.log('SaveChapter',self.current_id,main);
		if(self.current_id){
			BookData.chapter_update(self.current_id,main);
		}
	};
	
	self.SetChapter = function(data,skip,keyword){
		//console.log('SetChapter',data,skip);
		$('.uk-htmleditor-button-library').hide();
		if(!data) return;
		var main = getMainEditorText();
		var current = BookData.chapter_get(self.current_id);
		if(!skip){
			if(self.current_id==data.id){
				return;
			}
			if(current!=main && self.is_updated){
				// ask for save
				var txt;
				var r = confirm("Save changes?");
				if (r) {
					BookData.chapter_update(self.current_id,main);
				}
			}
		}
		self.is_updated = false;
		self.current_id = data ? data.id : 0;
		self.getNoteList();
		$('.uk-htmleditor-button-library').show();

		var content = BookData.chapter_get(self.current_id);
		if(!content) return;
		self.CurrentChapter(content);
		setEditorText('#mainEditor',content,keyword);
		self.is_updated = false;
		/*
		var x = $('#mainEditor').data('htmleditor');
		var editor = x.editor;
	
		var h = setTimeout(function(){
			clearTimeout(h);
		},100);
		*/
	};
	self.SelectHelp = function(om,data){
		self.currentTitle(data.title);
		self.currentHelp(data.help);
	};
	self.refreshItemTable = function(){
		self.ItemTable.removeAll();
		itemLibrary.GetTable(self.ItemTable,BookData);
		console.info('refreshItemTable',self.ItemTable);
	};
	self.SaveDialog = function(om,data,copy){
		$('#dynamicDialog').hide();
		om = om || self.dlgMode();
		var color = $(".color_picker_full").length>0 && typeof($(".color_picker_full").spectrum)=='function' ? $(".color_picker_full").spectrum("get") : null;
		color = color && typeof(color.toHexString)=='function' ? color.toHexString() : 'white';
		function getEditorText(){
			if(!htmleditor) return '';
			var editor = htmleditor.editor;
			var txt = editor.getValue();
			self.txtTemp2(txt); 
			return txt;
		}
		//console.info('SaveDialog',om,self.currentObject);
		switch(om){
			case 'item':
				var img = $('#img_holder').attr('src');
				var set = {
					itemType : $('#itemType').val(),
					itemTitle : $('#itemTitle').val(),
					itemDesc : $('#itemDesc').val()
				};
				if(self.currentObject){
					console.info('Update',set);
					// dont copy to selected chapter
					itemLibrary.Save(
						copy ? self.currentObject.chapter_id : self.current_id,{
						item_id : self.currentObject.item_id,
						title : set.itemTitle,
						description : set.itemDesc,
						img : img,
						type : set.itemType					
					});
				}else{
					console.info('New',set);
					itemLibrary.Save(self.current_id,{
						title : set.itemTitle,
						description : set.itemDesc,
						img : img,
						type : set.itemType					
					});
				}
				// update Library table
				self.refreshItemTable();
				break;
			case 'close':
				break;
			case 'book':
				self.txtName(self.txtTemp1());
				self.txtAuthor(self.txtTemp2());
				BookData.config.description = self.txtTemp3();
				BookData.config.lang = self.txtTemp4();
				BookData.config.name = self.txtTemp1();
				BookData.config.author = self.txtTemp2();
				break;
			case 'chapter':
				if(self.currentObject){
					self.currentObject.title = self.txtTemp1();
					self.currentObject.help = self.txtTemp2();
					self.currentObject.color = color;
					BookData.chapter_add(self.currentObject);
				}
				else
					var obj = BookData.chapter_add({
						title : self.txtTemp1(),
						text : getEditorText(),
						color : color,
						help : self.txtTemp2()
					});
					self.SetChapter(obj,true); 
				break;
			case 'note':
				if(self.currentObject){
					self.currentObject.title = self.txtTemp1();
					self.currentObject.help = self.txtTemp2();
					self.currentObject.color = color;
					self.currentObject.chapter_id = self.selectedAttachment();
					BookData.note_add(self.currentObject);
					self.getNoteList();
				}else
					var obj = BookData.note_add({
						title : self.txtTemp1(),
						color : color,
						chapter_id : self.selectedAttachment(),
						help : self.txtTemp2()
					});
					self.SetChapter(obj,true);
				break;
		}
		self.currentObject = null;
		$('.sp-container').remove();
		ko.cleanNode($("#dialogContent")[0]);
		$('#dialogContent').empty(); 
		htmleditor = null;
		return true;
	};
	self.UpdateEditor = function(){
		if(htmleditor){
			
			var editor = htmleditor.editor;

			var h = setTimeout(function(){
				clearTimeout(h);
				//console.info('UpdateEditor',htmleditor,self.txtTemp2());
				editor.setValue(self.txtTemp2());
				editor.htmleditor.render();
				editor.refresh();
			},100);

		}
	};
	self.CloseTooltip = function(){
		$('#tooltipWrapperTmpl_new').remove();
	};
	
	function openTooltip(dialog,event,pos,data){
		var target = event.target;
		self.CloseTooltip();
		var offset = {
			left : event.screenX,
			top : $(target).offset().top
		};
		
		var div = $('#tooltipWrapperTmpl').html();		
		$(div).attr('id','tooltipWrapperTmpl_new').css({
			'position':'absolute',
			'visibility':'visible'
		}).appendTo('body').show();/*.on('mouseleave',function(){
			$(this).remove();
		})*/ 
		
		
		$('#tooltipWrapperTmpl_new').on('click',function(){
			console.log('click',this);
			$(this).remove();
		});
		if(data)
			$('#tooltipWrapperTmpl_new').find('.tooltipContent').html(data);
		else
			$('#tooltipWrapperTmpl_new').find('.tooltipContent').html(get_template(dialog));
		var h = $('#tooltipWrapperTmpl_new').height();
		var w = $('#tooltipWrapperTmpl_new').width();
		
		switch(pos){
			case 'below':
				$('#tooltipWrapperTmpl_new').css({
					top: offset.top+$(target).height(),left: offset.left
				});
				break;
			case 'right':
				$('#tooltipWrapperTmpl_new').css({
					top: offset.top,left: offset.left+$(target).width()
				});
				break;
			case 'left':
				$('#tooltipWrapperTmpl_new').css({
					top: offset.top,left: offset.left - w
				});
				break;
			default:
				// auto place
				var top = 0,left = 0;
				
				var oh = $(window).height() - (offset.top + h);
				if(oh<0){
					// place above
					top = offset.top - h;
				}else{
					// place below
					top = offset.top + 40;
				}
				oh = (offset.left - w);
				// check middle
				//console.info('middle',top,oh,offset,w);
				if(offset.left - w >=0 && offset.left + w<$(window).width()){
					left = ($(window).width() - w)/2;
				}else{
					oh = $(window).width() - (offset.left + w);
					
					if(oh<0){
						// place left
						left = offset.left - w;
					}else{
						// place right
						left = offset.left;
					}
				}
				$('#tooltipWrapperTmpl_new').css({
					top: top,
					left: left,
					background:'rgba(220,220,220,1)',
					opacity: 1.0,
					zIndex : 10000
				}).find('div').css({
					opacity: 1.0,
					background:'rgba(220,220,220,1)'
				});
				break;
		}
		
	}
	self.OpenTooltip = function(dialog,event,pos,data){
		openTooltip(dialog,event,pos,data);
	};
	self.OpenDialog = function(item, data){
		self.currentObject = data;
		self.dlgMode(item);
		$('#dynamicDialog').hide();
		function create_editor(){
				htmleditor = UIkit.htmleditor($('#dialogContent').find('#txtData'),{
					mode:'tab',
					height:200
				});
		}
		if($("#dialogContent").length>0)
			ko.cleanNode($("#dialogContent")[0]);
		self.selectedAttachment(null);
		switch(item){
			case 'help':
				$.ajax({
				  url: "help_simple.html"
				}).done(function(data ) {
					$("#dialogContent").html(data);
					ko.applyBindings(self, $("#dialogContent")[0]);
					self.UpdateEditor();
					$('#dynamicDialog').show();
					$('.dialogWrapper').css({
						top  : Math.max(0, (($(window).height() - $('.dialogWrapper').outerHeight()) / 2) + $(window).scrollTop()) + "px",
						left : Math.max(0, (($(window).width() - $('.dialogWrapper').outerWidth()) / 2) + $(window).scrollLeft()) + "px"
					});
					$("#dialogContent").find('#btn_close').on('click',function(){
						self.SaveDialog('close');
					});
				});
				return;
				break;
			case 'item':
				//title
				self.txtTemp1(data ? data.title : '');
				//description
				self.txtTemp3(data ? data.description : '');
				// img
				self.txtTemp2(data ? data.img : '');
				// type
				self.selectedAttachment(data ? data.type : '');
				$('#dialogContent').html(get_template('LibrarySettings'));
				setup_image_loader();
				break;
			case 'chapter':
				self.txtDialog1('Chapter Title');
				self.txtDialog2('Description');
				self.txtTemp1(data ? data.title : '');
				self.txtTemp2(data ? data.help : '<b style="color:red">ok</b>');

				$('#dialogContent').html(get_template('DynamicSettings'));

				create_editor();
				
				
				loadColorPicker(data ? data.color : false);
				break;
			case 'note':
				self.txtDialog1('Note Title');
				self.txtDialog2('Description');
				self.txtTemp1(data ? data.title : '');
				self.txtTemp2(data ? data.help : '<b style="color:blue">ok</b>');
				$('#dialogContent').html(get_template('DynamicSettings'));

				create_editor();


				loadColorPicker(data ? data.color : false);
				break;
			case 'loading':
				$('#dialogContent').html(get_template('loadingSpinner'));
				break;
			case 'book':
				self.txtTemp1(self.txtName());
				self.txtTemp2(self.txtAuthor());				
				self.txtTemp3(BookData.config.description);
				self.txtTemp4(BookData.config.lang);
				$('#dialogContent').html(get_template('BookSettings'));
				break;
		}
		ko.applyBindings(self, $("#dialogContent")[0]);
		self.UpdateEditor();
		
		$('#dynamicDialog').show();
		
		$('.dialogWrapper').css({
			top  : Math.max(0, (($(window).height() - $('.dialogWrapper').outerHeight()) / 2) + $(window).scrollTop()) + "px",
			left : Math.max(0, (($(window).width() - $('.dialogWrapper').outerWidth()) / 2) + $(window).scrollLeft()) + "px"
		});
	};
	self.show_ToolTip = function(color){
		ko.cleanNode($("#tooltipWrapperTmpl_new")[0]);
		$('#tooltipWrapperTmpl_new').css({
			'background-color':color
		});
		ko.applyBindings(self, $("#tooltipWrapperTmpl_new")[0]);
		$('#tooltipWrapperTmpl_new').on('click',function(){
			console.log('click',this);
			$(this).remove();
		});
	};
	self.ShowToolTip = function(item, event,data){
		//console.info('ShowToolTip',item, event,data);
		switch(item){
			case 'help':
				self.OpenTooltip('tipHelp',event,'left');
				break;
			case 'chapter':
				self.currentTitle(data.title);
				self.currentHelp(data.help);
				self.OpenTooltip('DynamicHelp',event,'right');
				self.show_ToolTip(data.color);
				break;
			case 'note':
				self.currentTitle(data.title);
				self.currentHelp(data.help);
				self.OpenTooltip('DynamicHelp',event,'left');
				self.show_ToolTip(data.color);
				break;
		}
		return true;
	};
	self.OpenDialog('loading');
	self.HelpMode = ko.observable(false);
	self.is_help_on = ko.computed(function(){ return self.HelpMode(); });
	self.is_attachable = ko.computed(function(){ return self.dlgMode()!='chapter'; });
	self.SwitchHelpMode = function(){
		self.HelpMode(!self.HelpMode());
		
		if(!self.HelpMode()){
			self.CloseTooltip();
		}
		function show(event){
			if(self.HelpMode()){
				var dialog = $(this).data('help').split(' ').join('');
				var pos = $(this).data('pos');
				openTooltip(dialog,event,'');
			}
		}
		console.info('show help',self.HelpMode());
		$('[data-help~="help"]').each(function(){
			if(self.HelpMode()){
				// attach
				$(this).on('mouseenter',show);
			}else{
				// dettach
				$(this).off('mouseenter',show);

			}
		});
	};
	self.Loading = function(on){
		if(on) self.OpenDialog('loading');
		else{
			$('#dynamicDialog').hide();
			if($("#dialogContent").length>0)
				ko.cleanNode($("#dialogContent")[0]);
		}
	};
	self.BookSave = function(){
		self.Loading(true);
		//self.Loading(true);
		console.info('BookSave');
		
		var files = [];
		files.push({
			type : 'json',
			name : 'unicorn.json',
			content : BookData.getCoinfig()
		});
		files.push({
			type : 'fb2',
			name : 'unicorn.fb2',
			content : BookData.get_book_fb2()
		});
		zipData(files,function(){
			self.Loading(false);	
		});
		
		//https://stuk.github.io/jszip/
		//https://github.com/markswindoll/jQuery-Word-Export
		//http://markswindoll.github.io/jquery-word-export/
	};
	self.BookLoad = function(){
		self.Loading(true);
		//https://github.com/PinZhang/docx.js-demo?files=1
		//console.info('BookLoad');
		$('#openFile').click();
	};
	self.UpdateStats = function(){
		ko.tasks.schedule(function () {
			BookData.stats();
		});
	};
	self.BookPrint = function(){
		var html = BookData.html();
		console.info('BookPrint',html.length);
		$('#printBook').empty().html(html).print({
            globalStyles: true,
            mediaPrint: false,
            iframe: true,
            timeout: 250,
            doctype: '<!doctype html>'
		}).empty();
	};
	self.BookAddChapter = function(){
		self.Loading(true);
		//console.info('BookAddChapter');
		self.OpenDialog('chapter',null);
	};
	self.BookAddNote = function(){
		self.Loading(true);
		//console.info('BookAddNote');		
		self.OpenDialog('note',null);
	};
	self.ShowItem = function(item,chapter_id){
		
		var Item = itemLibrary.GetItem(chapter_id,item.item_id);
		//console.info('ShowItem',Item);
		self.OpenDialog('item',Item);
	}
	self.onSearch = function(d,e){
		console.info(e);
		if(e.keyCode === 13){
			var key = e.target.value;
			
			ko.tasks.schedule(function () {
			   BookData.search(key);
		    });
		}			
		return true;
	}
	var field = document.getElementById('openFile');
	self.dataLoaded = function(fileList){
		//console.info("dataLoaded",fileList);
		if(fileList.ext=='json'){
			//console.info("unicorn");
			// ok unicorn format
			var jsonObj = jQuery.parseJSON( fileList.data );
			console.info("unicorn",jsonObj);
			BookData.init(jsonObj);
			self.txtName(BookData.config.name);
			self.txtAuthor(BookData.config.author);
			for(var f in BookData.config.chapters){
				self.SetChapter({id : f},true);
				break;
			}
		}
		else if(fileList.ext=='fb2'){
			var doc = $(fileList.data);
			var info = doc.find('title-info');
			info = info.length>0 ? info[0].children : [];
			
			var book = {};
			for(var i=0;i<info.length;i++){
				book[info[i].nodeName.toLowerCase()] = $(info[i]).text().trim();
			}
			book['author'] = book['author'].replace('\n','').replace(/\s+/g, " ");
			//console.info("fb2",book);
			
			BookData.config.name  = book['book-title'];
			BookData.config.author  = book['author'] ;
			self.txtName(BookData.config.name);
			self.txtAuthor(BookData.config.author);
			BookData.config.FB['title-info'] = book;
			var section = doc.find('section');
			console.info('section.length',section.length);
			BookData.config.FB['content'] = fileList.data;
			var chapters = [],chapter = [],empty = 0;
			if(section.length==1){
				section = section.length>0 ? section[0].children : [];
				
				for(var i=0;i<section.length;i++){
					var line = $(section[i])[0];
					//console.info('section',i,line.localName);
					switch(line.localName){
						case 'empty-line':
							empty++;
							if(empty>2 && chapter.length>0){
								chapters.push(chapter);
								chapter = [];
							}
							break;
						case 'p':
							chapter.push('<p>'+$(line).html()+'</p>');
							empty = 0;
							break;
					}
				}
				if(chapters.length<1){
					chapters = [];
					chapter = [];
					for(var i=0;i<section.length;i++){
						var line = $(section[i])[0];
						//console.info('section',i,line.localName);
						switch(line.localName){
							case 'empty-line':
								empty++;
								if(empty>0 && chapter.length>0){
									if(chapters.length>0 && chapter.length==1){
										chapters[chapters.length-1].push(chapter[0]);//appendTo
									}else{
										chapters.push(chapter);
									}
									chapter = [];
								}
								break;
							case 'p':
								var txt = $(line).text().replace('\n','').replace(/\s+/g, " ").trim();
								
								if(txt.length>1){
									
									chapter.push('<p>'+txt+'</p>');
								}
								empty = 0;
								break;
						}
					}
				}
			}
			else if(section.length>1){
				console.info('section',section);
				for(var i=0;i<section.length;i++){
					var Section = section[i].children;
					chapter = [];
					//console.info('Section',i,Section.length);
					for(var j=0;j<Section.length;j++){
						var line = $(Section[j])[0];
						//if(j<10) console.info('section',j,line,line.localName);
						switch(line.localName){
							case 'title':
								var txt = $(line).text().replaceAll('\n','').replace(/\s+/g, " ").trim();//.replaceAll('\n','').replaceAll('<p>','').replaceAll('</p>','').replace(/\s+/g, " ").trim()
								chapter.push(txt);
								break;
							case 'empty-line':
								empty++;
								
								break;
							case 'p':
								var txt = $(line).text().replaceAll('\n','').replace(/\s+/g, " ").trim();
								
								if(txt.length>1){
									
									chapter.push('<p>'+txt+'</p>');
								}
								empty = 0;
								break;
						}
					}
					//console.info('Section',i,Section.length);
					if(chapter.length>0) chapters.push(chapter);
					//break;
				}
			}
			
			BookData.config.chapters = {};
			BookData.config.notes = {};
			var first;
			for(var i=0;i<chapters.length;i++){
				var chapter = chapters[i];
				//var title = trimTitle(chapter[0]).trunc(20);
				var id = BookData.chapter_add({
					//Title : title,
					title : self.GetTitle(chapter[0]),
					help : chapter[0],
					color : 'orange',
					text : chapter.join('\n\r')
				});
				if(!first) first = id;
			}
			console.info("chapters",first);
			if(first) self.SetChapter({id : first.id},true);
		}else if(fileList.ext=='docx'){
			// html ???
			console.info("html");
		}
		self.refreshItemTable();
		self.Loading(false);
	};
	self.GetTitle = function(title){
		function trimTitle(title){
			return title ? title.replaceAll('<p>','').replaceAll('</p>','').replaceAll('\n','') : '???';
		}
		return trimTitle(title).trunc(20);
	};
	field.onchange = function (event) {
		if (typeof (FileReader) == "undefined") {
			 return;
		}
		var fileList = { 
			fb2 : null,
			json : null,
			docx : null
		};
		var filePath = $(this)[0].value;
		var extn = filePath.substring(filePath.lastIndexOf('.') + 1).toLowerCase();
		if(extn=="docx"){
			jDoc.read(event.target.files[0], {
				success: function (parsedFile) {
					self.dataLoaded({
						ext : extn, 
						data : parsedFile.html()
					});
				},
				error: function (error) {
					console.log(error);
				}
			});
		}
		else if(extn=='fb2'){
			var reader = new FileReader();
			reader.onload = function (e) {
				self.dataLoaded({
					ext : 'fb2', 
					data : reader.result
				});
			};
			reader.readAsText($(this)[0].files[0]);
		}
		else if(extn=='zip'){
			var reader = new FileReader();
			reader.onload = function (e) {
				var Zip = new JSZip();
				
				Zip.loadAsync(reader.result).then(function(zip) {
					Zip.forEach(function (relativePath, file){						
						var ext = relativePath.substring(relativePath.lastIndexOf('.') + 1).toLowerCase();
						//console.info("iterating over",ext, relativePath,file);
						switch(ext){
							case 'json':
							case 'fb2':
								fileList[ext] = {
									ext : ext, 
									path : relativePath
								};								
								break;
						}						
					});
				}).then(function (zip) {
					//console.info("final",fileList);
					if(fileList.json){
						Zip.file(fileList.json.path).async("string").then(function(content){
							//console.info("json",this,content.length);
							self.dataLoaded({
								ext : 'json', 
								data : content
							});
							return content;
						});
					}
					else if(fileList.fb2){
						Zip.file(fileList.fb2.path).async("string").then(function(content){
							//console.info("fb2",this,content.length);
							self.dataLoaded({
								ext : 'fb2', 
								data : content
							});
							return content;
						});
					}
				});
			};
			reader.readAsArrayBuffer($(this)[0].files[0]);
		}else{
			alert('Not supported file format!');
			self.Loading(false);
		}
	};
	
	var h = 0;
	self.AddToChapter = function(item,flag){
		console.info('AddToChapter',item,flag,self.currentObject);
		// NOT NEEDED !!!
		//if(self.currentObject.chapter_id!=self.current_id)
		//	self.currentObject = null;
		// this will create new object or update existing
		
		self.SaveDialog('item',item,flag);
	};
	self.getNoteList = function(){
		self.NoteList.removeAll();
		for(var i=0;i<self.Notes().length;i++){
			var note = self.Notes()[i];
			if(!note.chapter_id)
				self.NoteList.push(note);
			else if(self.current_id && self.current_id==note.chapter_id)
				self.NoteList.push(note);
		}
		console.log('getNoteList',self.NoteList());
		return self.NoteList;
	};
	self.getAttachment = ko.computed(function(){
		switch(self.dlgMode()){
			case 'note':
				return self.SelectChapter;
				break;
		}
		console.log('getAttachment',self.dlgMode());
		var arr = ko.observableArray([]);
		arr.push({
			id : 0,
			title : '-'
		});
		return arr;
	});
	self.attachItemTo = function(data){
		// attach current item to sender
		console.log('attachItemTo',data);
	};
	
	self.RemoveObject = function(){
		$('#dynamicDialog').hide();
		var item_id = self.currentObject ? self.currentObject.id : 0;
		switch(self.dlgMode()){
			case 'note':
				BookData.note_remove(item_id);
				self.getNoteList();
				break;
			case 'chapter':
				BookData.chapter_remove(item_id);
				break;
			case 'item':
				// library
				itemLibrary.Remove(self.currentObject);
				self.refreshItemTable();
				break;
		}
		console.log('RemoveObject',self.currentObject,item_id,self.dlgMode());
	};
	BookData.init();
	function check_if_loaded(){
		if(h){
			clearTimeout(h);
			if(!mainEditor){
				self.CreateMainEditor();
			}
		}
		if($('.CodeMirror').length==0 || !$('#mainEditor').data('htmleditor')){
			h = setTimeout(check_if_loaded,1000);
		}else{
			$('.main_editor').parent().show();
			$('.mainEditor').show();
			$('#dynamicDialog').hide();				
		}
	}
	check_if_loaded();
	
	
};

ko.applyBindings(new MainModel());