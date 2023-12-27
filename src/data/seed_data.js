import bcrypt from 'bcryptjs';

function generateUUID() {
  let d = new Date().getTime();
  const uuid = 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    // eslint-disable-next-line no-bitwise
    const r = (d + Math.random() * 16) % 16 | 0;
    // eslint-disable-next-line no-bitwise
    d = Math.floor(d / 16);
    // eslint-disable-next-line no-bitwise
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
  return uuid;
}

function generateOrders(numorders) {
  const orders = [];
  for (let i = 0; i < numorders; i++) {
    orders.push({
      userid: '1',
      id: generateUUID(),
      status: 'pendiente',
      product: JSON.stringify({
        id: '1',
        productName: 'Arctic bunker 01',
        addons: [
          {
            id: 'addon-01',
            name: 'Seguridad',
            options: [
              {
                id: 'option-01',
                selected: false,
              },
              {
                id: 'option-02',
                selected: false,
              },
              {
                id: 'option-03',
                selected: false,
              },
            ],
          },
          {
            id: 'addon-02',
            name: 'Energía',
            options: [
              {
                id: 'option-04',
                selected: false,
              },
              {
                id: 'option-05',
                selected: false,
              },
              {
                id: 'option-06',
                selected: false,
              },
            ],
          },
          {
            id: 'addon-03',
            name: 'Protección Desastres',
            options: [
              {
                id: 'option-07',
                selected: false,
              },
              {
                id: 'option-08',
                selected: false,
              },
              {
                id: 'option-09',
                selected: false,
              },
            ],
          },
          {
            id: 'addon-04',
            name: 'Refrigeración',
            options: [
              {
                id: 'option-10',
                selected: false,
              },
              {
                id: 'option-11',
                selected: false,
              },
              {
                id: 'option-12',
                selected: false,
              },
            ],
          },
        ],
      }),
    });
  }
  return orders;
}

const data = {
  users: [
    {
      id: '1',
      name: 'John',
      username: 'jhonsmith',
      email: 'admin@example.com',
      password: bcrypt.hashSync('123456'),
      role: 'admin',
    },
    {
      id: '2',
      name: 'Jane',
      username: 'janesmith',
      email: 'user@example.com',
      password: bcrypt.hashSync('123456'),
      role: 'regular',
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
            {
              collection: 'quoter',
              object: {
                name: 'orders',
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
        id: { type: String, required: true, unique: true },
        name: { type: String, required: true },
        username: { type: String, required: true },
        email: { type: String, required: true },
        password: { type: String, required: true },
        role: { type: String, required: true },
      },
      data: [
        {
          id: '1',
          name: 'Carlos Perez',
          username: 'carlosperez',
          email: 'user@example.com',
          password:
            '$2a$10$oUHu.0WvRWyrbtNv8auTR.3sI83y/RuLs2p6ZWt0DqLx1eJI7FvJa',
          role: 'regular',
        },
        {
          id: '2',
          name: 'Pedro Perez',
          username: 'pedroperez',
          email: 'user02@example.com',
          password:
            '$2a$10$oUHu.0WvRWyrbtNv8auTR.3sI83y/RuLs2p6ZWt0DqLx1eJI7FvJa',
          role: 'admin',
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
            {
              name: 'id',
              structure: { type: 'String', required: true, unique: true },
            },
            { name: 'name', structure: { type: 'String', required: true } },
            { name: 'username', structure: { type: 'String', required: true } },
            { name: 'email', structure: { type: 'String', required: true } },
            { name: 'password', structure: { type: 'String', required: true } },
            { name: 'role', structure: { type: 'String', required: true } },
          ]),
        },
      ],
    },
    {
      name: 'COLEC_6d498a2a94a3_quoter_orders',
      description: 'Users Orders',
      fields: {
        id: { type: String, required: true, unique: true },
        userid: { type: String, required: true },
        status: { type: String, required: true },
        product: { type: String, required: true },
      },
      data: generateOrders(20),
    },
    {
      name: 'COLEC_6d498a2a94a3_quoter_orders_def',
      description: 'Users Orders Definition',
      fields: {
        columns: {
          type: String,
          required: true,
        },
      },
      data: [
        {
          columns: JSON.stringify([
            {
              name: 'id',
              structure: { type: 'String', required: true, unique: true },
            },
            { name: 'userid', structure: { type: 'String', required: true } },
            { name: 'status', structure: { type: 'String', required: true } },
            { name: 'product', structure: { type: 'String', required: true } },
          ]),
        },
      ],
    },
  ],
};

export default data;
