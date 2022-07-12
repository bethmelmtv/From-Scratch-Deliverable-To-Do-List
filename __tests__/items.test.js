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
    const newToDo = { description: 'need to work out', completed: false };
    const resp = await agent.post('/api/v1/todos').send(newToDo);
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

  it('UPDATE /api/v1/todos/update/:id should update an todo', async () => {
    const [agent] = await registerAndLogin();
    const newToDo = await agent //agent preserves cookie of logged in user
      .post('/api/v1/todos')
      .send({ description: 'get some ice cream' });
    const resp = await agent.put(`/api/v1/todos/${newToDo.body.id}`).send({
      description: 'get some ice cream',
      completed: true,
    });
    expect(resp.status).toEqual(200);
    expect(resp.body.description).toEqual('get some ice cream');
  });

  it('DELETE /api/v1/todos/:id should delete an todo by id', async () => {
    const [agent] = await registerAndLogin();
    const toDo = await agent
      .post('/api/v1/todos')
      .send({ description: 'eat lunch' });
    const resp = await agent.delete(`/api/v1/todos/${toDo.body.id}`);
    expect(resp.status).toEqual(200);
    expect(resp.body.id).toEqual('1');
  });
  afterAll(() => {
    pool.end();
  });
});
