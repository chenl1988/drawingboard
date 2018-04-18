 var gulp = require('gulp'); //获取gulp
 var browsersync = require('browser-sync').create(); //获取browsersync
 var cache = require('gulp-cache');
 //删除dist目录下文件0
 var del = require('del');
 gulp.task('clean', function(cb) {
     return del(['dist/*'], cb);
 })

 //操作js文件
 var uglify = require('gulp-uglify'); //js压缩插件
 var concat = require('gulp-concat'); //js合并插件
 gulp.task('scripts', function() {
     gulp.src('src/js/**') //需要操作的源文件
         //.pipe(uglify())               //压缩js文件
         //.pipe(concat('app.js'))       //把js文件合并成app.js文件
         .pipe(gulp.dest('dist/js')) //把操作好的文件放到dist/js目录下
         .pipe(browsersync.reload({ stream: true }));
 });

 //操作css文件
 var postcss = require('gulp-postcss');
 var px2rem = require('postcss-px2rem');
 var autoprefixer = require('autoprefixer')
 var less = require('gulp-less') //less文件编译
 var cssmin = require('gulp-minify-css'); //压缩css文件
 /*使用postcss px2rem 得到rem*/
 gulp.task('less', function() {
     var processors = [px2rem({ remUnit: 75 }), autoprefixer({ browsers: ['last 2 versions'] })];

     /*  var processors = [px2rem({ remUnit: 75 })];*/

     gulp.src('src/less/**')
         .pipe(less()) //编译less文件
         .pipe(postcss(processors))
         .pipe(cssmin()) //压缩css
         .pipe(concat('style.css'))
         .pipe(gulp.dest('dist/css/'))
         .pipe(browsersync.reload({ stream: true }));
 });

 gulp.task('css', function() {
     gulp.src('src/css/*.css')
         .pipe(gulp.dest('dist/css'))
         .pipe(browsersync.reload({ stream: true }));
 });
 /*------------------------- 拷贝资源文件 -----------------------------*/
 gulp.task('lib', function() {
     gulp.src('src/lib/**')
         .pipe(cache(imagemin()))
         .pipe(gulp.dest('dist/lib'));
     /* .pipe(browsersync.reload({ stream: true })); */
 });


 var imagemin = require('gulp-imagemin'); //图片压缩插件
 gulp.task('image', function() {
     gulp.src('src/images/**')
         .pipe(cache(imagemin()))
         .pipe(gulp.dest('dist/images'));
     /* .pipe(browsersync.reload({ stream: true })); */
 });

 var htmlmin = require('gulp-htmlmin'); //html压缩插件
 gulp.task('html', function() {
     gulp.src('src/html/*.html')
         .pipe(htmlmin({
             /*collapseWhitespace: true,            //压缩html
             collapseBooleanAttributes: true,     //省略布尔属性的值
             removeComments: true,                //清除html注释
             removeEmptyAttributes: true,         //删除所有空格作为属性值
             removeScriptTypeAttributes: true,    //删除type=text/javascript
             removeStyleLinkTypeAttributes: true, //删除type=text/css
             minifyJS:true,                       //压缩页面js
             minifyCSS:true                       //压缩页面css*/
         }))
         .pipe(gulp.dest('dist/html'))
         .pipe(browsersync.reload({ stream: true }));
 });


 gulp.task('serve', ['clean'], function() {
     gulp.start('scripts', 'less', 'css', 'html', 'image', 'lib');
     browsersync.init({
         port: 2018,
         server: {
             baseDir: ['dist']
         }
     });

     gulp.watch('src/js/**', ['scripts']); //监控文件变化，自动更新
     gulp.watch('src/css/**', ['css']);
     gulp.watch('src/less/**', ['less']);
     gulp.watch('src/images/**', ['image']);
     gulp.watch('src/html/*.html', ['html']);
     gulp.watch('src/lib/*.*', ['lib']);
 });


 gulp.task('default', ['serve']);