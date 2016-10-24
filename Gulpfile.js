/**
 * @author    姚尧 <yaogaoyu@gmail.com>
 * @copyright © 2016 yaogd.com
 * @license   GPL-3.0+
 */

var $gulp = require('gulp'),
    $tsc = require('gulp-typescript'),
    $lint = require('gulp-tslint'),
    $sass = require('gulp-sass'),
    $smap = require('gulp-sourcemaps'),
    $plumber = require('gulp-plumber'),
    $map = require('gulp-min-map'),
    $uglify = require('gulp-uglify'),
    $concat = require('gulp-concat'),
    $rename = require('gulp-rename'),
    $insert = require('gulp-insert'),
    $replace = require('gulp-replace'),
    $browserify = require('browserify'),
    $source = require('vinyl-source-stream'),
    $buffer = require('vinyl-buffer'),
    $del = require('del'),
    $es = require('event-stream'),
    $electron = require('gulp-electron'),
    pkg = require('./package.json'),
    map = {},
    src = {
        scss: {
            path: ['share/scss/*.scss', 'share/scss/**/*.scss'],
            main: 'share/scss/application.scss'
        },
        ts: {
            path: ['lib/**/*.ts', 'lib/**/*.tsx'],
            main: 'lib/Application.ts'
        },
        js: 'lib/application.js',
        exec: 'libexec/application.js',
        image: ['share/image/*.jpg', 'share/image/*.png'],
        html: ['libexec/index.html'],
        lib: ['share/lib/**/*'],
        res: 'res/**/*'
    },
    _ = 'var/build',
    dst = {
        _: _,
        css: _ + '/css',
        js: _ + '/js',
        html: _ + '/',
        lib: _ + '/lib',
        res: _ + '/res'
    },
    package = {
        bundle: _ + '/.bundle',
        cache: 'var/.cache',
        icon: {
            osx: 'icon/icon.icns',
            win: 'icon/icon.ico'
        },
        release: 'var/release',
        electron: {
            asar: true,
            platforms: [
                'darwin-x64',
                'win32-ia32',
                'win32-x64'
            ],
            rebuild: false,
            version: 'v0.37.4'
        },
        id: 'com.yaogd.desktop',
        name: 'yao-electron',
        title: 'YAO-ELECTRON DEMO'
    };

/** 重置 */
$gulp.task('reset', ['clean'], function () {
    // 删除已打包的文件
    $del(package.release);
});

/** 清除打包文件 */
$gulp.task('bundle:clean', function () {
    $del(package.bundle);
});
$gulp.task('clean', ['bundle:clean'], function () {
    $del(dst._);
    $del(package.release);
});

/*
 * 生成HTML
 * @private
 */
$gulp.task('html', function () {
    return $gulp.src(src.html)
        .pipe($replace(/\$\{TITLE\}/g, 'DEMO'))
        .pipe($replace(/\$\{VERSION\}/g, pkg.version))
        .pipe($gulp.dest(dst.html));
});

/*
 * 生成 CSS
 * @private
 */
$gulp.task('css', function () {
    return $gulp.src(src.scss.main)
        .pipe($smap.init())
        .pipe($sass({outputStyle: 'compressed'}))
        .pipe($rename(pkg.version + '.min.css'))
        .pipe($smap.write('.'))
        .pipe($gulp.dest(dst.css));
});

/*
 * 第三方库
 * @private
 */
$gulp.task('lib', function () {
    return $gulp.src(src.lib, {base: 'share/lib'})
        .pipe($gulp.dest(dst.lib));
});

/*
 * 语法检查
 * @private
 */
$gulp.task('ts:lint', function () {
    return $gulp.src(src.ts.path)
        .pipe($lint())
        .pipe($lint.report('prose'));
});

/*
 * 解析TS文件
 * @private
 */
$gulp.task('ts:compile', function () {
    var ts = $gulp.src(src.ts.main)
        .pipe($smap.init())
        .pipe($tsc($tsc.createProject('tsconfig.json', {
            outFile: 'application.js',
            typescript: require('typescript')
        })));
    return ts.js
        .pipe($replace(/\$\{VERSION\}/, pkg.version))
        .pipe($insert.append('module.exports=Application;'))
        .pipe($smap.write('.'))
        .pipe($gulp.dest(dst.js));
});

/*
 * 将TS打包成JS
 * @private
 */
$gulp.task('js', ['ts:lint', 'ts:compile'], function () {
    return $browserify({
            debug: true,
            detectGlobals: false
        })
        .require('./' + dst.js + '/application', {
            expose: 'application'
        })
        .bundle()
        .pipe($source(pkg.version + '.min.js'))
        .pipe($buffer())
        .pipe($smap.init({
            loadMaps: true
        }))
        .pipe($uglify())
        .pipe($smap.write('.'))
        .pipe($gulp.dest(dst.js));
});

