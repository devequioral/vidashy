import Layout from '@/components/Layout';
import Metaheader from '@/components/Metaheader';
import { ThemeContext } from '@/contexts/ThemeContext';
import React, { useContext, useEffect, useState } from 'react';
import styles from '@/styles/ListOrganizations.module.css';
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Input,
  Select,
  SelectItem,
  Skeleton,
} from '@nextui-org/react';
import { useRouter } from 'next/router';
import ModalComponent from '@/components/dashboard/ModalComponent';
import { DeleteIcon, EditIcon, MenuHorizontalIcon } from '@virtel/icons';

async function deleteOrganization(id) {
  const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/organizations/delete?id=${id}`;
  return await fetch(url);
}

function ModalDeleteOrganization(props) {
  const { show, organization, onClose } = props;
  const [showModal, setShowModal] = useState(0);
  const [allowDelete, setAllowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [idOrganization, setIdOrganization] = useState('');
  const [strConfirmation, setStrConfirmation] = useState('');
  const [validation, setValidation] = useState();
  const onDelete = async () => {
    if (strConfirmation !== `Delete ${organization.name}`) {
      setValidation({ confirmation: 'Invalid confirmation' });
      return;
    }
    const resp = await deleteOrganization(idOrganization);
    setDeleting(true);
    setValidation(null);
    if (resp.ok) {
      location.reload();
    } else {
      const resp_json = await resp.json();
      if (resp_json.validation) {
        setValidation(resp_json.validation);
      }
    }
    setDeleting(false);
  };
  useEffect(() => {
    if (show > 0) setShowModal((c) => c + 1);
  }, [show]);
  useEffect(() => {
    if (!organization) return;
    if (organization.id) setIdOrganization(organization.id);
  }, [organization, show]);
  return (
    <ModalComponent
      show={showModal}
      onSave={onDelete}
      title={'Delete Organization'}
      onCloseModal={() => {
        setDeleting(false);
        setValidation(null);
        setStrConfirmation('');
        setIdOrganization('');
        setAllowDelete(false);
        onClose();
      }}
      allowSave={allowDelete}
      savingRecord={deleting}
    >
      <p className="text-small">
        Please enter the words:{' '}
        <b>{`Delete ${
          organization && organization.name ? organization.name : ''
        }`}</b>
      </p>
      <Input
        type="text"
        label={`Confirmation`}
        color={validation && validation.confirmation ? 'danger' : 'default'}
        autoFocus={true}
        onChange={(e) => {
          setStrConfirmation(e.target.value);
          setAllowDelete(true);
        }}
      />
      {validation && (
        <p className="text-danger text-small">{validation.confirmation}</p>
      )}
    </ModalComponent>
  );
}

function MoreActionsOrganization(props) {
  const {
    organization,
    onSelectRenameOrganization,
    onSelectDeleteOrganization,
  } = props;
  const items = [
    {
      key: 'rename',
      label: 'Rename Organization',
    },
    {
      key: 'delete',
      label: 'Delete Organization',
    },
  ];
  return (
    <>
      <Dropdown>
        <DropdownTrigger>
          <Button variant="flat" isIconOnly size="sm">
            <MenuHorizontalIcon fill={'black'} size="12" />
          </Button>
        </DropdownTrigger>
        <DropdownMenu aria-label="Dynamic Actions" items={items}>
          <DropdownItem
            key={'rename'}
            color={'default'}
            startContent={<EditIcon fill={'#000'} size={12} />}
            onClick={() => onSelectRenameOrganization(organization)}
          >
            <div className="MoreActionsOrganizationItem">
              Rename Organization
            </div>
          </DropdownItem>
          <DropdownItem
            key={'delete'}
            color={'danger'}
            className="text-danger"
            startContent={<DeleteIcon fill={'#c00'} size={12} />}
            onClick={() => onSelectDeleteOrganization(organization)}
          >
            <div className="MoreActionsOrganizationItem">
              Delete Organization
            </div>
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>
      <style jsx>
        {`
          .MoreActionsOrganizationItem {
            font-size: 12px;
          }
        `}
      </style>
    </>
  );
}

async function saveOrganization(id, name) {
  let url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/organizations/`;
  url += id ? 'update' : 'new';
  const record_request = { id, name };
  return await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ record_request }),
  });
}

