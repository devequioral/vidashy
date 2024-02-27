const apiAccessModel = {
  uid: '',
  name: '',
  description: '',
  organization_id: '',
  apiaccess: [
    {
      apikey: '',
      permissions: [
        {
          client_collection: '',
          object: {
            name: '',
            methods: [],
          },
        },
      ],
    },
  ],
  createdAt: '',
  updatedAt: '',
  status: '',
};

export default apiAccessModel;