/*
 * 将TS打包成JS
 * @private
 */
$gulp.task('js:debug', ['ts:lint', 'ts:compile'], function () {
    return $browserify({
            debug: true,
            detectGlobals: false
        })
        .require('./' + dst.js + '/application', {
            expose: 'application'
        })
        .bundle()
        .pipe($source(pkg.version + '.min.js'))
        .pipe($buffer())
        .pipe($gulp.dest(dst.js));
});

/** 打包 CSS */
$gulp.task('bundle:css', ['css', 'bundle:clean'], function () {
    return $gulp.src(dst.css + '/' + pkg.version + '.min.css*')
        .pipe($gulp.dest(package.bundle + '/css'));
});

/** 打包图片文件 */
$gulp.task('bundle:image', ['bundle:clean'], function () {
    return $gulp.src(src.image)
        .pipe($gulp.dest(package.bundle + '/image'));
});

/** 打包引用库（不包括 第三方引入库 ） */
$gulp.task('bundle:lib', ['lib', 'bundle:clean'], function () {
    return $gulp.src(dst.lib + '/**/*')
        .pipe($gulp.dest(package.bundle + '/lib'));
});

/** 打包 HTML */
$gulp.task('bundle:html', ['html', 'bundle:clean'], function () {
    return $gulp.src(dst.html + '/index.html')
        // .pipe($plumber())
        // .pipe($map(['js', 'css'], map))
        .pipe($gulp.dest(package.bundle));
});

/** 打包 JS  */
$gulp.task('bundle:js', ['js', 'bundle:clean'], function () {
    // 压缩程序入口文件
    var es = [
        $gulp.src(src.exec)
            .pipe($uglify())
            .pipe($rename('application.min.js'))
            .pipe($gulp.dest(package.bundle + '/js')),
        $gulp.src([src.js, dst.js + '/' + pkg.version + '.min.js'])
            .pipe($smap.init())
            .pipe($uglify())
            .pipe($concat(pkg.version + '.min.js'))
            .pipe($smap.write('.'))
            .pipe($gulp.dest(package.bundle + '/js'))
    ];
    return $es.merge(es);
});

$gulp.task('bundle:js:debug', ['js:debug', 'bundle:clean'], function () {
    // 压缩程序入口文件
    var es = [
        $gulp.src(src.exec)
            .pipe($uglify())
            .pipe($rename('application.min.js'))
            .pipe($gulp.dest(package.bundle + '/js')),
        $gulp.src(dst.js + '/' + pkg.version + '.min.js.map')
            .pipe($gulp.dest(package.bundle + '/js')),
        $gulp.src([src.js, dst.js + '/' + pkg.version + '.min.js'])
            .pipe($concat(pkg.version + '.min.js'))
            .pipe($gulp.dest(package.bundle + '/js'))
    ];
    return $es.merge(es);
});

/** 构建打包环境 */
$gulp.task('bundle', ['bundle:html', 'bundle:css', 'bundle:image', 'bundle:js', 'bundle:lib'], function () {
    var $json = require('gulp-json-editor');
    return $gulp.src('package.json')
        .pipe($json(function (manifest) {
            manifest.main = 'js/application.min.js';
            manifest.name = 'Yao-electron';
            manifest.description = 'Yao-electron';
            manifest.keywords = ['Yao', 'electron', 'typescript', 'nodejs', '构建桌面应用'];
            manifest.author = 'Yao <yaogaoyu@gmail.com>';
            delete manifest.repository;
            delete manifest.dependencies;
            delete manifest.devDependencies;
            return manifest;
        }))
        .pipe($gulp.dest(package.bundle));
});
$gulp.task('bundle:debug', ['bundle:html', 'bundle:css', 'bundle:image', 'bundle:js:debug', 'bundle:lib'], function () {
    var $json = require('gulp-json-editor');
    return $gulp.src('package.json')
        .pipe($json(function (manifest) {
            manifest.main = 'js/application.min.js';
            delete manifest.repository;
            delete manifest.dependencies;
            delete manifest.devDependencies;
            return manifest;
        }))
        .pipe($gulp.dest(package.bundle));
});

/** 创建 ASAR 包 */
$gulp.task('asar', ['bundle'], function () {
    var $asar = require('gulp-asar');
    return $gulp.src(package.bundle + '/**/*', {base: package.bundle})
        .pipe($asar('app.asar'))
        .pipe($gulp.dest(package.release));
});

/** 清除构建文件 */
$gulp.task('build:clean', function (cb) {
    $del(package.release + '/' + package.electron.version, cb);
});

