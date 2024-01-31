const express = require('express');
const mysql = require('mysql2');
const session = require('express-session');
const bodyParser = require('body-parser');

const app = express();
const port = 3001;
const db = mysql.createConnection({
    host: 'localhost',
    user: 'phpmyadmin',
    password: '1234567',
    database: 'mydb',
});

db.connect((err) => {
    if (err) {
        console.error('Erro ao conectar ao banco de dados:', err);
        throw err;
    }
    console.log('Conexão com o banco de dados MySQL estabelecida.');
});

// Configurar a sessão
app.use(
    session({
        secret: 'Escreva aqui a senha para criptografar as sessões.',
        resave: true,
        saveUninitialized: true,
    })
);

// Configurar o EJS como motor de visualização
app.set('view engine', 'ejs');
// Configurar o Express para servir arquivos estáticos
app.use(express.static('public'));

// Configurar o body-parser para processar dados do formulário
app.use(bodyParser.urlencoded({ extended: true }));

// Rotas
app.get('/', (req, res) => {
    res.render('index'); // Renderiza a view 'index.ejs'
});

app.get('/contato', (req, res) => {
    res.render('contato'); // Renderiza a view 'contato.ejs'
});

app.get('/postagens', (req, res) => {
    res.render('postagens'); // Renderiza a view 'index.ejs'
});

app.get('/login', (req, res) => {
    res.render('login'); // Renderiza a view 'index.ejs'
});


// Rota para processar o formulário de login
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    const query = 'SELECT * FROM users WHERE username = ? AND password = SHA1(?)';

    db.query(query, [username, password], (err, results) => {
        if (err) throw err;

        if (results.length > 0) {
            req.session.loggedin = true;
            req.session.username = username;
            res.redirect('/dashboard');
        } else {
            // res.send('Credenciais incorretas. <a href="/">Tente novamente</a>');
            res.redirect('/login_failed');
        }
    });
});

app.get('/dashboard', (req, res) => {
    //
    //modificação aqui
    if (req.session.loggedin) {
        //res.send(`Bem-vindo, ${req.session.username}!<br><a href="/logout">Sair</a>`);
        // res.sendFile(__dirname + '/index.html');
        res.render('postadd', { req: req });
    } else {
        res.send('Faça login para acessar esta página. <a href="/">Login</a>');
    }
});

app.get('/postadd', (req, res) => {
    //
    //modificação aqui
    if (req.session.loggedin) {
        //res.send(`Bem-vindo, ${req.session.username}!<br><a href="/logout">Sair</a>`);
        // res.sendFile(__dirname + '/index.html');
        res.render('postadd', { req: req });
    } else {
        res.send('Faça login para acessar esta página. <a href="/">Login</a>');
    }
});

app.get('/cadastrar', (req, res) => {
    res.render('cadastro')
})

app.post('/cadastrar', (req, res) => {
    const { username, password } = req.body;

    // Verifica se o usuário já existe
    const query = 'SELECT * FROM users WHERE username = ? AND password = SHA1(?)';
    db.query(query, [username, password], (err, results) => {
        if (err) throw err;
        // Caso usuário já exista no banco de dados, redireciona para a página de cadastro inválido
        if (results.length > 0) {
            console.log(`Usuário ${username} já existe no banco de dados. redirecionando`);
            res.redirect('/register_failed');
        } else {
            // Cadastra o usuário caso não exista
            const query = 'INSERT INTO users (username, password) VALUES (?, SHA1(?))';
            console.log(`POST /CADASTAR -> query -> ${query}`);
            db.query(query, [username, password], (err, results) => {
                console.log(results);
                //console.log(`POST /CADASTAR -> results -> ${results}`);

                if (err) {
                    console.log(`ERRO NO CADASTRO: ${err}`);
                    throw err;
                }
                if (results.affectedRows > 0) {
                    req.session.loggedin = true;
                    req.session.username = username;
                    res.redirect('/');
                }
            });
        }
    });
});

app.post('/posts', (req, res) => {
    const { titulo, conteudo } = req.body;

    // Verifica se o post já existe
    const query = 'SELECT * FROM posts WHERE titulo = ? AND conteudo = SHA1(?)';
    db.query(query, [titulo, conteudo], (err, results) => {
        if (err) throw err;

        // Caso o post já exista no banco de dados, redireciona para a página de cadastro inválido
        if (results.length > 0) {
            console.log(`Post com título ${titulo} e conteúdo ${conteudo} já existe no banco de dados. Redirecionando`);
            res.redirect('/register_failed');
        } else {
            // Cadastra o post caso não exista
            const insertQuery = 'INSERT INTO posts (titulo, conteudo) VALUES (?, SHA1(?))';
            console.log(`POST /CADASTAR -> query -> ${insertQuery}`);
            
            db.query(insertQuery, [titulo, conteudo], (err, insertResults) => {
                console.log(insertResults);

                if (err) {
                    console.log(`ERRO NO CADASTRO: ${err}`);
                    throw err;
                }

                if (insertResults.affectedRows > 0) {
                    res.redirect('/register_ok');
                }
            });
        }
    });
});

// Rota para processar a saida (logout) do usuário
// Utilize-o para encerrar a sessão do usuário
// Dica 1: Coloque um link de 'SAIR' na sua aplicação web
// Dica 2: Você pode implementar um controle de tempo de sessão e encerrar a sessão do usuário caso este tempo passe.
app.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
});


app.get('/sobre', (req, res) => {
    res.render('sobre'); // Renderiza a view 'index.ejs'
});
app.get('/cadastropost', (req, res) => {
    res.render('cadastropost'); // Renderiza a view 'index.ejs'
});

// Iniciar o servidor
app.listen(port, () => {
    console.log(`Servidor iniciado em http://localhost:${port}`);
});
