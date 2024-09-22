let gulp = require('gulp');
let { src, dest } = require('gulp');
let cleanCSS = require('gulp-clean-css');
let rename = require('gulp-rename');
let autoprefixer = require('gulp-autoprefixer');
let less = require('gulp-less');
let uglify = require('gulp-uglify');

const minCss = () => {
    return src("../assets/*.css")
        .pipe(cleanCSS())
        .pipe(dest("../assets"))
}

const minJs = () => {
    return src("../assets/*.js")
        .pipe(uglify())
        .pipe(dest("../assets"))
}

exports.default = minCss
exports.js = minJs