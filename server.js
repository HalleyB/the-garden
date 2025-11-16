#!/usr/bin/env node

/**
 * Simple HTTP server that auto-detects available ports
 * Starts on port 8001 by default, or finds next available port
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const DEFAULT_PORT = 8001;
const MAX_PORT_TRIES = 10;

// MIME types for different file extensions
const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.md': 'text/markdown'
};

function getContentType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    return MIME_TYPES[ext] || 'application/octet-stream';
}

function createServer(port) {
    const server = http.createServer((req, res) => {
        // Parse URL
        let filePath = '.' + req.url;
        if (filePath === './') {
            filePath = './index.html';
        }

        // Security: prevent directory traversal
        const safePath = path.normalize(filePath).replace(/^(\.\.[\/\\])+/, '');
        const absolutePath = path.join(__dirname, safePath);

        // Read and serve file
        fs.readFile(absolutePath, (err, content) => {
            if (err) {
                if (err.code === 'ENOENT') {
                    res.writeHead(404, { 'Content-Type': 'text/html' });
                    res.end('<h1>404 Not Found</h1>', 'utf-8');
                } else {
                    res.writeHead(500);
                    res.end(`Server Error: ${err.code}`, 'utf-8');
                }
            } else {
                const contentType = getContentType(absolutePath);
                res.writeHead(200, { 'Content-Type': contentType });
                res.end(content, 'utf-8');
            }
        });
    });

    return server;
}

function tryPort(port, attempt = 0) {
    if (attempt >= MAX_PORT_TRIES) {
        console.error(`❌ Could not find an available port after ${MAX_PORT_TRIES} attempts`);
        process.exit(1);
    }

    const server = createServer(port);

    server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.log(`⚠️  Port ${port} is already in use, trying ${port + 1}...`);
            tryPort(port + 1, attempt + 1);
        } else {
            console.error('❌ Server error:', err);
            process.exit(1);
        }
    });

    server.listen(port, () => {
        console.log('\n🌱 The Garden - Development Server');
        console.log('═'.repeat(50));
        console.log(`✅ Server running at: http://localhost:${port}`);
        console.log(`📂 Serving files from: ${__dirname}`);
        console.log('═'.repeat(50));
        console.log('\n💡 Tips:');
        console.log('   • Press Ctrl+C to stop the server');
        console.log('   • Press Ctrl/Cmd+T in browser for Testing Mode');
        console.log('   • Open browser console (F12) for debug info\n');

        // Try to open browser (optional, cross-platform)
        const url = `http://localhost:${port}`;
        try {
            const start = process.platform === 'darwin' ? 'open' :
                process.platform === 'win32' ? 'start' : 'xdg-open';
            execSync(`${start} ${url}`, { stdio: 'ignore' });
            console.log('🌐 Opening browser...\n');
        } catch (err) {
            // Silently fail if we can't open browser
        }
    });
}

// Start server
console.log('🚀 Starting development server...\n');
tryPort(DEFAULT_PORT);
