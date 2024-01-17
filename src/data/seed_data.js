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
      //RANDOM USERID BETWEEN 1 AND 2
      userid: `${Math.floor(Math.random() * 2) + 1}`,
      id: generateUUID(),
      //RANDOM STATUS BETWEEN pendientes, procesada, completada, cancelada
      status: ['pendiente', 'procesada', 'completada', 'cancelada'][
        Math.floor(Math.random() * 4)
      ],
      product: {
        id: '1',
        productName: 'Arctic bunker 01',
        productImage: {
          src: '/assets/images/temp/product-01-medium-t.png',
          width: 158,
          height: 319,
        },
        addons: [
          {
            id: 'addon-01',
            name: 'Seguridad',
            options: [
              {
                id: 'option-01',
                text: 'Autenticador Biométrico',
                selected: false,
              },
              {
                id: 'option-02',
                text: 'Lector de Tarjeta Magnética',
                selected: false,
              },
              {
                id: 'option-03',
                text: 'CCTV 24 horas',
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
                text: 'Actualización de energía',
                selected: false,
              },
              {
                id: 'option-05',
                text: 'Protección electromagnética',
                selected: false,
              },
              {
                id: 'option-06',
                text: 'UPS Adicional 8 horas',
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
                text: 'Alarma y extinción de incendios',
                selected: false,
              },
              {
                id: 'option-08',
                text: 'Sellos ignífugos para pase de cables',
                selected: false,
              },
              {
                id: 'option-09',
                text: 'Sistema de anti vibración',
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
                text: 'Sistema de Enfriamiento Adicional',
                selected: false,
              },
              {
                id: 'option-11',
                text: 'Sistema Automático de Refrigeración',
                selected: false,
              },
              {
                id: 'option-12',
                text: 'Sellos Anti Calentamiento',
                selected: false,
              },
            ],
          },
        ],
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }
  return orders;
}

