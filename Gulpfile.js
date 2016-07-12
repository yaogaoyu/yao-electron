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
        html: ['share/html/*.html', 'share/html/**/*.html'],
        lib: ['share/lib/**/*.js']
    },
    _ = 'var/build',
    dst = {
        _: _,
        css: _ + '/css',
        js: _ + '/js',
        html: _ + '/html',
        lib: _ + '/lib',
        package: {
            bundle: _ + '/.bundle',
            cache: _ + '/.cache',
            icon: {
                osx: _ + '/icon.icns',
                win: _ + '/icon.ico'
            },
            electron: {
                asar: true,
                platforms: [
                    'darwin-x64',
                    'win32-ia32',
                    'win32-x64'
                ],
                rebuild: false,
                version: 'v0.29.1'
            },
            id: 'com.yaogd.desktop',
            name: 'yao-electron',
            title: 'YAO-ELECTRON DEMO'
        }
    };

/** 清除打包文件 */
$gulp.task('bundle:clean', function () {
    $del(dst.package.bundle);
});
$gulp.task('clean', function () {
    $del(dst._);
});

/** 生成 HTML */
$gulp.task('html', function () {
    return $gulp.src(src.html, {base: 'share/html'})
        .pipe($replace(/\$\{VERSION\}/g, pkg.version))
        .pipe($gulp.dest(dst.html));
});

/** 第三方库 */
$gulp.task('lib', function () {
    return $gulp.src(src.lib, {base: 'share/lib'})
        .pipe($gulp.dest(dst.lib));
});

/** 生成 CSS */
$gulp.task('css', function () {
    return $gulp.src(src.scss.main)
        .pipe($smap.init())
        .pipe($sass({outputStyle: 'compressed'}))
        .pipe($rename(pkg.version + '.min.css'))
        .pipe($smap.write('.'))
        .pipe($gulp.dest(dst.css));
});

$gulp.task('ts:lint', function () {
    return $gulp.src(src.ts.path)
        .pipe($lint())
        .pipe($lint.report('prose'));
});

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

/** 打包 CSS */
$gulp.task('bundle:css', ['css', 'bundle:clean'], function () {
    return $gulp.src(dst.css + '/' + pkg.version + '.min.css')
        .pipe($gulp.dest(dst.package.bundle + '/css'));
});

/** 打包图片文件 */
$gulp.task('bundle:image', ['bundle:clean'], function () {
    return $gulp.src(src.image)
        .pipe($gulp.dest(dst.package.bundle + '/image'));
});

/** 打包引用库（不包括 第三方引入库 ） */
$gulp.task('bundle:lib', ['lib', 'bundle:clean'], function () {
    return $gulp.src(dst.lib + '/**/*')
        .pipe($gulp.dest(dst.package.bundle + '/lib'));
});

/** 打包 HTML */
$gulp.task('bundle:html', ['html', 'bundle:clean'], function () {
    return $gulp.src(dst.html + '/**/*.html')
        .pipe($plumber())
        .pipe($map(['js', 'css'], map))
        .pipe($gulp.dest(dst.package.bundle + '/html'));
});

/** 打包 JS  */
$gulp.task('bundle:js', ['js', 'bundle:clean'], function () {
    // return $gulp.src(dst.js + '/' + pkg.version + '.min.js')
    //     .pipe($gulp.dest(dst.package.bundle + '/js'));

    // 压缩程序入口文件
    var es = [
        $gulp.src(src.exec)
            .pipe($uglify())
            .pipe($rename('application.min.js'))
            .pipe($gulp.dest(dst.package.bundle + '/js')),
        $gulp.src(dst.js + '/' + pkg.version + '.min.js.map')
            .pipe($gulp.dest(dst.package.bundle + '/js')),
        $gulp.src([src.js, dst.js + '/' + pkg.version + '.min.js'])
            .pipe($smap.init())
            .pipe($uglify())
            .pipe($concat(pkg.version + '.min.js'))
            .pipe($smap.write('.'))
            .pipe($gulp.dest(dst.package.bundle + '/js'))
        //     ,
        // $gulp.src(dst.js + '/main.min.js')
        //     .pipe($concat(dst.js + '/' + pkg.version + '.min.js', {base: '.'}))
        //     .pipe($gulp.dest(dst.package.bundle + '/js'))
    ];
    return $es.merge(es);
    // );

    // for (var ii in (map.js || {})) {
    //     if (map.js.hasOwnProperty(ii)) {
    //         es.push($gulp.src(map.js[ii], {base: '.'})
    //             .pipe($uglify())
    //             .pipe($concat(
    //                 ii.replace(new RegExp('^' + __dirname + '/'), '').replace(/min\.js$/, '.min.js').replace(/13\.15\.\.min\.js$/, '/' + pkg.version + '.min.js')
    //             ))
    //             .pipe($gulp.dest('js'))
    //         );
    //     }
    // }
    // return $es.merge(es);
});

