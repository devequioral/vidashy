import bcrypt from 'bcryptjs';

const data = {
  users: [
    {
      name: 'John',
      username: 'jhonsmith',
      email: 'admin@example.com',
      password: bcrypt.hashSync('123456'),
      usertype: 'admin',
    },
    {
      name: 'Jane',
      username: 'janesmith',
      email: 'user@example.com',
      password: bcrypt.hashSync('123456'),
      usertype: 'regular',
    },
  ],
  apiaccess: [
    {
      uid: '6d498a2a94a3',
      name: 'Artik Bunker',
      description: 'Organization Description',
      apiaccess: [
        {
          apikey: '1087d55eb85413c9414a064ce04a086695a301d6a61a963f',
          permissions: [
            {
              collection: 'quoter',
              object: {
                name: 'users',
                methods: ['GET', 'POST', 'PATCH', 'DELETE'],
              },
            },
          ],
        },
      ],
    },
  ],
  userCollections: [
    {
      name: 'COLEC_6d498a2a94a3_quoter_users',
      description: 'Users Collection',
      fields: {
        name: { type: String, required: true },
        username: { type: String, required: true },
        email: { type: String, required: true },
        password: { type: String, required: true },
        userType: { type: String, required: true },
      },
      data: [
        {
          name: 'Carlos Perez',
          username: 'carlosperez',
          email: 'user@example.com',
          password:
            '$2a$10$oUHu.0WvRWyrbtNv8auTR.3sI83y/RuLs2p6ZWt0DqLx1eJI7FvJa',
          userType: 'regular',
        },
        {
          name: 'Pedro Perez',
          username: 'pedroperez',
          email: 'user02@example.com',
          password:
            '$2a$10$oUHu.0WvRWyrbtNv8auTR.3sI83y/RuLs2p6ZWt0DqLx1eJI7FvJa',
          userType: 'admin',
        },
      ],
    },
    {
      name: 'COLEC_6d498a2a94a3_quoter_users_def',
      description: 'Users Collection Definition',
      fields: {
        columns: {
          type: String,
          required: true,
        },
      },
      data: [
        {
          columns: JSON.stringify([
            { name: 'name', structure: { type: 'String', required: true } },
            { name: 'username', structure: { type: 'String', required: true } },
            { name: 'email', structure: { type: 'String', required: true } },
            { name: 'password', structure: { type: 'String', required: true } },
            { name: 'userType', structure: { type: 'String', required: true } },
          ]),
        },
      ],
    },
  ],
};

export default data;
