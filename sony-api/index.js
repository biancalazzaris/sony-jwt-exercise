const express = require('express');
const { reset } = require('nodemon');
const app = express();
const jwt = require('jsonwebtoken');

const JWTSecret = 'fecf5580-175a-4199-886c-f1475acca445';

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const DB = {
  games: [
    {
      id: 1,
      title: 'Dino Crisis',
      year: '2002',
    },
    {
      id: 2,
      title: 'Tomb Raides',
      year: '1996',
    }
  ],
  users: [
    {
      id: 1,
      email: 'jose@gmail.com',
      password: '2002',
    },
    {
      id: 2,
      email: 'bianca@gmail.com',
      password: '1234',
    },
    {
      id: 3,
      email: 'cris@gmail.com',
      password: '54321',
    },
  ]
}
function auth(req, res, next) {
  const authToken = req.headers['authorization'];
  console.log(authToken);

  if (authToken !== undefined) {
    // dividindo o nosso token em duas partes
    const bearer = authToken.split(' ');
    console.log('BEARER', bearer);

    const token = bearer[1];

    jwt.verify(token, JWTSecret, (err, data) => {
      if (err) {
        res.status(401);
        res.json({ message: 'ERR6 - TOKEN INVÁLIDO' });
      } else {
        console.log(data);
        req.token = token;
        req.loggedUser = {id: data.id, email: data.email}
        next();
      }
    });
  } else {
    res.status(401);
    res.json({ message: 'ERR7 - Ops, essa rota está protegida não é possivel acessa-la.' })
  }
}


app.get('/games', auth, (req, res) => {
  //res.json({message: 'GAMES UP'})
  console.log(req.loggedUser);
  res.json(DB.games);
});

app.get('/users', (req, res) => {
  //res.json({message: 'GAMES UP'})
  res.json(DB.users)
});

app.post('/auth', (req, res) => {
  const { email, password } = req.body;
  if (email !== undefined) {
    const user = DB.users.find(u => u.email === email);
    if (user !== undefined) {
      if (user.password === password) {
        //gerando nosso token depois do login com sucesso
        //as infos de payload serao id e email 
        //assinatura do token
        jwt.sign({
          id: user.id,
          email: user.email
        }, JWTSecret, { //checando a chave secreta da minah app
          expiresIn: '1h' //tempo de expiração do token 
        }, (err, token) => {
          if (err) {
            console.log(err);
            res.status(400);
            res.json({ message: 'ERR5 Ops, não foi possível gerar o token.' })
          } else {
            res.status(200);
            // res.json({message: 'Usuário logado com suceso, token enviado!'})
            res.json({ token });
          }
        })
      } else {
        res.status(401);
        res.json({ message: 'ERR2: Email ou senha não coincidem.' });
      }
    } else {
      res.status(404);
      res.json({ message: 'ERR3: Usuário não existe' });
    }
  } else {
    res.status(400);
    reset.json({ message: 'ERR1: E-mail ou senha não podem ser nulas' })
  }
});


app.listen(5000, () => {
  console.log('Sony API http://localhost:5000');
})