/** 打包 */
$gulp.task('bundle', ['bundle:html', 'bundle:css', 'bundle:image', 'bundle:js', 'bundle:lib'], function () {
    var $json = require('gulp-json-editor');
    return $gulp.src('package.json')
        .pipe($json(function (manifest) {
            manifest.main = 'js/application.min.js';
            delete manifest.repository;
            delete manifest.dependencies;
            delete manifest.devDependencies;
            return manifest;
        }))
        .pipe($gulp.dest(dst.package.bundle));
});

/** 创建 ASAR 包 */
$gulp.task('asar', ['bundle'], function () {
    var $asar = require('gulp-asar');
    return $gulp.src($$config.path.bundle + '/**/*', {base: $$config.path.bundle})
        .pipe($asar('app.asar'))
        .pipe($gulp.dest($$config.path.release));
});

/** 清除构建文件 */
$gulp.task('build:clean', function (cb) {
    $del($$config.path.release + '/' + $$config.electron.version, cb);
});

/** 构建原始程序 */
$gulp.task('build:make', ['bundle', 'build:clean'], function () {
    var $electron = require('gulp-electron'),
        json = require('./package.json');
    return $gulp.src('')
        .pipe($electron({
            src: $$config.path.bundle,
            packageJson: json,
            cache: $$config.path.cache,
            release: $$config.path.release,
            version: $$config.electron.version,
            platforms: $$config.electron.platforms,
            rebuild: $$config.electron.rebuild,
            asar: $$config.electron.asar,
            symbols: false,
            packaging: false,
            platformResources: {
                darwin: {
                    CFBundleDisplayName: '大好创作工具·专业版',
                    CFBundleIdentifier: $$config.id,
                    CFBundleName: $$config.title,
                    CFBundleVersion: json.version,
                    icon: $$config.path.icon.osx
                },
                win: {
                    'version-string': json.version,
                    'file-version': json.version,
                    'product-version': json.version,
                    icon: $$config.path.icon.win
                }
            }
        }))
        .pipe($gulp.dest(''));
});

