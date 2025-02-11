const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

const copydir = require('copy-dir');
const template = require('template_js');
const { extendDeep } = require('@jsmini/extend');

function log() {
    const red = chalk.bold.red;
    const green = chalk.bold.green;
    const blue = chalk.bold.blue;

    const error = console.error;
    const log = console.error;
    const info = console.info;

    console.error = function () {
        error(red.apply(console, arguments));
    };

    console.log = function () {
        log(green.apply(console, arguments));
    };

    console.info = function (){ 
        info(blue.apply(console, arguments));
    };
}

function isTemplate(pathname) {
    return path.extname(pathname) === '.tmpl';
}

function copyDir(from, to, options) {
    copydir.sync(from, to, options);
}

function mkdirSyncGuard(target) {
    try {
        fs.mkdirSync(target, { recursive: true });
    } catch(e) {
        mkdirp(target)
        function mkdirp(dir) {
            if (fs.existsSync(dir)) { return true }
            const dirname = path.dirname(dir)
            mkdirp(dirname)
            fs.mkdirSync(dir)
        }
    }
}

function copyFile(from, to) {
    const buffer = fs.readFileSync(from);
    const parentPath = path.dirname(to);

    if (!fs.existsSync(parentPath)) {
        mkdirSyncGuard(parentPath)
    }

    fs.writeFileSync(to, buffer);  
}

function readTmpl(from, data = {}) {
    const text = fs.readFileSync(from, { encoding: 'utf8' });
    return template(text, data);
}

function copyTmpl(from, to, data = {}) {
    if (!isTemplate(from)) {
        return copyFile(from, to);
    }

    const parentPath = path.dirname(to);

    mkdirSyncGuard(parentPath)

    fs.writeFileSync(to, readTmpl(from, data), { encoding: 'utf8' });
}

function mergeObj2JSON(object, to) {
    const json = JSON.parse(fs.readFileSync(to, { encoding: 'utf8' }));
    
    extendDeep(json, object);
    
    fs.writeFileSync(to, JSON.stringify(json, null, '  '), { encoding: 'utf8' });
}

function mergeJSON2JSON(from, to) {
    const json = JSON.parse(fs.readFileSync(from, { encoding: 'utf8' }));

    mergeObj2JSON(json, to);
}

exports.copyDir = copyDir;
exports.copyFile = copyFile;
exports.readTmpl = readTmpl;
exports.copyTmpl = copyTmpl;
exports.mergeObj2JSON = mergeObj2JSON;
exports.mergeJSON2JSON = mergeJSON2JSON;
exports.log = log;