function ModalSaveOrganization(props) {
  const { show, organization, title, onClose } = props;
  const [showModal, setShowModal] = useState(0);
  const [allowSaveOrganization, setAllowSaveOrganization] = useState(false);
  const [savingOrganization, setSavingOrganization] = useState(false);
  const [idOrganization, setIdOrganization] = useState('');
  const [nameNewOrganization, setNameNewOrganization] = useState('');
  const [validation, setValidation] = useState();
  const onSave = async () => {
    const resp = await saveOrganization(idOrganization, nameNewOrganization);
    setSavingOrganization(true);
    setValidation(null);
    if (resp.ok) {
      location.reload();
    } else {
      const resp_json = await resp.json();
      if (resp_json.validation) {
        setValidation(resp_json.validation);
      }
    }
    setSavingOrganization(false);
  };
  useEffect(() => {
    if (show > 0) setShowModal((c) => c + 1);
  }, [show]);
  useEffect(() => {
    if (!organization) return;
    if (organization.id) setIdOrganization(organization.id);
    if (organization.name) {
      setNameNewOrganization(organization.name);
      setAllowSaveOrganization(true);
    }
  }, [organization, show]);
  return (
    <ModalComponent
      show={showModal}
      onSave={onSave}
      title={title}
      onCloseModal={() => {
        setSavingOrganization(false);
        setValidation(null);
        setNameNewOrganization('');
        setIdOrganization('');
        setAllowSaveOrganization(false);
        onClose();
      }}
      allowSave={allowSaveOrganization}
      savingRecord={savingOrganization}
    >
      <Input
        type="text"
        label="Name"
        placehodlder="Enter the name of new Organization"
        color={validation && validation.name ? 'danger' : 'default'}
        defaultValue={nameNewOrganization}
        onChange={(e) => {
          setNameNewOrganization(e.target.value);
          setAllowSaveOrganization(true);
        }}
      />
      {validation && (
        <p className="text-danger text-small">{validation.name}</p>
      )}
    </ModalComponent>
  );
}

