const pool = require('../lib/utils/pool');
const setup = require('../data/setup');
const request = require('supertest');
const app = require('../lib/app');

//lets create a test user!
const mockUser = {
  firstName: 'Rebekah',
  lastName: 'User',
  email: 'rebekah@user.com',
  password: '123456',
};


const registerandLogin = async (userProps = {}) => {
  const password = userProps.password ?? mockUser.password;
  const agent = request.agent(app); // creates a mini version of a client to store cookie info
  //and log in info of the user
  // Create an "agent" that gives us the ability
  // to store cookies between requests in a test 

  // Create a user to sign in with
  const user = await UserService.create({...mockUser, ...userProps});

    // ...then sign in
  const { email} = user;
  await (await agent.post('/api/v1/users/sessions')).send({ email, password});
  return [agent, user];

};

describe('backend-express-template routes', () => {
  beforeEach(() => {
    return setup(pool);
    //what does line 34 do?
  });

  it('creates a new user', async() => {
    const res = await request(app).post('/api/v1/users').send(mockUser);
    const { firstName, lastName, email } = mockUser;

    expect(res.body).toEqual({
      id: expect.any(String),
      firstName,
      lastName,
      email,
    });
  });


  afterAll(() => {
    pool.end();
  });
});
