const { WebSocketServer } = require('ws');
const http = require('http');

// Crear un servidor HTTP básico requerido por la nube
const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Servidor de Chat Activo en la Nube');
});

// Acoplar WebSockets al servidor HTTP
const wss = new WebSocketServer({ server });

console.log('Iniciando servidor para internet...');

wss.on('connection', (ws) => {
    ws.userData = { username: 'Anónimo' };

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);

            // Registro e inicio de sesión
            if (data.type === 'auth') {
                ws.userData.username = data.username;
                ws.send(JSON.stringify({ type: 'system', text: `¡Conectado como ${data.username}!` }));
                return;
            }

            // Mensajes en tiempo real
            if (data.type === 'chat') {
                // Reenviar a todos los conectados en el mundo
                wss.clients.forEach((client) => {
                    if (client.readyState === 1) {
                        client.send(JSON.stringify({
                            type: 'chat',
                            username: ws.userData.username,
                            text: data.text
                        }));
                    }
                });
            }
        } catch (e) {
            console.log('Error de lectura');
        }
    });
});

// Render asigna un puerto automáticamente en process.env.PORT
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});

