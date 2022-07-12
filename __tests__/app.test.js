const pool = require('../lib/utils/pool');
const setup = require('../data/setup');
const request = require('supertest');
const UserService = require('../lib/services/UserService');
const app = require('../lib/app');

//lets create a test user!
const mockUser = {
  firstName: 'Rebekah',
  lastName: 'User',
  email: 'rebekah@user.com',
  password: '123456',
};

const registerAndLogin = async (userProps = {}) => {
  const password = userProps.password ?? mockUser.password;

  const agent = request.agent(app);

  const user = await UserService.create({ ...mockUser, ...userProps });

  const { email } = user;
  await agent.post('/api/v1/users/sessions').send({ email, password });
  return [agent, user];
};

describe('backend-express-template routes', () => {
  beforeEach(() => {
    return setup(pool);
    //what does line 34 do?
  });

  it('creates a new user', async () => {
    const res = await request(app).post('/api/v1/users').send(mockUser);
    const { firstName, lastName, email } = mockUser;
    expect(res.body).toEqual({
      id: expect.any(String),
      firstName,
      lastName,
      email,
    });
  });

  it('returns the current user', async () => {
    const [agent, user] = await registerAndLogin();
    const me = await agent.get('/api/v1/users/me');
    expect(me.body.email).toEqual(user.email);
  });

  afterAll(() => {
    pool.end();
  });
});
