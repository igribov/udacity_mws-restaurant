const gulp = require('gulp'),
  uglify = require('gulp-uglify'),
  imagemin = require('gulp-imagemin'),
  sourcemaps = require('gulp-sourcemaps'),
  babel = require('gulp-babel'),
  cleanCSS = require('gulp-clean-css'),
  del = require('del'),
  imageResize = require('gulp-image-resize'),
  rename = require("gulp-rename");

const NODE_ENV = process.env.NODE_ENV || 'production';

const paths = {
  scripts: ['js/process.js', 'js/main.js', 'js/restaurant_info.js', 'js/dbhelper.js'],
  sw: ['js/sw.js'],
  styles: 'css/*.css',
  images_src: 'img_src/*',
  images: 'img/*',
  html: ['index.html', 'restaurant.html'],
};

gulp.task('clean-html', function () {
  return del(['build/*.html']);
});

gulp.task('clean-scripts', function () {
  return del(['build/js']);
});

gulp.task('clean-sw', function () {
  return del(['build/sw.js']);
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

gulp.task('scripts', ['clean-scripts'], function () {
  const process = gulp.src(paths.scripts);
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
  return process.pipe(gulp.dest('build/js'));
});

gulp.task('sw', ['clean-sw'], function () {
  return gulp.src(paths.sw)
    .pipe(babel({
      presets: ['env']
    }))
    .pipe(gulp.dest('build'));
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

gulp.task('data', ['clean-data'], function () {
  return gulp.src(['data/*'])
    .pipe(gulp.dest('build/data'));
});

gulp.task('watch', function () {
  gulp.watch(paths.scripts, ['scripts']);
  gulp.watch(paths.sw, ['sw']);
  gulp.watch(paths.styles, ['styles']);
  gulp.watch(paths.html, ['html']);
});

gulp.task('default', ['scripts','sw', 'styles', 'html', 'data', 'images']);

gulp.task('dev', ['scripts','sw', 'styles', 'html', 'data', 'images', 'watch']);