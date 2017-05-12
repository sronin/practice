
// Modules
var fsed            = require('fs');
var gulp            = require('gulp');
var changed         = require('gulp-changed');
var ejs             = require('gulp-ejs');
var imagemin        = require('gulp-imagemin');
var plumber         = require('gulp-plumber');
var rename          = require('gulp-rename');

var postcss         = require('gulp-postcss');
var discardempty    = require('postcss-discard-empty');
var partialimport   = require('postcss-partial-import');
var mergerules      = require('postcss-merge-rules');
var mixins          = require('postcss-mixins');
var nested          = require('postcss-nested');
var normalizeurl    = require('postcss-normalize-url');
var reporter        = require('postcss-reporter');
var short           = require('postcss-short');
var extend          = require('postcss-simple-extend');
var vars            = require('postcss-simple-vars');
var sorting         = require('postcss-sorting');
var inlinecomments  = require('postcss-strip-inline-comments');
var zindex          = require('postcss-zindex');

var autoprefixer    = require('autoprefixer');
var mqpacker        = require('css-mqpacker');
var perfectionist   = require('perfectionist');

var webserver       = require('gulp-webserver');
var ip              = require('my-ip');


// Paths
var src             = 'src/';
var dst             = 'dst/';
var paths           = {
      src:          src,
      src_scss:     src + 'styles/**/*.scss',
      src_scss_exn: '!' + src + 'styles/_**/_*.scss',
      src_js:       src + 'scripts/**/*.js',
      src_imgsvg:   src + 'images/svg/**/*.svg',
      src_imgjpg:   src + 'images/jpg/**/*.jpg',
      src_imgpng:   src + 'images/png/**/*.png',
      src_ejs:      src + 'ejs/**/*.ejs',
      src_ejs_exn:  '!' + src + 'ejs/**/_*.ejs',
      dst:          dst,
      dst_scss:     dst + 'assets/styles',
      dst_js:       dst + 'assets/scripts',
      dst_imgsvg:   dst + 'assets/images',
      dst_imgjpg:   dst + 'assets/images',
      dst_imgpng:   dst + 'assets/images',
};


// Tasks

// server
gulp.task('webserver', function(){
  gulp.src(dst)
    .pipe(webserver({
        host: '0.0.0.0',
        port: 8008,
        livereload: true,
        open : 'http://'+ ip() +':8008/',
    }));
});

// ejs
gulp.task('ejs', function(){
  return gulp.src([paths.src_ejs,paths.src_ejs_exn])
    .pipe(plumber())
    .pipe(changed(paths.dst))
    .pipe(ejs('',{'ext': '.html'}))
    .pipe(htmlprettify({indent_char: ' ', indent_size: 2}))
    .pipe(gulp.dest(paths.dst));
});

// scripts
gulp.task('scripts', function() {
  return gulp.src(paths.src_js)
    .pipe(plumber())
    .pipe(concat('app.js'))
    .pipe(gulp.dest(paths.dst_js))
});

// styles
gulp.task('styles', function () {
  return gulp.src([paths.src_scss, paths.src_scss_exn])
    .pipe(plumber())
    .pipe(postcss([
        perfectionist({
          colorCase: 'lower',
          colorShorthand: 'false',
          format: 'expanded',
          indentSize: '2',
          trimLeadingZero: 'false'
        }),
        partialimport({extension: '.scss'}),
        mqpacker(),
        autoprefixer({browsers: ['> 2%', 'last 3 version']}),
        zindex(),
        vars(),
        mixins(),
        extend(),
        nested(),
        short(),
        sorting({'sort-order': 'smacss'}),
        normalizeurl(),
        mergerules(),
        discardempty(),
        inlinecomments({syntax: scss}),
        reporter({clearMessages: true})
      ]))
    .pipe(rename({
      extname: '.css'
    }))
    .pipe(gulp.dest(paths.dst_scss));
});

// images optimize
gulp.task('imagemin', function(){
  gulp.src(paths.src_imgjpg)
    .pipe(imagemin())
    .pipe(gulp.dest(paths.dst_imgjpg));
  gulp.src(paths.src_imgpng)
    .pipe(imagemin())
    .pipe(gulp.dest(paths.dst_imgpng));
});

// watch
gulp.task('watch', function() {
  gulp.watch([paths.src_scss],['styles']);
  gulp.watch([paths.src_js],['scripts']);
  gulp.watch([paths.src_ejs],['ejs']);
});

// default > $ gulp
//------------------------------------------------------
gulp.task('default',['webserver','watch']);