async function listRecords(
  page = 1,
  pageSize = 20,
  status = 'all',
  search = ''
) {
  const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/organizations/list_extended?page=${page}&pageSize=${pageSize}&status=${status}&search=${search}`;
  return await fetch(url);
}

function ListOrganizations() {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [organizations, setOrganizations] = useState([]);
  const [emptyOrganizations, setEmptyOrganizations] = useState(false);
  const [filterSelected, setFilterSelected] = useState('createdAt');
  const [filterOrdered, setFilterOrdered] = useState('descending');
  const [titleModalSaveOrganization, setTitleModalSaveOrganization] =
    useState('');
  const [showModalSaveOrganization, setShowModalSaveOrganization] = useState(0);
  const [showModalDeleteOrganization, setShowModalDeleteOrganization] =
    useState(0);
  const [organizationToEdit, setOrganizationToEdit] = useState();
  const [organizationToDelete, setOrganizationToDelete] = useState();
  const router = useRouter();
  const filter = [
    { key: 'createdAt', label: 'Creation Date' },
    { key: 'updatedAt', label: 'Last Update' },
    { key: 'name', label: 'Alphabetical' },
  ];
  const filterOrder = [
    { key: 'descending', label: 'Descending' },
    { key: 'ascending', label: 'Ascending' },
  ];
  const fetchOrganizations = async () => {
    const resp = await listRecords();
    if (resp.ok) {
      const resp_json = await resp.json();
      setOrganizations(resp_json.organizations.records);
    } else {
      setEmptyOrganizations(true);
    }
  };
  const getInitials = (name) => {
    if (!name || name.length < 2) {
      return 'Un';
    }
    return name.substring(0, 2);
  };

  const onSelectCollection = (collection) => {
    router.push(`/dashboard/collections/${collection.id}`);
  };
  useEffect(() => {
    fetchOrganizations();
  }, []);

  const onFilterSelect = (selected) => {
    setFilterSelected(selected);
  };
  const onFilterOrder = (selected) => {
    setFilterOrdered(selected);
  };

  useEffect(() => {
    if (organizations.length === 0) return;
    const _organizations = [...organizations];
    if (filterSelected === 'name') {
      if (filterOrdered === 'descending')
        _organizations.sort((a, b) =>
          a.name > b.name ? -1 : a.name < b.name ? 1 : 0
        );
      else
        _organizations.sort((a, b) =>
          a.name < b.name ? -1 : a.name > b.name ? 1 : 0
        );
    } else {
      if (filterOrdered === 'descending')
        _organizations.sort(
          (a, b) => new Date(b[filterSelected]) - new Date(a[filterSelected])
        );
      else
        _organizations.sort(
          (a, b) => new Date(a[filterSelected]) - new Date(b[filterSelected])
        );
    }
    setOrganizations(_organizations);
  }, [filterSelected, filterOrdered]);

  const onSelectRenameOrganization = (organization) => {
    setOrganizationToEdit(organization);
    setTitleModalSaveOrganization('Rename Organization');
    setShowModalSaveOrganization((c) => c + 1);
  };

  const onSelectDeleteOrganization = (organization) => {
    setOrganizationToDelete(organization);
    setShowModalDeleteOrganization((c) => c + 1);
  };
  return (
    <>
      <Metaheader title="Organizations List | Vidashy" />
      <Layout theme={theme} toogleTheme={toggleTheme}>
        <div className={styles.ListOrganizations}>
          {!emptyOrganizations && (
            <div className={styles.Header}>
              <h1 className={'Title'}>Todos los espacios de trabajo</h1>
              <div className={styles.Actions}>
                <Button
                  color="primary"
                  size="sm"
                  onClick={() => {
                    setShowModalSaveOrganization((c) => c + 1);
                    setTitleModalSaveOrganization('Create a new Organization');
                  }}
                >
                  Create an Organization
                </Button>
              </div>
            </div>
          )}
          {organizations.length > 0 && (
            <div className={styles.Filter}>
              <div className={styles.FilterSelect}>
                <Select
                  label="Filter By"
                  size="sm"
                  defaultSelectedKeys={[filterSelected]}
                >
                  {filter.map((f) => (
                    <SelectItem
                      key={f.key}
                      onClick={() => onFilterSelect(f.key)}
                    >
                      {f.label}
                    </SelectItem>
                  ))}
                </Select>
              </div>
              <div className={styles.FilterOrder}>
                <Select
                  label="Order By"
                  size="sm"
                  defaultSelectedKeys={[filterOrdered]}
                >
                  {filterOrder.map((f) => (
                    <SelectItem
                      key={f.key}
                      onClick={() => onFilterOrder(f.key)}
                    >
                      {f.label}
                    </SelectItem>
                  ))}
                </Select>
              </div>
            </div>
          )}
          {organizations.length > 0 && (
            <div className={styles.Cards}>
              {organizations.map((organization) => (
                <Card className={styles.Card} key={organization.id}>
                  <CardHeader className={styles.CardHeader}>
                    <div className={styles.CardTitle}>{organization.name}</div>
                    <div className={styles.CardActions}>
                      <Button variant="flat" color="primary" size="sm">
                        create
                      </Button>
                      <MoreActionsOrganization
                        organization={organization}
                        onSelectRenameOrganization={onSelectRenameOrganization}
                        onSelectDeleteOrganization={onSelectDeleteOrganization}
                      />
                    </div>
                  </CardHeader>
                  <CardBody className={styles.CardBody}>
                    {organization.collections &&
                      organization.collections.map((collection) => (
                        <Card className={styles.SubCard} key={collection.id}>
                          <CardBody
                            className={styles.SubCardBody}
                            onClick={() => onSelectCollection(collection)}
                          >
                            <div className={styles.SubCardLeft}>
                              <div className={styles.CardIcon}>
                                {getInitials(collection.name)}
                              </div>
                            </div>
                            <div className={styles.SubCardRight}>
                              <div className={styles.SubCardName}>
                                {collection.name}
                              </div>
                              <div className={styles.SubCardType}>Base</div>
                            </div>
                          </CardBody>
                        </Card>
                      ))}
                    {(!organization.collections ||
                      organization.collections.length === 0) && (
                      <div className={styles.NoCollections}>
                        <p>Not Collections Yet</p>
                      </div>
                    )}
                  </CardBody>
                  <CardFooter>
                    <Button
                      variant="link"
                      className={styles.BtnViewOrganization}
                    >
                      View Organization -&gt;
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
          {!emptyOrganizations && organizations.length === 0 && (
            <Skeleton className={styles.Skeleton} />
          )}
          {emptyOrganizations && organizations.length === 0 && (
            <div className={styles.EmptySpace}>
              <h3>Don't Have Organizations Yet</h3>
              <p>Organizations will appear here after creating theme</p>
              <Button
                color="primary"
                onClick={() => setShowModalSaveOrganization((c) => c + 1)}
              >
                Create a New Organization
              </Button>
            </div>
          )}
        </div>
        <ModalSaveOrganization
          show={showModalSaveOrganization}
          organization={organizationToEdit}
          title={titleModalSaveOrganization}
          onClose={() => {
            setOrganizationToEdit(null);
          }}
        />
        <ModalDeleteOrganization
          show={showModalDeleteOrganization}
          organization={organizationToDelete}
          onClose={() => {
            setOrganizationToDelete(null);
          }}
        />
      </Layout>
    </>
  );
}

ListOrganizations.auth = { adminOnly: true };
export default ListOrganizations;
