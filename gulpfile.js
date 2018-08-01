const gulp = require('gulp'),
  uglify = require('gulp-uglify'),
  imagemin = require('gulp-imagemin'),
  sourcemaps = require('gulp-sourcemaps'),
  babel = require('gulp-babel'),
  cleanCSS = require('gulp-clean-css'),
  del = require('del'),
  imageResize = require('gulp-image-resize'),
  rename = require("gulp-rename"),
  es = require('event-stream'),
  path = require('path'),
  template = require('gulp-template');

const browserify = require('browserify');
const babelify = require('babelify');
const buffer = require('vinyl-buffer');
const source = require('vinyl-source-stream');

const NODE_ENV = process.env.NODE_ENV || 'production';

const paths = {
  scripts: [
    'src/js/process.js',
    'src/js/accessibility-select.js',
    'src/js/task-service.js',
    'src/js/rating-select.js',
    'src/js/main.js',
    'src/js/dbhelper.js',
    'src/js/restaurant_info.js',
  ],
  entries: [
    'src/js/main.js',
    'src/js/restaurant_info.js',
  ],
  sw: ['src/js/sw.js'],
  taskWorker: ['src/js/task-worker.js'],
  styles: 'src/css/*.css',
  images_src: 'src/img_src/*',
  images: 'src/img/*',
  html: ['src/index.html', 'src/restaurant.html'],
  manifest: ['src/manifest.json'],
};

gulp.task('clean-html', function () {
  return del(['build/*.html']);
});


gulp.task('clean-manifest', function () {
  return del(['build/manifest.json']);
});

gulp.task('clean-scripts', function () {
  return del(['build/js']);
});

gulp.task('clean-sw', function () {
  return del(['build/sw.js']);
});

gulp.task('clean-worker', function () {
  return del(['build/task-worker.js']);
});

gulp.task('clean-styles', function () {
  return del(['build/css']);
});

gulp.task('clean-images', function () {
  return del(['build/img']);
});

gulp.task('clean-resized-images', function () {
  return del([paths.images]);
});

gulp.task('clean-data', function () {
  return del(['build/data']);
});

gulp.task('sw', ['clean-sw'], function () {
  return gulp.src(paths.sw)
    .pipe(template({ sw_version: 'v' + new Date().getTime() }))
    .pipe(babel({
      presets: ['env']
    }))
    .pipe(gulp.dest('build'));
});

gulp.task('worker', ['clean-worker'], function () {
  return gulp.src(paths.taskWorker)
    .pipe(babel({
      presets: ['env']
    }))
    .pipe(gulp.dest('build'));
});

gulp.task('scripts', ['clean-scripts'], function () {

  const tasks = paths.entries.map(function(entry) {
    const browserifyObj = browserify({
      entries: [entry],
      transform: babelify,
      debug: true
    });

    const process = browserifyObj.bundle()
      .pipe(source(path.basename(entry, '.js')))
      .pipe(rename({
        extname: '.js'
      }))
      .pipe(buffer());

    if (NODE_ENV !== 'production') {
      process.pipe(sourcemaps.init());
    }
    process.pipe(babel({
      presets: ['env']
    }))
    .pipe(uglify());

    if (NODE_ENV !== 'production') {
      process.pipe(sourcemaps.write());
    }
    process.pipe(gulp.dest('build/js'));
    return process;
  });

  return es.merge.apply(null, tasks);
});

gulp.task('styles', ['clean-styles'], function () {
  const process = gulp.src(paths.styles);
  if (NODE_ENV === 'production') {
    process.pipe(cleanCSS({compatibility: 'ie8'}));
  }
  return process.pipe(gulp.dest('build/css'));
});

// Copy all static images
gulp.task('images', ['clean-images'], function () {
  return gulp.src(paths.images)
    .pipe(imagemin({optimizationLevel: 5}))
    .pipe(gulp.dest('build/img'));
});

gulp.task('img-resize', ['clean-resized-images'], function () {
  return gulp.src(paths.images_src)
    .pipe(imageResize({
      width: 1000,
      height: 1000,
      crop: false,
      upscale: false,
      imageMagick: true
    }))
    .pipe(rename(function (path) {
      path.basename += "_large";
    }))
    .pipe(gulp.dest('img'))
    .pipe(imageResize({
      width: 700,
      height: 700,
      crop: false,
      upscale: false,
      imageMagick: true
    }))
    .pipe(rename(function (path) {
      path.basename = path.basename.replace('_large', '_medium');
    }))
    .pipe(gulp.dest('img'))
    .pipe(imageResize({
      width: 350,
      height: 350,
      crop: false,
      upscale: false,
      imageMagick: true
    }))
    .pipe(rename(function (path) {
      path.basename = path.basename.replace('_medium', '_small');
    }))
    .pipe(gulp.dest('img'));
});

gulp.task('html', ['clean-html'], function () {
  return gulp.src(paths.html)
    .pipe(gulp.dest('build'));
});

gulp.task('manifest', ['clean-manifest'], function () {
  return gulp.src(paths.manifest)
    .pipe(gulp.dest('build'));
});

gulp.task('data', ['clean-data'], function () {
  return gulp.src(['src/data/*'])
    .pipe(gulp.dest('build/data'));
});

gulp.task('watch', function () {
  gulp.watch(paths.scripts, ['sw', 'scripts']);
  gulp.watch(paths.sw, ['sw']);
  gulp.watch(paths.taskWorker, ['worker']);
  gulp.watch(paths.styles, ['styles']);
  gulp.watch(paths.html, ['html']);
  gulp.watch(paths.manifest, ['manifest']);
});

gulp.task('default', ['scripts','sw', 'worker', 'styles', 'html', 'manifest', 'data', 'images']);

gulp.task('dev', ['scripts','sw', 'worker', 'styles', 'html', 'manifest', 'data', 'images', 'watch']);