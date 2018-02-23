#!/usr/bin/env nodejs

const http = require('http');
const fs = require('fs');
const path = require('path');

// template payload
let resourcesPixelMap = {};

// reading resources and calculating data
// for http server
const resReader = require('./modules/resourceReader.js')
resourcesPixelMap = resReader.resourcesPixelMap;

// http server instance
http.createServer((request, response) => {
    const URL_PREFIX = '/bliffoscope/';
    // basic request processing
    // handling html, js, css
    let filePath = '.' + request.url;
    if (filePath == './') {
        filePath = './view/page.html';
    }
    const extname = String(path.extname(filePath)).toLowerCase();
    let contentType = 'text/html';
    const mimeTypes = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css',
    };
    contentType = mimeTypes[extname] || 'application/octet-stream';

    // returning proper content
    fs.readFile(filePath, (error, content) => {
        if (error) {
            return;
        }
        response.writeHead(200, {'Content-Type': contentType});
        // getting text from file chunks
        let textContent = content.toString('utf8');

        // processing main template
        // injecting some payload
        if (contentType === 'text/html'){
            textContent = textContent.replace(/\{\$URL_PREFIX\}/g, URL_PREFIX);
            // TODO: exclude original maps for SlimeTorpedo and Starship
            // before in the processor
            delete resourcesPixelMap.SlimeTorpedo;
            delete resourcesPixelMap.Starship;
            textContent = textContent.replace(/\{\$JS_PAYLOAD\}/g, 'var BliffoscopeRes = ' + JSON.stringify(resourcesPixelMap)  + ';');
        }

        // and throwing to the client
        response.end(textContent, 'utf-8');

    });

}).listen(8081, () => console.log('application at http://localhost:8081 has started'));
