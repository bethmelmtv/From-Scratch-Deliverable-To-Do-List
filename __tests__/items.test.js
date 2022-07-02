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
  afterAll(() => {
    pool.end();
  });

  it('POST /api/v1/todos creates a new todo list', async () => {
    const [agent, user] = await registerAndLogin();
    const newToDo = { descriptiton: 'need to work out', completed: false };
    const resp = await agent.post('/api/v1/items').send(newToDo);
    expect(resp.status).toEqual(200);
    expect(resp.body).toEqual({
      id: expect.any(String),
      user_id: user.id,
      description: newToDo.descriptiton,
      completed: false,
    });
  });
});
