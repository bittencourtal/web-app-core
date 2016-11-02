var gulp = require('gulp');
var jshint = require('gulp-jshint');
var stylish = require('jshint-stylish');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');

var jsOutputFolder = './bundles/js';
var jsOutputVendors = jsOutputFolder + '/vendors.js';
var jsOutputApp = jsOutputFolder + '/app.js';

var cssOutputFolder = './bundles/css';
var cssOutputVendors = cssOutputFolder + '/vendors.css';
var cssOutputMain = cssOutputFolder + '/main.css';
var cssOutputTheming = cssOutputFolder + '/theme.css';

var scripts = {
    app: [
        './vendors/mdThemeColorsDSS/mdThemeColorsDSS.js',
        './vendors/infiniteScroll/infiniteScroll.js',
        './extension-methods/*.js',
        './app.js',
        './config.js',
        './controllers/*.js',
        './services/*.js',
        './directives/*.js',
        './directives/*/*.js',
        './factories/*.js',
        './factories/*/*.js',
        './routes/*.js',
        './modules/*.js',
        './modules/*/*.js',
        './modules/*/*/*.js',
        './modules/*/*/*/*.js'
    ],
    vendors: [
        './bower_components/jquery/dist/jquery.min.js',
        './bower_components/angular/angular.min.js',
        './bower_components/angular-route/angular-route.min.js',
        './bower_components/angular-messages/angular-messages.min.js',
        './bower_components/angular-resource/angular-resource.min.js',
        './bower_components/angular-material/angular-material.min.js',
        './bower_components/angular-animate/angular-animate.min.js',
        './bower_components/angular-aria/angular-aria.min.js',
        './bower_components/angular-cookies/angular-cookies.min.js',
        './bower_components/ngMask/dist/ngMask.min.js',
        './bower_components/moment/min/moment-with-locales.min.js',
        './bower_components/toastr/toastr.min.js',
        './bower_components/jslinq/dist/linq.min.js',
        './bower_components/async/lib/async.js',
        './bower_components/jstorage/jstorage.min.js',
        './bower_components/dss/dist/dss.js',
        './bower_components/tagged-infinite-scroll/taggedInfiniteScroll.js'
    ]
};

var styles = {
    main: [
        './css/structure/*.css'
    ],
    theme: [
        './css/theme/*.css'
    ],
    vendors: [
        './bower_components/toastr/toastr.min.css',
        './bower_components/normalize-css/normalize.css'
    ]
};

gulp.task('jslint', function () {
    return gulp.src([jsOutputApp])
        .pipe(jshint())
        .pipe(jshint.reporter(stylish));
});

gulp.task('scriptVendorsConcat', function () {
    return gulp.src(scripts.vendors)
        .pipe(concat('vendors.js'))
        .pipe(gulp.dest(jsOutputFolder));
});

gulp.task('scriptAppConcat', function () {
    return gulp.src(scripts.app)
        .pipe(concat('app.js'))
        .pipe(gulp.dest(jsOutputFolder));
});

gulp.task('scriptVendorsCompress', function () {
    return gulp.src([jsOutputVendors])
        .pipe(concat('vendors.min.js'))
        .pipe(uglify().on('error', function (e) {
            console.log('\x07', e.message);
            return this.end();
        }))
        .pipe(gulp.dest(jsOutputFolder));
});

gulp.task('scriptAppCompress', function () {
    return gulp.src([jsOutputApp])
        .pipe(concat('app.min.js'))
        .pipe(uglify().on('error', function (e) {
            console.log('\x07', e.message);
            return this.end();
        }))
        .pipe(gulp.dest(jsOutputFolder));
});

gulp.task('styleVendorsConcat', function () {
    return gulp.src(styles.vendors)
        .pipe(concat('vendors.css'))
        .pipe(gulp.dest(cssOutputFolder));
});

gulp.task('styleVendorsCompress', function () {
    return gulp.src([cssOutputVendors])
        .pipe(concat('vendors.min.css'))
        .pipe(uglify().on('error', function (e) {
            console.log('\x07', e.message);
            return this.end();
        }))
        .pipe(gulp.dest(cssOutputFolder));
});

gulp.task('styleMainConcat', function () {
    return gulp.src(styles.main)
        .pipe(concat('main.css'))
        .pipe(gulp.dest(cssOutputFolder));
});

gulp.task('styleThemeConcat', function () {
    return gulp.src(styles.theme)
        .pipe(concat('theme.css'))
        .pipe(gulp.dest(cssOutputFolder));
});

//gulp.task('styleMainCompress', function () {
//    return gulp.src([cssOutputMain])
//        .pipe(concat('main.min.css'))
//        .pipe(uglify().on('error', function (e) {
//            console.log('\x07', e.message);
//            return this.end();
//        }))
//        .pipe(gulp.dest(cssOutputFolder));
//});

gulp.task('scriptsVendors', ['scriptVendorsConcat']); // 'scriptVendorsCompress'
gulp.task('scriptsApp', ['scriptAppConcat', 'scriptAppCompress']);
gulp.task('stylesVendors', ['styleVendorsConcat']);
gulp.task('stylesMain', ['styleMainConcat']);
gulp.task('styleTheme', ['styleThemeConcat']);

gulp.task('watch', function () {
    gulp.watch(scripts.app, ['scriptsApp']);
    gulp.watch(scripts.vendors, ['scriptsVendors']);
    gulp.watch(styles.main, ['stylesMain']);
    gulp.watch(styles.theme, ['styleTheme']);
    gulp.watch(styles.vendors, ['stylesVendors']);
});

gulp.task('default', ['watch', 'scriptsApp', 'scriptsVendors', 'stylesMain', 'styleTheme', 'stylesVendors']);