/** 构建原始程序 */
$gulp.task('build:make', ['bundle'], function () {
    var json = require('./package.json');
    return $gulp.src('')
        .pipe($electron({
            src: package.bundle,
            packageJson: json,
            cache: package.cache,
            release: package.release,
            version: package.electron.version,
            platforms: package.electron.platforms,
            rebuild: package.electron.rebuild,
            asar: package.electron.asar,
            symbols: false,
            packaging: false,
            platformResources: {
                darwin: {
                    CFBundleDisplayName: 'Yao-electron DEMO',
                    CFBundleIdentifier: package.id,
                    CFBundleName: 'Yao-electron DEMO',
                    CFBundleVersion: json.version,
                    icon: package.icon.osx
                },
                win: {
                    'version-string': json.version,
                    'file-version': json.version,
                    'product-version': json.version,
                    icon: package.icon.win
                }
            }
        }))
        .pipe($gulp.dest(''));
});

/** 调整 OS X 程序内部文件以看起来更像原生内容 */
$gulp.task('build:patch', ['build:make'], function () {
    var $xml = require('gulp-xml-editor'),
        osx = package.release +
            '/' + package.electron.version +
            '/darwin-x64/' + package.name + '.app/Contents';
    return $es.merge([
        $gulp.src(osx + '/MacOS/Electron')
            .pipe($rename('MacOS/' + package.name))
            .pipe($gulp.dest(osx)),
        // $gulp.src(osx + '/Resources/atom.icns')
        //     .pipe($rename('Resources/' + package.name + '.icns'))
        //     .pipe($gulp.dest(osx)),
        $gulp.src(osx + '/Info.plist')
            .pipe($xml(function (xml,xmljs) {
                xml.get('//key[text()="CFBundleExecutable"]').nextElement().text('DEMO');
                //注册mac下外部协议。bcp://BigineCreatorPro
                // var dict = xml.get('//dict');
                // var types = new xmljs.Element(xml, 'key');
                // types.text('CFBundleURLTypes');
                // dict.addChild(types);

                // var typesVal = new xmljs.Element(xml, 'array');

                // var typesValDict = new xmljs.Element(xml, 'dict');
                // var typesValDictRole = new xmljs.Element(xml, 'key');
                // typesValDictRole.text('CFBundleTypeRole');
                // var typesValDictRoleVal = new xmljs.Element(xml, 'string');
                // typesValDictRoleVal.text('BigineCreatorPro');
                // var typesValDictUrlName = new xmljs.Element(xml, 'key');
                // typesValDictUrlName.text('CFBundleURLName');
                // var typesValDictUrlNameVal = new xmljs.Element(xml, 'string');
                // typesValDictUrlNameVal.text('bcp url');
                // var typesValDictUrlSchemes = new xmljs.Element(xml, 'key');
                // typesValDictUrlSchemes.text('CFBundleURLSchemes');
                // var typesValDictUrlSchemesArr = new xmljs.Element(xml, 'array');
                // var typesValDictUrlSchemesArrVal = new xmljs.Element(xml, 'string');
                // typesValDictUrlSchemesArrVal.text('bcp');
                // typesValDictUrlSchemesArr.addChild(typesValDictUrlSchemesArrVal);

                // typesValDict.addChild(typesValDictRole);
                // typesValDict.addChild(typesValDictRoleVal);
                // typesValDict.addChild(typesValDictUrlName);
                // typesValDict.addChild(typesValDictUrlNameVal);
                // typesValDict.addChild(typesValDictUrlSchemes);
                // typesValDict.addChild(typesValDictUrlSchemesArr);

                // typesVal.addChild(typesValDict);

                // dict.addChild(typesVal);

                return xml;
            }))
            .pipe($gulp.dest(osx)),
    ]);
});

/** 构建 */
$gulp.task('build', ['build:patch'], function (cb) {
    var dir = package.release + '/' + package.electron.version,
        osx = dir + '/darwin-x64/' + package.name + '.app/Contents';
    $del([
        osx + '/Frameworks/Electron Helper *.app',
        osx + '/MacOS/Electron',
        osx + '/Resources/*.lproj',
        osx + '/Resources/default_app',
        // osx + '/Resources/atom.icns',
        dir + '/darwin-x64/LICENSE',
        dir + '/darwin-x64/version',
        dir + '/win32-ia32/locales',
        dir + '/win32-ia32/resources/default_app',
        dir + '/win32-ia32/LICENSE',
        dir + '/win32-ia32/version',
        dir + '/win32-x64/locales',
        dir + '/win32-x64/resources/default_app',
        dir + '/win32-x64/LICENSE',
        dir + '/win32-x64/version'
    ], cb);
});

$gulp.task('default', ['build']);
