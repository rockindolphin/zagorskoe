'use strict';

const gulp = require('gulp'),
	path = require('path'),
	del = require('del'),
	imagemin = require('gulp-imagemin'),//оптимизация jpeg,png gif
	webp = require('gulp-webp'),//конвертер webp
	chokidar = require('chokidar'),// следит за файлами
	imageminMozjpeg = require('imagemin-mozjpeg'),// оптимизация jpeg
	svgSprite = require("gulp-svg-sprites"),//svg спрайты
	spritesmith = require('gulp.spritesmith'),//png спрайты
	imageResize = require('gulp-image-resize'),// генерит изображения разных размеров
	rename = require('gulp-rename'),
	gulpif = require('gulp-if'),
	pug = require('gulp-pug'), // gulp-pug\node_modules\pug\node_modules\pug-parser\lib - отредактировать список тегов
	args   = require('yargs').argv,
	sourcemaps = require('gulp-sourcemaps'),
	postcss = require('gulp-postcss'),
	cssnext = require('postcss-cssnext'),
	concat = require('gulp-concat'),
	file = require('gulp-file'),
	insert = require('gulp-insert'),
	babel = require('gulp-babel'),	
	browserify = require('gulp-browserify'),
	uglify = require('gulp-uglify'),
	miss = require('mississippi'),
	notifier = require('node-notifier'),
	mkdirp = require('mkdirp'),
	w3cjs = require('gulp-w3cjs'),
	through2 = require('through2'),
	dl = require('directory-list'),
	cleanCSS = require('gulp-clean-css'),
	server = require('gulp-server-livereload');


const src = path.resolve(__dirname, 'src');
const dist = path.resolve(__dirname, 'dist');
const config = require('./tasks_config.json');
const browsers = ['last 2 versions','ie >= 11','> 1%'];

function err_log(error) {
	console.log([
		'',
		"----------ERROR MESSAGE START----------",
		("[" + error.name + " in " + error.plugin + "]"),
		error.message,
		"----------ERROR MESSAGE END----------",
		''
	].join('\n'));
	//this.end();
	notifier.notify({ title: 'Error', message: error.plugin });
}

function pugToHtml(filepath){
	miss.pipe(
		gulp.src( filepath ),
		pug({pretty: '\t', doctype: 'html', locals: {config: config, path: path, gulp: gulp, rename: rename, del: del, images: images}}),
		w3cjs(),
		//w3cjs.reporter(),
		through2.obj(function(file, enc, cb){
			cb(null, file);
			if (!file.w3cjs.success){
				let w3c = file.w3cjs.messages[0];
				err_log({
					name: w3c.message,
					plugin:'w3cjs',
					message:`${w3c.extract}\r\n lastLine:${w3c.lastLine}\r\n lastColumn:${w3c.lastColumn}`});
			}
		}),       
		gulp.dest( path.resolve(dist, 'html') ), 
		(err) => {
			if (err) return err_log(err);
		}
	);
}
/*
function fonts(filepath){
	var fontFolder = path.normalize(filepath).split(path.sep).slice(-2,-1)[0];
	if( fontFolder == '**' ){ fontFolder = ''}
	gulp.src( filepath )
	.pipe( gulp.dest( path.resolve(dist, 'fonts', fontFolder ) ) )
}
*/
function WebP(filepath, size, quality){
	gulp.src( filepath )
	.pipe(
		gulpif(
			size, 
			imageResize( {crop: false, upscale: false, width: size} )
		)
	)
	.pipe(
		gulpif(
			size, 
			rename( (f_path) => { f_path.basename += `-${size}` } )
		)
	)
	.pipe(webp({
		quality: quality,
		preset: 'photo',
		method: 6
	}))			
	.pipe(gulp.dest( path.resolve(dist, 'images') ));						
}

function jpegPngGif(filepath, size, quality){
	gulp.src( filepath )
	.pipe(
		gulpif(
			size, 
			imageResize( {crop: false, upscale: false, width: size} )
		)
	)
	.pipe(
		gulpif(
			size, 
			rename( (f_path) => { f_path.basename += `-${size}` } )
		)
	)
	.pipe( imagemin([
		imagemin.gifsicle({interlaced: true}),
		imagemin.jpegtran({progressive: true}),
		imagemin.optipng({optimizationLevel: 3}),
		imageminMozjpeg({
			quality: quality,
			progressive: true,
		})                 
	]) )		
	.pipe(gulp.dest( path.resolve(dist, 'images') ));
}

function images(filepath, quality){
	quality = quality || 100;
	var generateSizes = config.images.sizes.length > 0 ? true : false;

	jpegPngGif(filepath, false, quality);				
	config.images.webp ? WebP(filepath, false, quality) : false;
	if( config.images.sizes.length > 0 ){
		config.images.sizes.map( (size) => {
			jpegPngGif(filepath, size, quality);				
			config.images.webp ? WebP(filepath, size, quality) : false;
		});
	}
}

