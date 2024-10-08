import Layout from '@/components/Layout';
import Metaheader from '@/components/Metaheader';
import ModalDeleteOrganization from '@/components/Organization/ModalDeleteOrganization';
import ModalSaveOrganization from '@/components/Organization/ModalSaveOrganization';
import MoreActionsOrganization from '@/components/Organization/MoreActionsOrganization';
import { AppContext } from '@/contexts/AppContext';
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
  Select,
  SelectItem,
  Skeleton,
  Snippet,
} from '@nextui-org/react';
import { DeleteIcon, MenuHorizontalIcon } from '@virtel/icons';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useContext, useEffect, useState } from 'react';

function Header({ organization, onClose, showModal }) {
  const [showModalSaveOrganization, setShowModalSaveOrganization] = useState(0);
  const [titleModalSaveOrganization, setTitleModalSaveOrganization] =
    useState('');
  useEffect(() => {
    if (organization) {
      setTitleModalSaveOrganization('Rename Organization');
    } else {
      setTitleModalSaveOrganization('Create a new Organization');
    }
  }, [organization]);

  useEffect(() => {
    if (showModal > 0) setShowModalSaveOrganization((c) => c + 1);
  }, [showModal]);
  return (
    <>
      <div className={styles.Header}>
        <h1 className={'Title'}>Todos los espacios de trabajo</h1>
        <div className={styles.Actions}>
          <Button
            color="primary"
            size="sm"
            onClick={() => {
              setShowModalSaveOrganization((c) => c + 1);
            }}
          >
            Create an Organization
          </Button>
        </div>
      </div>
      <ModalSaveOrganization
        show={showModalSaveOrganization}
        organization={organization}
        title={titleModalSaveOrganization}
        onClose={onClose}
      />
    </>
  );
}

function Filter({ organizations, onChange }) {
  const [filterSelected, setFilterSelected] = useState('createdAt');
  const [filterOrdered, setFilterOrdered] = useState('descending');
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
    onChange(_organizations);
  }, [filterSelected, filterOrdered]);
  const onFilterSelect = (selected) => {
    setFilterSelected(selected);
  };
  const onFilterOrder = (selected) => {
    setFilterOrdered(selected);
  };
  const filter = [
    { key: 'createdAt', label: 'Creation Date' },
    { key: 'updatedAt', label: 'Last Update' },
    { key: 'name', label: 'Alphabetical' },
  ];
  const filterOrder = [
    { key: 'descending', label: 'Descending' },
    { key: 'ascending', label: 'Ascending' },
  ];
  return (
    <div className={styles.Filter}>
      <div className={styles.FilterSelect}>
        <Select
          label="Filter By"
          size="sm"
          defaultSelectedKeys={[filterSelected]}
        >
          {filter.map((f) => (
            <SelectItem key={f.key} onClick={() => onFilterSelect(f.key)}>
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
            <SelectItem key={f.key} onClick={() => onFilterOrder(f.key)}>
              {f.label}
            </SelectItem>
          ))}
        </Select>
      </div>
    </div>
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
  const { state, dispatch } = useContext(AppContext);
  const [organizations, setOrganizations] = useState([]);
  const [emptyOrganizations, setEmptyOrganizations] = useState(false);
  const [showModalSaveOrganization, setShowModalSaveOrganization] = useState(0);
  const [showModalDeleteOrganization, setShowModalDeleteOrganization] =
    useState(0);
  const [organizationToEdit, setOrganizationToEdit] = useState();
  const [organizationToDelete, setOrganizationToDelete] = useState();
  const router = useRouter();

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

  const onChangeFilter = (_organizations) => {
    setOrganizations(_organizations);
  };

  const onSelectRenameOrganization = (organization) => {
    setOrganizationToEdit(organization);
    //setTitleModalSaveOrganization('Rename Organization');
    setShowModalSaveOrganization((c) => c + 1);
  };

  const onSelectDeleteOrganization = (organization) => {
    setOrganizationToDelete(organization);
    setShowModalDeleteOrganization((c) => c + 1);
  };
  return (
    <>
      <Metaheader title="Organizations List | Vidashy" />
      <Layout theme={state.theme}>
        <div className={styles.ListOrganizations}>
          {!emptyOrganizations && (
            <Header
              organization={organizationToEdit}
              onClose={() => setOrganizationToEdit(null)}
              showModal={showModalSaveOrganization}
            />
          )}
          {organizations.length > 0 && (
            <Filter organizations={organizations} onChange={onChangeFilter} />
          )}
          {organizations.length > 0 && (
            <div className={styles.Cards}>
              {organizations.map((organization) => (
                <Card className={styles.Card} key={organization.id}>
                  <CardHeader className={styles.CardHeader}>
                    <div className={styles.CardTitle}>
                      <span>{organization.name}</span>
                      <Snippet size="sm" symbol="">
                        {organization.id}
                      </Snippet>
                    </div>
                    <div className={styles.CardActions}>
                      <Button
                        variant="flat"
                        color="primary"
                        size="sm"
                        onClick={() => {
                          dispatch({
                            type: 'CREATE_COLLECTION_ATTEMPT',
                            createCollectionAttempt:
                              state.createCollectionAttempt + 1,
                          });
                          dispatch({
                            type: 'SET_ORGANIZATION_SELECTED',
                            organizationSelected: organization.id,
                          });
                        }}
                      >
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
                          <div className={styles.SubCardHeader}>
                            <Dropdown>
                              <DropdownTrigger>
                                <Button variant="flat" isIconOnly size="sm">
                                  <MenuHorizontalIcon
                                    fill={'black'}
                                    size="12"
                                  />
                                </Button>
                              </DropdownTrigger>
                              <DropdownMenu aria-label="Collection Actions">
                                <DropdownItem key={'id'} color={'default'}>
                                  <Snippet
                                    symbol=""
                                    size="sm"
                                    codeString={collection.id}
                                  >
                                    {`${collection.id.substring(0, 12)}...`}
                                  </Snippet>
                                </DropdownItem>
                                <DropdownItem
                                  key={'delete'}
                                  color={'danger'}
                                  className="text-danger"
                                  startContent={
                                    <DeleteIcon fill={'#c00'} size={12} />
                                  }
                                  onClick={() => {}}
                                >
                                  <div className="text-12px">
                                    Delete Collection
                                  </div>
                                </DropdownItem>
                              </DropdownMenu>
                            </Dropdown>
                          </div>
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
                    <Link
                      className={styles.LinkViewOrganization}
                      href={`/dashboard/organizations/${organization.id}`}
                    >
                      View Organization -&gt;
                    </Link>
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
              <h3>Don&apos;t Have Organizations Yet</h3>
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
