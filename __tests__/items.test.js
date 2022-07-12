const pool = require('../lib/utils/pool');
const setup = require('../data/setup');
const request = require('supertest');
const app = require('../lib/app');
const UserService = require('../lib/services/UserService');
const Item = require('../lib/models/Item');

const mockUser = {
  firstName: 'Beth',
  lastName: 'User',
  email: 'beth@alchemy.com',
  password: '232444242422',
};

const mockUser2 = {
  firstName: 'Martha',
  lastName: 'User',
  email: 'martha@alchemy.com',
  password: '232444242422',
};

const registerAndLogin = async (userProps = {}) => {
  const password = userProps.password ?? mockUser.password;

  const agent = request.agent(app);

  const user = await UserService.create({ ...mockUser, ...userProps });

  const { email } = user;
  await agent.post('/api/v1/users/sessions').send({ email, password });
  return [agent, user];
};

describe('items', () => {
  beforeEach(() => {
    return setup(pool);
  });

  it('POST /api/v1/todos creates a new todo item', async () => {
    const [agent, user] = await registerAndLogin();
    console.log(agent, user, 'agent and user');
    const newToDo = { description: 'need to work out', completed: false };
    const resp = await agent.post('/api/v1/todos').send(newToDo);
    console.log(resp.body, 'RESPONSE BODY');
    expect(resp.status).toEqual(200);
    expect(resp.body).toEqual({
      id: expect.any(String),
      user_id: user.id,
      description: newToDo.description,
      completed: false,
    });
  });

  it('GET /api/v1/todos returns all todo items associated with the authenticated User', async () => {
    const [agent, user] = await registerAndLogin();
    const user2 = await UserService.create(mockUser2);
    const user1Item = await Item.insert({
      description: 'need to get hair dyed',
      completed: false,
      user_id: user.id,
    });
    await Item.insert({
      description: 'need to go grocery shopping',
      completed: false,
      user_id: user2.id,
    });
    const resp = await agent.get('/api/v1/todos');
    // expect(resp.status).toEqual(200);
    expect(resp.body).toEqual([user1Item]);
  });

  it('GET /api/v1/todos should return a 401 if not authenticated', async () => {
    const resp = await request(app).get('/api/v1/todos');
    expect(resp.status).toEqual(401);
  });

  it.only('UPDATE /api/v1/todos/update/:id should update an todo', async () => {
    const [agent, user] = await registerAndLogin();
    const resp = await agent.put('/api/v1/todos/1').send({
      description: 'get some ice cream',
      completed: false,
      user_id: user.id,
    });
    expect(resp.status).toEqual(200);
    expect(resp.body.description).toEqual('get some ice cream');
  });

  it('DELETE /api/v1/todos/:id should delete an todo by id', async () => {
    const [agent, user] = await registerAndLogin();
    const resp = await request(app).delete('/api/v1/todos/delete/:id');
    expect(resp.status).toEqual(200);

    const { body } = await request(app).delete('api/v1/todos/1');
    expect(body.id).toEqual(null);
  });
  afterAll(() => {
    pool.end();
  });
});