function images_svg(filepath){
	gulp.src( filepath )		
	.pipe(gulp.dest( path.resolve(dist, 'images') ));	
}

function sprite_svg(){
	gulp.src( path.resolve(src, 'images', 'sprites', 'svg', '**', '*.svg') )
	.pipe( imagemin([
		imagemin.svgo({
			plugins: [
				{removeViewBox: false},
				{cleanupIDs: false}
			]
		})                 
	]) )	
	.pipe(svgSprite({
		mode: 'symbols',
		svg: {
			symbols: 'sprite.svg'
		},
		preview: {
			symbols: 'sprite_svg.html'
		},											
	}))
	.pipe(gulp.dest( path.resolve(dist, 'images') )) 	
}

function sprite_png(){
	gulp.src( path.resolve(src, 'images', 'sprites', 'png', '**', '*.png') )
	.pipe( imagemin([
		imagemin.optipng({optimizationLevel: 3}),                  
	]) )	
	.pipe(spritesmith({
		imgName: 'sprite.png',
		cssName: '../css/sprite.css',
		imgPath: '../images/sprite.png',
		padding: 5,
	}))
	.pipe(gulp.dest( path.resolve(dist, 'images') ));	
}

gulp.task('server', [], () => {
	return gulp.src( dist )
			.pipe( 
				server({ 
					livereload: true,
					defaultFile: 'html/index.html', 
					open: false, 
					directoryListing: false 
				}) 
			);                  
});

gulp.task('clear_dist', [], () => {
	del.sync( ['./dist/**/*'] );
});

gulp.task('pug', [], () => {
	pugToHtml( [path.resolve(src, 'pug', '*.pug'), '!src/pug/mixins.pug'] );
});

gulp.task('images', [], () => {
	return images( [path.resolve(src, 'images', '**', '*.{jpg,png,gif}'), '!src/images/sprites{,/**}'] );
});

gulp.task('images_svg', [], () => {
	return images_svg( [path.resolve(src, 'images', '**', '*.svg'), '!src/images/sprites{,/**}'] );
});

gulp.task('sprite_svg', [], () => {
	return sprite_svg();
});

gulp.task('sprite_png', [], () => {
	return sprite_png();
});


gulp.task('css', function(){
	var cssPath = path.resolve(src, 'css');
	miss.pipe(
		gulp.src([
			path.resolve(cssPath, 'vendors', 'normalize.css'),
			path.resolve(cssPath, 'vendors', 'swiper.css'),
			path.resolve(cssPath, 'vendors', 'lightbox.css'),
			path.resolve(cssPath, 'style.css'),
			path.resolve(cssPath, 'blocks', '**', '*.css')
		]),
		sourcemaps.init(),
		concat('style.css'),
		postcss([
			//require('postcss-easy-import'),
			cssnext({
				browsers: browsers,
				features: {
					customProperties: {
						preserve: true
					}
				} 
			}),
		]),	
		//cleanCSS({compatibility: '*'}),
		sourcemaps.write('/'),
		gulp.dest( path.resolve(dist, 'css') ), 			
		(err) => {
			if (err) return err_log(err);
		}	
	);			
});
/*
gulp.task('fonts', function(){
	fonts( path.resolve(src, 'fonts', '**', '*') );
});
*/
gulp.task('js', () => {
		miss.pipe(
			gulp.src( [path.resolve(src, 'js', '*.js'), '!src/js/vendors{,/**}'] ),
			sourcemaps.init(),
			babel({
				presets: ['env'],
				plugins: ['es6-promise']			
			}),
			gulpif(
				(args.prod || args.production) || args.browserify,
				browserify({
					insertGlobals : true,
				})
			),
			gulpif(
				(args.prod || args.production) || args.uglify,
				uglify() 			
			),
			sourcemaps.write('/'),
			gulp.dest( path.resolve(dist, 'js') ),
			(err) => {
				if (err) return err_log(err);
			}
		);
	}
);

gulp.task('js_vendors', () => {
		miss.pipe(
			gulp.src( path.resolve(src, 'js', 'vendors', '**', '*.js') ),
			gulp.dest( path.resolve(dist, 'js', 'vendors') ),
			(err) => {
				if (err) return err_log(err);
			}
		);
	}
);


