import {
  Button,
  Input,
  Select,
  SelectItem,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Listbox,
  ListboxItem,
  Divider,
  Spinner,
} from '@nextui-org/react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import styles from './CollectionObject.module.css';
import ContextualMenu from '../ContextualMenu/ContextualMenu';

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

import {} from '@nextui-org/react';

function AddNewFieldModal({ show, addNewColumn }) {
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const [fieldName, setFieldName] = useState('');
  useEffect(() => {
    if (show > 0) onOpen();
  }, [show]);
  const onChange = (e) => {
    setFieldName(e.target.value);
  };
  const onAddField = () => {
    addNewColumn(fieldName);
    onClose();
  };
  return (
    <>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} placement="top-center">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Add New Field
              </ModalHeader>
              <ModalBody>
                <Input
                  autoFocus
                  label="Field Name"
                  placeholder="Enter Field Name"
                  variant="bordered"
                  onChange={onChange}
                />
                {/* <Listbox aria-label="Actions" onAction={(key) => alert(key)}>
                  <ListboxItem key="text_field">Text Field</ListboxItem>
                  <ListboxItem key="email_field">Email Field</ListboxItem>
                  <ListboxItem key="url_field">Url Field</ListboxItem>
                  <ListboxItem key="number_field">Number Field</ListboxItem>
                  <ListboxItem key="select_field">Select Field</ListboxItem>
                </Listbox> */}
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="flat" onPress={onClose}>
                  Close
                </Button>
                <Button color="primary" onPress={onAddField}>
                  Add Field
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}

const dummyKeyboardDelegate = Object.fromEntries(
  [
    'getKeyBelow',
    'getKeyAbove',
    'getKeyLeftOf',
    'getKeyRightOf',
    'getKeyPageBelow',
    'getKeyPageAbove',
    'getFirstKey',
    'getLastKey',
    // HAVE TO ignore this one
    // "getKeyForSearch"
  ].map((name) => [name, () => null])
);

function MainTable({
  styles,
  columns,
  data,
  onChangeItemRecord,
  addEmptyRecord,
  addNewColumn,
}) {
  const renderCell = useCallback(
    (record, columnKey, columns, onChangeCellValue) => {
      const cellValue = record[columnKey] || '';
      const column = columns.find((_c) => _c.name === columnKey);
      const cellType = column && column.type ? column.type : '';

      switch (cellType) {
        case 'text':
          return (
            <div className={`${styles.MainTableCell} ${styles[cellType]}`}>
              <Input
                size="sm"
                type="text"
                defaultValue={cellValue}
                onChange={(e) => {
                  onChangeCellValue(record, columnKey, e.target.value);
                }}
              />
            </div>
          );
        case 'email':
          return (
            <div className={`${styles.MainTableCell} ${styles[cellType]}`}>
              <Input size="sm" type="email" defaultValue={cellValue} />
            </div>
          );
        case 'number':
          return (
            <div className={`${styles.MainTableCell} ${styles[cellType]}`}>
              <Input size="sm" type="number" defaultValue={cellValue} />
            </div>
          );
        case 'url':
          return (
            <div className={`${styles.MainTableCell} ${styles[cellType]}`}>
              <Input size="sm" type="text" defaultValue={cellValue} />
            </div>
          );
        case 'select':
          return (
            <div className={`${styles.MainTableCell} ${styles[cellType]}`}>
              <Select defaultSelectedKeys={[cellValue]} className="max-w-xs">
                {record[columnKey].options.map((option) => (
                  <SelectItem key={option.key}>{option.label}</SelectItem>
                ))}
              </Select>
            </div>
          );
        case 'addcolumn':
          return (
            <div className={`${styles.MainTableCell} ${styles[cellType]}`}>
              {cellValue}
            </div>
          );
        default:
          return <div className={styles.MainTableCell}>{cellValue}</div>;
      }
    },
    []
  );

  const [showAddNewFieldModal, setShowAddNewFieldModal] = useState(0);

  const onShowContextualMenu = (e) => {
    setShowAddNewFieldModal((c) => c + 1);
  };

  const onChangeCellValue = (record, columnKey, new_value) => {
    onChangeItemRecord(record._uid, columnKey, new_value);
  };

  return (
    <>
      <div className={styles.TableContainer}>
        {columns && data && (
          <Table
            className={styles.MainTable}
            removeWrapper
            keyboardDelegate={dummyKeyboardDelegate}
          >
            <TableHeader columns={columns}>
              {(column) =>
                column.uid === 'addcolumn' ? (
                  <TableColumn
                    key={column.name}
                    className={`${styles.MainTableColumn} ${styles.addColumn}`}
                    onClick={onShowContextualMenu}
                  >
                    {column.label}
                  </TableColumn>
                ) : (
                  <TableColumn
                    key={column.name}
                    className={`${styles.MainTableColumn} ${
                      styles[column.type]
                    }`}
                  >
                    {column.label}
                  </TableColumn>
                )
              }
            </TableHeader>
            <TableBody items={data}>
              {(record) => (
                <TableRow key={record._uid}>
                  {(columnKey) => (
                    <TableCell>
                      {renderCell(
                        record,
                        columnKey,
                        columns,
                        onChangeCellValue
                      )}
                    </TableCell>
                  )}
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
        <div className={styles.BtnAddRecord}>
          <Button size="sm" onClick={addEmptyRecord}>
            Add Record
          </Button>
        </div>
      </div>
      {columns && data && (
        <AddNewFieldModal
          show={showAddNewFieldModal}
          addNewColumn={addNewColumn}
        />
      )}
    </>
  );
}

async function getData(
  collectionName,
  organizationId,
  objectName,
  page = 1,
  pageSize = 20
) {
  const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/objects/get`;
  return fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      collectionName,
      organizationId,
      objectName,
      page,
      pageSize,
    }),
  });
}

async function upsertRecord(
  collectionName,
  organizationId,
  objectName,
  _uid,
  columnKey,
  new_value
) {
  const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/objects/upsert_record`;
  return fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      collectionName,
      organizationId,
      objectName,
      _uid,
      columnKey,
      new_value,
    }),
  });
}

