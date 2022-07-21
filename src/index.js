const express = require('express');
const cors = require('cors');

 const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const {username} = request.headers;
  const user = users.find((user) => user.username === username);
  if(!user){
      return response.status(404).json({ error: 'Usuario nao encontrado'});
  }
  request.user = user;
  return next();
}

app.post('/users', (request, response) => {
  const {name, username} = request.body;
   const userAlreadyExists = users.some((user) => user.username === username);
   if (userAlreadyExists){
    return response.status(400).json({ error: 'Usuario ja existe' });
   }
   const newUser = {
    id : uuidv4(),
    name,
    username,
    todos: []
   };
   users.push(newUser);
   
   response.status(201).json(newUser);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
   return response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { deadline, title } = request.body;
    const { user } = request;
    const todoOperation = {
        id : uuidv4(),
        title,
        done : false,
        deadline: new Date(deadline),
        created_at: new Date()

    }
    user.todos.push(todoOperation);
    return response.status(201).json(todoOperation);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
    const {user} = request;
    const TodoExist = user.todos.find((todos) => todos.id === id );
    
    const { deadline, title } = request.body;
    if(TodoExist){
        TodoExist.deadline = deadline,
        TodoExist.title = title
        return response.status(201).json(TodoExist);
    }

    else {
        return response.status(404).json({ error: 'tarefa nao existente'});
    }
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
    const { user } = request;
    const TodoExist = user.todos.find((todos) => todos.id === id );
    if(TodoExist){
        TodoExist.done = true;

        return response.status(201).json(TodoExist);
    }
    else {
        return response.status(404).json({ error: 'tarefa nao existente'});
    }
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
    const { user } = request;
    const TodoExist = user.todos.find((todos) => todos.id === id );
    const FindIndex = user.todos.findIndex((todos) => todos.id === id);
    if(TodoExist){
        user.todos.splice(FindIndex, 1);
        return response.status(204).send();
    }
    else {
        return response.status(404).json({ error: 'tarefa nao existente'});
    }

});

module.exports = app;