function generateProducts(numproducts) {
  const products = [];
  for (let i = 0; i < numproducts; i++) {
    products.push({
      id: generateUUID(),
      productName: `Arctic bunker 0${i + 1}`,
      productSubtitle: 'Personalice su producto',
      description:
        'Ocupa muy poco espacio, lo que permite una implementación rápida dentro de un espacio limitado y proporciona 10 tipos de soluciones que requieren capacidades de suministro de energía de 20kVA.',
      productImage: {
        src: '/assets/images/temp/product-01-medium-t.png',
        width: 158,
        height: 319,
      },
      productImageSM: {
        src: '/assets/images/temp/product-01-t.png',
        width: 105,
        height: 213,
      },
      addons: [
        {
          id: 'addon-01',
          name: 'Seguridad',
          description:
            'Su sistema esta seguro, pero puede seguir agregando complementos de seguridad para hacerlo más seguro.',
          icon: {
            src: '/assets/images/icon-security.svg',
            width: 20,
            height: 20,
          },
          defaultPercent: 60,
          color: '#82BB30',
          options: [
            {
              id: 'option-01',
              text: 'Autenticador Biométrico',
              help: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quo, quae.',
              percent: 20,
              selected: false,
            },
            {
              id: 'option-02',
              text: 'Lector de Tarjeta Magnética',
              help: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quo, quae.',
              percent: 10,
              selected: false,
            },
            {
              id: 'option-03',
              text: 'CCTV 24 horas',
              help: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quo, quae.',
              percent: 10,
              selected: false,
            },
          ],
        },
        {
          id: 'addon-02',
          name: 'Energía',
          description:
            'Su sistema tiene suficiente energía para operar, pero puede seguir agregando complementos de energía para hacerlo más eficiente.',
          icon: {
            src: '/assets/images/icon-energy.svg',
            width: 20,
            height: 20,
          },
          defaultPercent: 60,
          color: '#303EBB',
          options: [
            {
              id: 'option-04',
              text: 'Actualización de energía',
              help: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quo, quae.',
              percent: 20,
              selected: false,
            },
            {
              id: 'option-05',
              text: 'Protección electromagnética',
              help: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quo, quae.',
              percent: 10,
              selected: false,
            },
            {
              id: 'option-06',
              text: 'UPS Adicional 8 horas',
              help: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quo, quae.',
              percent: 10,
              selected: false,
            },
          ],
        },
        {
          id: 'addon-03',
          name: 'Protección Desastres',
          description:
            'Su sistema tiene suficiente protección contra desastres, pero puede seguir agregando complementos de energía para protegerlo más.',
          icon: {
            src: '/assets/images/icon-fire.svg',
            width: 20,
            height: 20,
          },
          defaultPercent: 60,
          color: '#EEA435',
          options: [
            {
              id: 'option-07',
              text: 'Alarma y extinción de incendios',
              help: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quo, quae.',
              percent: 20,
              selected: false,
            },
            {
              id: 'option-08',
              text: 'Sellos ignífugos para pase de cables',
              help: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quo, quae.',
              percent: 10,
              selected: false,
            },
            {
              id: 'option-09',
              text: 'Sistema de anti vibración',
              help: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quo, quae.',
              percent: 10,
              selected: false,
            },
          ],
        },
        {
          id: 'addon-04',
          name: 'Refrigeración',
          description:
            'Su sistema tiene suficiente protección contra desastres, pero puede seguir agregando complementos de energía para protegerlo más.',
          icon: {
            src: '/assets/images/icon-cold.svg',
            width: 20,
            height: 20,
          },
          defaultPercent: 60,
          color: '#35B6EE',
          options: [
            {
              id: 'option-10',
              text: 'Sistema de Enfriamiento Adicional',
              help: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quo, quae.',
              percent: 20,
              selected: false,
            },
            {
              id: 'option-11',
              text: 'Sistema Automático de Refrigeración',
              help: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quo, quae.',
              percent: 10,
              selected: false,
            },
            {
              id: 'option-12',
              text: 'Sellos Anti Calentamiento',
              help: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quo, quae.',
              percent: 10,
              selected: false,
            },
          ],
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: Math.random() < 0.5 ? 'disponible' : 'agotado',
    });
  }
  return products;
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
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '2',
      name: 'Jane',
      username: 'janesmith',
      email: 'user@example.com',
      password: bcrypt.hashSync('123456'),
      role: 'regular',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  apiaccess: [
    {
      uid: '6d498a2a94a3',
      name: 'Arctic Bunker',
      description: 'Organization Description',
      apiaccess: [
        {
          apikey: '1087d55eb85413c9414a064ce04a086695a301d6a61a963f',
          permissions: [
            {
              client_collection: 'quoter',
              object: {
                name: 'users',
                methods: ['GET', 'POST', 'PATCH', 'DELETE'],
              },
            },
            {
              client_collection: 'quoter',
              object: {
                name: 'orders',
                methods: ['GET', 'POST', 'PATCH', 'DELETE'],
              },
            },
            {
              client_collection: 'quoter',
              object: {
                name: 'products',
                methods: ['GET', 'POST', 'PATCH', 'DELETE'],
              },
            },
            {
              client_collection: 'quoter',
              object: {
                name: 'addons',
                methods: ['GET', 'POST', 'PATCH', 'DELETE'],
              },
            },
            {
              client_collection: 'quoter',
              object: {
                name: 'media',
                methods: ['PUT'],
              },
            },
          ],
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  // userCollections: [
  //   {
  //     name: 'COLEC_6d498a2a94a3_quoter_users',
  //     description: 'Users Collection',
  //     data: [
  //       {
  //         id: '1',
  //         name: 'Carlos Perez',
  //         username: 'carlosperez',
  //         email: 'user@example.com',
  //         password:
  //           '$2a$10$oUHu.0WvRWyrbtNv8auTR.3sI83y/RuLs2p6ZWt0DqLx1eJI7FvJa',
  //         role: 'regular',
  //         createdAt: new Date().toISOString(),
  //         updatedAt: new Date().toISOString(),
  //       },
  //       {
  //         id: '2',
  //         name: 'Pedro Perez',
  //         username: 'pedroperez',
  //         email: 'user02@example.com',
  //         password:
  //           '$2a$10$oUHu.0WvRWyrbtNv8auTR.3sI83y/RuLs2p6ZWt0DqLx1eJI7FvJa',
  //         role: 'regular',
  //         createdAt: new Date().toISOString(),
  //         updatedAt: new Date().toISOString(),
  //       },
  //       {
  //         id: '3',
  //         name: 'Ronald Perez',
  //         username: 'ronaldperez',
  //         email: 'admin@example.com',
  //         password:
  //           '$2a$10$oUHu.0WvRWyrbtNv8auTR.3sI83y/RuLs2p6ZWt0DqLx1eJI7FvJa',
  //         role: 'admin',
  //         createdAt: new Date().toISOString(),
  //         updatedAt: new Date().toISOString(),
  //       },
  //     ],
  //   },
  //   {
  //     name: 'COLEC_6d498a2a94a3_quoter_orders',
  //     description: 'Users Orders',
  //     data: generateOrders(2),
  //   },
  // ],
  userDatabases: [
    {
      name: 'DB_6d498a2a94a3_quoter',
      userCollections: [
        {
          name: 'users',
          data: [
            {
              id: '1',
              name: 'Carlos Perez',
              username: 'carlosperez',
              email: 'user@example.com',
              password:
                '$2a$10$oUHu.0WvRWyrbtNv8auTR.3sI83y/RuLs2p6ZWt0DqLx1eJI7FvJa',
              role: 'regular',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            {
              id: '2',
              name: 'Pedro Perez',
              username: 'pedroperez',
              email: 'user02@example.com',
              password:
                '$2a$10$oUHu.0WvRWyrbtNv8auTR.3sI83y/RuLs2p6ZWt0DqLx1eJI7FvJa',
              role: 'regular',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            {
              id: '3',
              name: 'Ronald Perez',
              username: 'ronaldperez',
              email: 'admin@example.com',
              password:
                '$2a$10$oUHu.0WvRWyrbtNv8auTR.3sI83y/RuLs2p6ZWt0DqLx1eJI7FvJa',
              role: 'admin',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ],
        },
        {
          name: 'orders',
          data: generateOrders(2),
        },
        {
          name: 'products',
          data: generateProducts(8),
        },
        {
          name: 'addons',
          data: [
            {
              id: generateUUID(),
              category: 'Seguridad',
              productID: generateUUID(),
              productName: 'Artic Bunker 01',
              text: 'Autenticador Biométrico',
              help: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quo, quae.',
              percent: 20,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ],
        },
      ],
    },
  ],
};

export default data;