async function addColumn(collectionId, organizationId, objectId, column) {
  const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/objects/add_column`;
  return fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      collectionId,
      organizationId,
      objectId,
      column,
    }),
  });
}

async function getApiAccess(organizationId) {
  const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/apiaccess/get_from_organization?organization_id=${organizationId}`;
  return await fetch(url);
}

async function createApiAccess(
  organization_id,
  objectName,
  collectionName,
  name,
  description,
  permissions
) {
  const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/apiaccess/create`;
  return fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      record_request: {
        organization_id,
        objectName,
        collectionName,
        name,
        description,
        permissions,
      },
    }),
  });
}

function ApiAccessModal({ show, organizationId, collectionName, objectName }) {
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const [loading, setLoading] = useState(true);
  const [apiFound, setApiFound] = useState(true);
  const [apiRecord, setApiRecord] = useState();
  const [showFormCreation, setShowFormCreation] = useState(false);
  const [nameApi, setNameApi] = useState('');
  const [descriptionApi, setDescriptionApi] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState(new Set([]));
  useEffect(() => {
    const fetchApiAccess = async () => {
      const resp = await getApiAccess(organizationId);
      if (resp.ok) {
        const resp_json = await resp.json();
        setApiRecord(resp_json.data.records[0]);
        setLoading(false);
        setApiFound(true);
      } else {
        setLoading(false);
        setApiFound(false);
      }
    };
    if (show > 0) {
      onOpen();
      fetchApiAccess();
    }
  }, [show]);

  const onChangeName = (e) => {
    setNameApi(e.target.value);
  };
  const onChangeDescription = (e) => {
    setDescriptionApi(e.target.value);
  };
  const createAPI = async () => {
    if (!nameApi) {
      alert('Name is Required');
      return;
    }
    if (!descriptionApi) {
      alert('Description is Required');
      return;
    }
    if (selectedPermissions.size === 0) {
      alert('Select at least one permission');
      return;
    }
    const resp = await createApiAccess(
      organizationId,
      objectName,
      collectionName,
      nameApi,
      descriptionApi,
      Array.from(selectedPermissions)
    );
    if (resp.ok) {
      const resp_json = await resp.json();
      setApiFound(true);
      setApiRecord(resp_json.data.records[0]);
    } else {
      alert('Failed');
    }
  };

  return (
    <>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} placement="top-center">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Api Access
              </ModalHeader>
              <ModalBody>
                {loading && (
                  <>
                    <p>Loading...</p>
                    <Spinner size="md" />
                  </>
                )}
                {!loading && !apiFound && !showFormCreation && (
                  <>
                    <Button
                      color={'primary'}
                      onPress={() => setShowFormCreation(true)}
                    >
                      Create an api key for <b>{objectName}</b>
                    </Button>
                  </>
                )}
                {!loading && apiFound && apiRecord && (
                  <>
                    {apiRecord.apiaccess.map((api, i) => (
                      <div key={i}>
                        <p>{api.apikey}</p>
                        {api.permissions.map((permission, ii) => (
                          <div key={ii}>
                            <p>{permission.collectionName}</p>
                            <p>{permission.object.name}</p>
                            {permission.object.methods.map((method, iv) => (
                              <div key={iv}>
                                <p>{method}</p>
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    ))}
                  </>
                )}
                {!loading && !apiFound && showFormCreation && (
                  <>
                    <div className={styles.ApiFormCreate}>
                      <Input
                        type="text"
                        name="Name"
                        label="Name"
                        isRequired
                        onChange={onChangeName}
                      />
                      <Input
                        type="text"
                        name="Description"
                        label="Description"
                        isRequired
                        onChange={onChangeDescription}
                      />
                      <div className={styles.ApiFormCreatePermissions}>
                        <h3>Permissions</h3>
                        <Listbox
                          aria-label="Permissions"
                          variant="flat"
                          disallowEmptySelection
                          selectionMode="multiple"
                          selectedKeys={selectedPermissions}
                          onSelectionChange={setSelectedPermissions}
                        >
                          <ListboxItem key="GET">GET</ListboxItem>
                          <ListboxItem key="POST">POST</ListboxItem>
                          <ListboxItem key="PUT">PUT</ListboxItem>
                          <ListboxItem key="PATCH">PATCH</ListboxItem>
                          <ListboxItem key="DELETE">DELETE</ListboxItem>
                        </Listbox>
                      </div>
                    </div>
                  </>
                )}
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="flat" onPress={onClose}>
                  Close
                </Button>
                {!loading && showFormCreation && (
                  <Button color="primary" onPress={createAPI}>
                    createAPI
                  </Button>
                )}
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}

export default function CollectionObject({
  collectionId,
  collectionName,
  organizationId,
  object,
}) {
  const [showSideBarViews, setShowSideBarViews] = useState(true);
  const [showApiAccessModal, setShowApiAccessModal] = useState(0);
  const [columns, setColumns] = useState();

  const [data, setData] = useState([]);

  useEffect(() => {
    if (!object) return;
    const _columns = [];
    object.columns.map((column, i) => {
      if (column.type === 'hidden') return;
      _columns.push({
        label: column.label,
        name: column.name,
        uid: column.id,
        type: column.type,
      });
    });
    _columns.push({
      label: '+',
      name: 'addcolumn',
      uid: 'addcolumn',
      type: 'addcolumn',
    });
    setColumns(_columns);
  }, [object]);

  useEffect(() => {
    if (!collectionName) return;
    if (!organizationId) return;
    if (!object) return;
    const fetchObject = async (collectionName, organizationId, objectName) => {
      const resp = await getData(collectionName, organizationId, objectName);
      if (resp.ok) {
        const resp_json = await resp.json();
        if (resp_json && resp_json.data) setData(resp_json.data.records);
      }
    };
    fetchObject(collectionName, organizationId, object.name);
  }, [collectionName, organizationId, object]);

  function debounce(func, wait) {
    let timeout;
    return function () {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        func.apply(this, arguments);
      }, wait);
    };
  }

  const upsertRecordDebounced = debounce(async (_uid, columnKey, new_value) => {
    const resp = await upsertRecord(
      collectionName,
      organizationId,
      object.name,
      _uid,
      columnKey,
      new_value
    );
    if (resp.ok) {
      const _data = [...data];
      _data.map((_d) => {
        if (_d._uid === _uid) {
          _d[columnKey] = new_value;
        }
      });
      setData(_data);
    }
  }, 500);

  const onChangeItemRecord = (_uid, columnKey, new_value) => {
    upsertRecordDebounced(_uid, columnKey, new_value);
  };

  const addEmptyRecord = () => {
    const _data = [...data];
    const new_record = {};
    columns.map((column) => {
      if (column.type === 'hidden' || column.type === 'addcolumn') return;
      if (
        column.type === 'text' ||
        column.type === 'email' ||
        column.type === 'url'
      )
        new_record[column.name] = '';
      if (column.type === 'number') new_record[column.name] = 0;
      if (column.defaultValue) new_record[column.name] = column.defaultValue;
    });
    new_record._uid = generateUUID();
    _data.push(new_record);
    setData(_data);
  };

  const addNewColumn = async (name) => {
    const column = {
      label: name,
      name,
      id: generateUUID(),
      type: 'text',
    };
    const resp = await addColumn(
      collectionId,
      organizationId,
      object.id,
      column
    );
    if (resp.ok) {
      const _columns = [...columns];
      _columns.splice(_columns.length - 1, 0, column);
      setColumns(_columns);
    }
  };

  return (
    <>
      <div className={styles.ViewBar}>
        <Button
          size={'sm'}
          onClick={() => setShowSideBarViews(!showSideBarViews)}
        >
          Views
        </Button>
        <Divider orientation="vertical" />
        <Button size={'sm'} onClick={() => setShowApiAccessModal((c) => c + 1)}>
          Api Access
        </Button>
      </div>
      <div className={styles.TabBody}>
        {showSideBarViews && <div className={styles.SideBarViews}></div>}
        <div className={styles.ViewGrid}>
          <MainTable
            styles={styles}
            columns={columns}
            data={data}
            onChangeItemRecord={onChangeItemRecord}
            addEmptyRecord={addEmptyRecord}
            addNewColumn={addNewColumn}
          />
        </div>
      </div>
      <ApiAccessModal
        show={showApiAccessModal}
        organizationId={organizationId}
        collectionName={collectionName}
        objectName={object.name}
      />
    </>
  );
}
