'use strict';

const gulp = require('gulp'),
	path = require('path'),
	del = require('del'),
	file = require('gulp-file'),
	insert = require('gulp-insert');

const src = path.resolve(__dirname, 'src');
const dist = path.resolve(__dirname, 'dist');

function err_log(error) {
	console.log([
		'',
		"----------ERROR MESSAGE START----------",
		("[" + error.name + " in " + error.plugin + "]"),
		error.message,
		"----------ERROR MESSAGE END----------",
		''
	].join('\n'));
}

class _Item{
	constructor(opts){
		this.opts = opts || false;
		this.block = opts.block || false;
		this.element = opts.element || false;
		this.modificator = opts.modificator || false;
		this.items = opts.items || false;
		this.sep = '';
		this.prev = false;	
	}
	add(){
		if( this.exists() ){
			throw new Error(`item already exists`);
		}else{		
			this.addInstance();
			this.addFile();
			//this.addImport();		
		}
	}
	remove(){
		if( this.exists() ){
			this.removeInstance();
			this.removeFile();
			//this.removeImport();
		}else{
			throw new Error(`item not found`);			
		}
	}
	importRule(){
		return `@import '${this.shortname()}/${this.fullname()}.css';\r\n`;
	}	
	addFile(){
		file(`${this.fullname()}.css`, `\r\n.${this.fullname()}\{\r\n\r\n\}\r\n\r\n` )
		.pipe(gulp.dest( path.resolve(src, 'css', `${this.folder()}/${this.shortname()}` ) ));
	}
	addImport(){
		gulp.src( path.resolve(src, 'css', this.folder(), `${this.parentname()}.css`) )
		.pipe(insert.prepend( this.importRule() ))
		.pipe(gulp.dest( path.resolve(src, 'css', this.folder()) ));		
	}
	removeFile(){
		del( path.resolve(src, 'css', this.folder(), this.shortname()) );
	}
	removeImport(){
		let self = this;
		gulp.src( path.resolve(src, 'css', this.folder(), `${this.parentname()}.css`) )
		.pipe(insert.transform(function(contents, file){
			contents = contents.replace( self.importRule(), '' );
			return contents;
		}))
		.pipe(gulp.dest( path.resolve(src, 'css', this.folder()) ));
	}				
	updateItems(){
		file('items.json', JSON.stringify(this.items) )
		.pipe(gulp.dest( path.resolve(src, 'css', 'blocks') ));		
	}
}

class _Block extends _Item{
	constructor(opts){
		super(opts);
	}
	fullname(){
		return `${this.block}`;
	}
	shortname(){
		return `${this.sep}${this.block}`;
	}
	folder(){
		return `blocks`;
	}
	parentname(){
		return `blocks`;
	}	
	exists(){
		let rez = false;
		this.items.map((block)=>{
			if( block.name === this.block ){ 
				rez = true;
				return; 
			}
		});
		return rez;
	}
	addInstance(){
		this.items.push({name: this.block, elements: [], modificators: []});
		this.updateItems();		
	}
	removeInstance(){
		this.items = this.items.filter((block)=>{
			return block.name === this.block ? false : true;
		});
		this.updateItems();
	}
}

class _Element extends _Item{
	constructor(opts){
		super(opts);
		this.sep = '__';
	}
	fullname(){
		return `${this.block}${this.sep}${this.element}`;
	}
	shortname(){
		return `${this.sep}${this.element}`;
	}
	folder(){
		return `blocks/${this.block}`;
	}
	parentname(){
		return `${this.block}`;
	}	
	exists(){
		let rez = false;
		this.items.map((block)=>{
			if( block.name === this.block ){
				this.prev = block;
				block.elements.map((element)=>{
					if( element.name === this.element ){ 
						rez = true;
						return; 
					}
				});				
			}
		});
		return rez;
	}
	add(){
		let parent = new _Block(this.opts);
		if( !parent.exists() ){
			throw new Error(`parent item not found`);	
		}
		super.add();
	}	
	addInstance(){
		this.prev.elements.push({name: this.element, modificators: []});		
		this.updateItems();		
	}
	removeInstance(){
		this.prev.elements = this.prev.elements.filter((element)=>{
			return element.name === this.element ? false : true;
		});		
		this.updateItems();		
	}	
}

class _Modificator extends _Item{
	constructor(opts){
		super(opts);
		this.sep = '--';
		this.parent = opts.block&&opts.element ? new _Element(opts) : new _Block(opts);
	}
	fullname(){
		if( this.parent instanceof _Block ){
			return `${this.block}${this.sep}${this.modificator}`;
		}else{
			return `${this.block}${this.parent.sep}${this.element}${this.sep}${this.modificator}`;
		}
	}
	shortname(){
		return `${this.sep}${this.modificator}`;
	}
	folder(){
		if( this.parent instanceof _Block ){
			return `blocks/${this.block}`;
		}else{
			return `blocks/${this.block}/${this.parent.sep}${this.element}`;
		}		
	}
	parentname(){
		if( this.parent instanceof _Block ){
			return `${this.block}`;
		}else{
			return `${this.block}${this.parent.sep}${this.element}`;
		}		
	}	
	exists(){
		let rez = false;
		if( this.parent instanceof _Block ){
			this.items.map((block)=>{
				if( block.name === this.block ){
					this.prev = block; 
					block.modificators.map((modificator)=>{
						if( modificator === this.modificator ){ 
							rez = true;
							return; 
						}
					});				
				}
			});
		}else{
			this.items.map((block)=>{
				if( block.name === this.block ){
					block.elements.map((element)=>{
						if( element.name === this.element ){
							this.prev = element;
							element.modificators.map((modificator)=>{
								if( modificator === this.modificator ){ 
									rez = true;
									return; 
								}
							});								
						}
					});				
				}
			});
		}		
		return rez;
	}
	add(){
		let parent;
		parent = this.parent instanceof _Block ? new _Block(this.opts) : new _Element(this.opts);
		if( !parent.exists() ){
			throw new Error(`parent item not found`);	
		}
		super.add();
	}	
	addInstance(){
		this.prev.modificators.push(this.modificator);					
		this.updateItems();		
	}
	removeInstance(){
		this.prev.modificators = this.prev.modificators.filter((modificator)=>{
			return modificator === this.modificator ? false : true;
		});		
		this.updateItems();		
	}	
}

module.exports = function BEM(args, items){
	let selector = args.add || args.rm;
	let opts = {
		block: selector.match(/^[^(--|__)]*/)[0],
		element: selector.match(/(?:__)([^(--|__)]*)/),
		modificator: selector.match(/(?:--)(.*)$/),
		items: items
	};
	console.log(opts.element);
	opts.element = opts.element !== null ? opts.element[1] : null;
	opts.modificator = opts.modificator !== null ? opts.modificator[1] : null;	
	try{
		if(opts.block&&opts.element&&opts.modificator){	//block__elem--mod
			let modificator = new _Modificator(opts);
			args.add ? modificator.add() : modificator.remove();				
		}else if(opts.block&&opts.element){				//block__elem
			let element = new _Element(opts);
			args.add ? element.add() : element.remove();
		}else if(opts.block&&opts.modificator){			//block--mod
			let modificator = new _Modificator(opts);
			args.add ? modificator.add() : modificator.remove();					
		}else if(opts.block){							//block
			let block = new _Block(opts);
			args.add ? block.add() : block.remove();
		}
	}catch(e){
		err_log(e);
	}
}

