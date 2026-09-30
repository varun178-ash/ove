const http = require('http');
const { spawn } = require('child_process');

const PORT = process.env.PORT || 4000;

const ENGINE_PATH =
    process.platform === 'win32'
        ? 'C:\\Users\\cool\\vice\\Vice11\\src\\vice.exe'
        : '/app/engine/vice12_smp';
const engine = spawn(ENGINE_PATH, [], {
    stdio: ['pipe', 'pipe', 'pipe']
});

let engineOutput = '';
let ready = false;
let readyRequested = false;

engine.stdout.on('data', (data) => {
    engineOutput += data.toString();

    if (engineOutput.includes('uciok') && !readyRequested) {
        readyRequested = true;
        engine.stdin.write('isready\n');
    }

    if (engineOutput.includes('readyok') && !ready) {
        ready = true;
        console.log('VICE engine is ready');
    }
});
engine.stderr.on('data', (data) => {
    console.error('VICE:', data.toString());
});

engine.on('error', (error) => {
    console.error('Failed to start VICE:', error);
});

engine.stdin.write('uci\n');

function getBestMove(position, depth, moves = []) {
    return new Promise((resolve, reject) => {

        let output = '';
        let finished = false;

        const positionCommand =
            moves.length > 0
                ? `position ${position} moves ${moves.join(' ')}`
                : `position ${position}`;

        const cleanup = () => {
            engine.stdout.removeListener('data', onData);
        };

        const onData = (data) => {
            output += data.toString();

            const match = output.match(
                /bestmove\s+([a-h][1-8][a-h][1-8][qrbn]?)/
            );

            if (match && !finished) {
                finished = true;
                cleanup();

                console.log('VICE BESTMOVE:', match[1]);

                resolve(match[1]);
            }
        };

        engine.stdout.on('data', onData);

        console.log('SENDING TO VICE:', positionCommand);

        // Tell VICE this is a new search position
        engine.stdin.write(`${positionCommand}\n`);

        const thinkTime = {
            4: 500,
            7: 1000,
            10: 1500
        };

        engine.stdin.write(
            `go movetime ${thinkTime[depth] || 1000}\n`
        );

        setTimeout(() => {
            if (finished) return;

            finished = true;
            cleanup();

            reject(new Error('VICE engine timeout'));
        }, 60000);
    });
}

const server = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    if (req.method === 'GET' && req.url === '/api/status') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            engine: 'VICE',
            ready: ready
        }));
        return;
    }

    if (req.method === 'POST' && req.url === '/api/engine') {
        console.log("ENGINE REQUEST RECEIVED");
        let body = '';

        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', async () => {
            try {
                const data = JSON.parse(body);

                if (!data.position) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({
                        error: 'Position is required'
                    }));
                    return;
                }

                if (!ready) {
                    res.writeHead(503, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({
                        error: 'VICE engine is not ready'
                    }));
                    return;
                }



                const depth = data.depth || 10;

                const bestMove = await getBestMove(
    data.position,
    depth,
    data.moves || []
);



                res.writeHead(200, {
                    'Content-Type': 'application/json'
                });

                res.end(JSON.stringify({
                    bestmove: bestMove
                }));

            } catch (error) {
                console.error(error);

                res.writeHead(500, {
                    'Content-Type': 'application/json'
                });

                res.end(JSON.stringify({
                    error: error.message
                }));
            }
        });

        return;
    }

    res.writeHead(404, {
        'Content-Type': 'application/json'
    });

    res.end(JSON.stringify({
        error: 'Not found'
    }));
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`OVE backend running on port ${PORT}`);
});