gulp.task('default', ['clear_dist', 'server'], () => {
	
	gulp.start('pug');
	let pug_watcher = chokidar.watch( path.resolve(src, 'pug', '*.pug'), { ignored: /mixins\.pug/, ignoreInitial: true } );
	pug_watcher.on('change', (filepath) => { pugToHtml(filepath) });
	pug_watcher.on('add', (filepath) => { pugToHtml(filepath) });

	gulp.start('images');
	let images_watcher = chokidar.watch( path.resolve(src, 'images', '**', '*.{jpg,png,gif}'), { ignored: /sprites/, ignoreInitial: true } );
	images_watcher.on('change', (filepath) => { images(filepath) });	
	images_watcher.on('add', (filepath) => { images(filepath) });	

	gulp.start('images_svg');
	let images_svg_watcher = chokidar.watch( path.resolve(src, 'images', '**', '*.svg'), { ignoreInitial: true } );
	images_svg_watcher.on('change', (filepath) => { images_svg(filepath) });	
	images_svg_watcher.on('add', (filepath) => { images_svg(filepath) });

	gulp.start('css');
	let css_watcher = chokidar.watch( path.resolve(src, 'css', '**', '*.css'), {ignoreInitial: true} );
	css_watcher.on('change', () => { gulp.start('css') });	
	css_watcher.on('add', () => { gulp.start('css') });	
	/*
	gulp.start('fonts');
	let fonts_watcher = chokidar.watch( path.resolve(src, 'fonts', '**', '*'), {ignoreInitial: true} ); 
	fonts_watcher.on('change', (filepath) => { fonts(filepath) });	
	fonts_watcher.on('add', (filepath) => { fonts(filepath) });	
	*/
	gulp.start('js');
	let js_watcher = chokidar.watch( path.resolve(src, 'js', '**', '*.js'), {ignored: /vendors/, ignoreInitial: true} ); 
	js_watcher.on('change', () => { gulp.start('js') });	
	js_watcher.on('add', () => { gulp.start('js') });

	gulp.start('js_vendors');
	let js_vendors_watcher = chokidar.watch( path.resolve(src, 'js', 'vendors', '**', '*.js'), {ignoreInitial: true} ); 
	js_vendors_watcher.on('change', () => { gulp.start('js_vendors') });	
	js_vendors_watcher.on('add', () => { gulp.start('js_vendors') });

	if( config.images.generateSpriteSvg ){
		gulp.start('sprite_svg');
		let sprite_svg_watcher = chokidar.watch( path.resolve(src, 'images', 'sprites', 'svg', '**', '*'), {ignoreInitial: true} ); 
		sprite_svg_watcher.on('change', () => { sprite_svg() });	
		sprite_svg_watcher.on('add', () => { sprite_svg() });		
	}

	if( config.images.generateSpritePng ){
		gulp.start('sprite_png');
		let sprite_png_watcher = chokidar.watch( path.resolve(src, 'images', 'sprites', 'png', '**', '*'), {ignoreInitial: true} ); 
		sprite_png_watcher.on('change', () => { sprite_png() });	
		sprite_png_watcher.on('add', () => { sprite_png() });	
	}

});

gulp.task('create_files', function(){
	mkdirp('dist', (err)=>{});	
	mkdirp('src', (err)=>{});	
	mkdirp('src/images', (err)=>{});	
	mkdirp('src/images/sprites', (err)=>{});	
	mkdirp('src/images/sprites/png', (err)=>{});	
	mkdirp('src/images/sprites/svg', (err)=>{});	
	//mkdirp('src/fonts', (err)=>{});	
	mkdirp('src/pug', (err)=>{});	
	mkdirp('src/js', (err)=>{});	
	mkdirp('src/css', (err)=>{});	
	mkdirp('src/css/blocks', (err)=>{});	
	file('style.css', `@import 'blocks/blocks.css';\r\n`).pipe(gulp.dest('src/css'));
	file('blocks.css', '').pipe(gulp.dest('src/css/blocks'));
	file('items.json','[]').pipe(gulp.dest('src/css/blocks'));
});


/* bem task */

const 	BEM = require('./bem.js');
gulp.task('bem', function() {
	new Promise((resolve,reject)=>{
		gulp.src( path.resolve(src, 'css', 'blocks', 'items.json') )
		.pipe(insert.transform(function(contents, file) {
			resolve( JSON.parse(contents) );
			return contents;
		}));
	}).then((items)=>{
		if( items.length === 0 ){ err_log({message:'empty items.json',plugin: 'bem'}) }
		BEM(args, items);
		return items;
	});		
});


gulp.task('restore_items_from_files', function(){
	let items = [];
	dl.list( 'src/css/blocks/' , true, function(blocks) {
		blocks.map((block)=>{
			var b = {name:block, elements:[], modificators:[]};
			dl.list( `src/css/blocks/${block}/` , true, function(block_childs) {
				block_childs.map((block_child)=>{
					var em = block_child.match(/^__(.*)/);
					var mm = block_child.match(/^--(.*)/);
					if( em ){ 
						var el = {name:em[1],modificators:[]};
						dl.list( `src/css/blocks/${block}/${em[0]}/` , true, function(element_mods) {
							element_mods.map((element_mod)=>{
								el.modificators.push(element_mod.slice(2));
							});	
						});
						b.elements.push(el); 
					}
					if( mm ){ 
						b.modificators.push(mm[1]) 
					}
				});
			});
			items.push(b);
		});
	});
	file('items.json',JSON.stringify(items)).pipe(gulp.dest( path.resolve(src,'css','blocks') ));
});