/** 调整 OS X 程序内部文件以看起来更像原生内容 */
$gulp.task('build:patch', ['build:make'], function () {
    var $xml = require('gulp-xml-editor'),
        osx = $$config.path.release +
            '/' + $$config.electron.version +
            '/darwin-x64/' + $$config.name + '.app/Contents';
    return $es.merge([
        $gulp.src(osx + '/MacOS/Electron')
            .pipe($rename('MacOS/' + $$config.name))
            .pipe($gulp.dest(osx)),
        // $gulp.src(osx + '/Resources/atom.icns')
        //     .pipe($rename('Resources/' + $$config.name + '.icns'))
        //     .pipe($gulp.dest(osx)),
        $gulp.src(osx + '/Info.plist')
            .pipe($xml(function (xml,xmljs) {
                xml.get('//key[text()="CFBundleExecutable"]').nextElement().text($$config.name);
                //注册mac下外部协议。bcp://BigineCreatorPro
                var dict = xml.get('//dict');
                var types = new xmljs.Element(xml, 'key');
                types.text('CFBundleURLTypes');
                dict.addChild(types);

                var typesVal = new xmljs.Element(xml, 'array');

                var typesValDict = new xmljs.Element(xml, 'dict');
                var typesValDictRole = new xmljs.Element(xml, 'key');
                typesValDictRole.text('CFBundleTypeRole');
                var typesValDictRoleVal = new xmljs.Element(xml, 'string');
                typesValDictRoleVal.text('BigineCreatorPro');
                var typesValDictUrlName = new xmljs.Element(xml, 'key');
                typesValDictUrlName.text('CFBundleURLName');
                var typesValDictUrlNameVal = new xmljs.Element(xml, 'string');
                typesValDictUrlNameVal.text('bcp url');
                var typesValDictUrlSchemes = new xmljs.Element(xml, 'key');
                typesValDictUrlSchemes.text('CFBundleURLSchemes');
                var typesValDictUrlSchemesArr = new xmljs.Element(xml, 'array');
                var typesValDictUrlSchemesArrVal = new xmljs.Element(xml, 'string');
                typesValDictUrlSchemesArrVal.text('bcp');
                typesValDictUrlSchemesArr.addChild(typesValDictUrlSchemesArrVal);

                typesValDict.addChild(typesValDictRole);
                typesValDict.addChild(typesValDictRoleVal);
                typesValDict.addChild(typesValDictUrlName);
                typesValDict.addChild(typesValDictUrlNameVal);
                typesValDict.addChild(typesValDictUrlSchemes);
                typesValDict.addChild(typesValDictUrlSchemesArr);

                typesVal.addChild(typesValDict);

                dict.addChild(typesVal);

                return xml;
            }))
            .pipe($gulp.dest(osx)),
        // $gulp.src(osx + '/Frameworks/Electron Helper EH.app/Contents/MacOS/Electron Helper EH')
        //     .pipe($rename('Frameworks/' + $$config.name + ' Helper EH.app/Contents/MacOS/' + $$config.name + ' Helper EH'))
        //     .pipe($gulp.dest(osx)),
        // $gulp.src(osx + '/Frameworks/Electron Helper EH.app/Contents/Info.plist')
        //     .pipe($xml(function (xml) {
        //         xml.get('//key[text()="CFBundleDisplayName"]').nextElement().text($$config.name + ' Helper EH');
        //         xml.get('//key[text()="CFBundleExecutable"]').nextElement().text($$config.name + ' Helper EH');
        //         xml.get('//key[text()="CFBundleIdentifier"]').nextElement().text($$config.id + '.helper.EH');
        //         xml.get('//key[text()="CFBundleName"]').nextElement().text($$config.name + ' Helper EH');
        //         return xml;
        //     }))
        //     .pipe($gulp.dest(osx + '/Frameworks/' + $$config.name + ' Helper EH.app/Contents')),
        // $gulp.src(osx + '/Frameworks/Electron Helper EH.app/Contents/PkgInfo')
        //     .pipe($gulp.dest(osx + '/Frameworks/' + $$config.name + ' Helper EH.app/Contents')),
        // $gulp.src(osx + '/Frameworks/Electron Helper NP.app/Contents/MacOS/Electron Helper NP')
        //     .pipe($rename('Frameworks/' + $$config.name + ' Helper NP.app/Contents/MacOS/' + $$config.name + ' Helper NP'))
        //     .pipe($gulp.dest(osx)),
        // $gulp.src(osx + '/Frameworks/Electron Helper NP.app/Contents/Info.plist')
        //     .pipe($xml(function (xml) {
        //         xml.get('//key[text()="CFBundleDisplayName"]').nextElement().text($$config.name + ' Helper NP');
        //         xml.get('//key[text()="CFBundleExecutable"]').nextElement().text($$config.name + ' Helper NP');
        //         xml.get('//key[text()="CFBundleIdentifier"]').nextElement().text($$config.id + '.helper.NP');
        //         xml.get('//key[text()="CFBundleName"]').nextElement().text($$config.name + ' Helper NP');
        //         return xml;
        //     }))
        //     .pipe($gulp.dest(osx + '/Frameworks/' + $$config.name + ' Helper NP.app/Contents')),
        // $gulp.src(osx + '/Frameworks/Electron Helper NP.app/Contents/PkgInfo')
        //     .pipe($gulp.dest(osx + '/Frameworks/' + $$config.name + ' Helper NP.app/Contents')),
        // $gulp.src(osx + '/Frameworks/Electron Helper.app/Contents/MacOS/Electron Helper')
        //     .pipe($rename('Frameworks/' + $$config.name + ' Helper.app/Contents/MacOS/' + $$config.name + ' Helper'))
        //     .pipe($gulp.dest(osx)),
        // $gulp.src([
        //     osx + '/Frameworks/Electron Helper.app/Contents/Info.plist',
        //     osx + '/Frameworks/Electron Helper.app/Contents/PkgInfo'
        // ])
        //     .pipe($gulp.dest(osx + '/Frameworks/' + $$config.name + ' Helper.app/Contents'))
    ]);
});

/** 构建 */
// $gulp.task('build', ['build:make'], function (cb) {
$gulp.task('build', ['build:patch'], function (cb) {
    var dir = $$config.path.release + '/' + $$config.electron.version,
        osx = dir + '/darwin-x64/' + $$config.name + '.app/Contents';
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

$gulp.task('default', ['css']);
