const automationsModel = {
  uid: '',
  organization_id: '',
  collection: '',
  object: '',
  trigger: '',
  automations: [
    {
      order: '',
      action: '',
      actionData: {
        title: '',
        message: '',
        object: '',
        objectid: '',
        userid: '',
        role: '',
        status: '',
        mailData: {
          from: '',
          to: '',
          subject: '',
          text: '',
          html: '',
        },
      },
    },
  ],
  createdAt: '',
  updatedAt: '',
  status: '',
};

export default automationsModel;
