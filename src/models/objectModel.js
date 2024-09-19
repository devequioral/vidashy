import { generateUUID } from '@/utils/utils';

const objectModel = {
  id: generateUUID(),
  name: 'Table01',
  columns: [
    { label: 'UID', name: '_uid', type: 'hidden', id: generateUUID() },
    { label: 'Name', name: 'Name', type: 'text', id: generateUUID() },
  ],
};

export default objectModel;
