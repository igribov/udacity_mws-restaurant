const gulp = require('gulp'),
  uglify = require('gulp-uglify'),
  imagemin = require('gulp-imagemin'),
  sourcemaps = require('gulp-sourcemaps'),
  babel = require('gulp-babel'),
  cleanCSS = require('gulp-clean-css'),
  del = require('del');

const NODE_ENV = process.env.NODE_ENV || 'production';

const paths = {
  scripts: 'js/*.js',
  styles: 'css/*.css',
  images: 'img/*',
  html: ['index.html', 'restaurant.html'],
};

gulp.task('clean-html', function() {
  return del(['build/*.html']);
});

gulp.task('clean-scripts', function() {
  return del(['build/js']);
});

gulp.task('clean-styles', function() {
  return del(['build/css']);
});

gulp.task('clean-images', function() {
  return del(['build/img']);
});

gulp.task('clean-data', function() {
  return del(['build/data']);
});

gulp.task('scripts', ['clean-scripts'], function() {
  const process = gulp.src(paths.scripts);
  if (NODE_ENV !== 'production') {
    process.pipe(sourcemaps.init());
  }
  return process
    .pipe(babel({
      presets: ['env']
    }))
    .pipe(uglify())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('build/js'));
});

gulp.task('styles', ['clean-styles'], function() {
  const process = gulp.src(paths.styles);
  if (NODE_ENV === 'production') {
    process.pipe(cleanCSS({compatibility: 'ie8'}));
  }
  return process.pipe(gulp.dest('build/css'));
});

// Copy all static images
gulp.task('images', ['clean-images'], function() {
  return gulp.src(paths.images)
  // Pass in options to the task
    .pipe(imagemin({optimizationLevel: 5}))
    .pipe(gulp.dest('build/img'));
});

gulp.task('html', ['clean-html'], function() {
  return gulp.src(paths.html)
    .pipe(gulp.dest('build'));
});

gulp.task('data',['clean-data'], function() {
  return gulp.src(['data/*'])
    .pipe(gulp.dest('build/data'));
});

gulp.task('watch', function() {
  gulp.watch(paths.scripts, ['scripts']);
  gulp.watch(paths.styles, ['styles']);
  gulp.watch(paths.html, ['html']);
});

gulp.task('default', ['scripts', 'styles', 'html', 'data', 'images']);

gulp.task('dev', ['scripts', 'styles', 'html', 'data', 'images', 'watch']);