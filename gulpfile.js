'use strict';
 
/* node */
var gulp = require('gulp');
var path = require('path');

/* gulp */
var sass   = require('gulp-sass');
var reload = require('gulp-livereload');
var prefix = require('gulp-autoprefixer');
var jshint = require('gulp-jshint');
var shell  = require('gulp-shell');
var map    = require('gulp-sourcemaps');

/* glob */
var glob = {
    scss: './src/scss/**/*.scss',
    script: './src/script/**/*.js'
};

/* error */
var error = function(file, line, column, reason) {
    console.log(' > ' + file + ': ');
    console.log('   + ' + 'line ' + line + ', ' + 'column ' + column);
    console.log('   + ' + reason);
};

/* task:scss */
gulp.task('scss', gulp.parallel(function(done) {
    gulp.src(glob.scss)
        .pipe(map.init())
        .pipe(sass({ 
            outputStyle: 'compressed' 
        }).on('error', function(err) {
            console.log('\nSCSS Syntax Issues:');
            error(err.relativePath, err.line, err.column, err.messageOriginal);
            console.log('');
            gulp.src(glob.scss).pipe(shell('open -a Terminal'));

            this.emit('end');
        }))
        .pipe(prefix({
            browsers: ['last 2 versions'],
            cascade: false
        }))
        .pipe(map.write())
        .pipe(gulp.dest(function(file) { 
            return path.join(path.dirname(file.path), '../css'); 
        }))
        .pipe(reload());

    done();
}));

/* task:script */
gulp.task('script', gulp.parallel(function(done) {
    gulp.src(glob.script)
        .pipe(jshint())
        .pipe(jshint.reporter(function(errors) {
            console.log('\nScript Syntax Issues:');
            errors.forEach(function(err) {
                error(err.file, err.error.line, err.error.character, err.error.reason);
            });
            console.log('');
            gulp.src(glob.script).pipe(shell('open -a Terminal'));
        }))
        .pipe(jshint.reporter('fail'))
        .on('error', function(err) {
            this.emit('end');
        })
        .pipe(reload());

    done();
}));

/* task:watch */
gulp.task('watch', gulp.parallel(function(done) {
    reload.listen();

    gulp.watch(['*.html', '*.php']).on('change', reload.changed);
    gulp.watch(glob.scss).on('change', gulp.parallel(['scss']));
    gulp.watch(glob.script).on('change', gulp.parallel(['script']));

    done();
}));

/* task:default */
gulp.task('default', gulp.parallel('watch', 'scss', 'script'));
