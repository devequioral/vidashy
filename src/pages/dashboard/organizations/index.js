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
  Input,
  Select,
  SelectItem,
  Skeleton,
} from '@nextui-org/react';
import { useRouter } from 'next/router';
import ModalComponent from '@/components/dashboard/ModalComponent';

async function saveNewOrganization(name) {
  const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/organizations/new`;
  return await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ record_request: { name } }),
  });
}

function ModalNewOrganization(props) {
  const { show } = props;
  const [showModal, setShowModal] = useState(0);
  const [allowSaveOrganization, setAllowSaveOrganization] = useState(false);
  const [savingOrganization, setSavingOrganization] = useState(false);
  const [nameNewOrganization, setNameNewOrganization] = useState('');
  const [validation, setValidation] = useState();
  const onSave = async () => {
    const resp = await saveNewOrganization(nameNewOrganization);
    setSavingOrganization(true);
    setValidation(null);
    if (resp.ok) {
      location.reload();
    } else {
      const resp_json = await resp.json();
      console.log(resp_json);
      if (resp_json.validation) {
        setValidation(resp_json.validation);
      }
    }
    setSavingOrganization(false);
  };
  useEffect(() => {
    if (show > 0) setShowModal((c) => c + 1);
  }, [show]);
  return (
    <ModalComponent
      show={showModal}
      onSave={onSave}
      title={'Create New Organization'}
      onCloseModal={() => {
        setSavingOrganization(false);
        setValidation(null);
        setNameNewOrganization('');
        setAllowSaveOrganization(false);
      }}
      allowSave={allowSaveOrganization}
      savingRecord={savingOrganization}
    >
      <Input
        type="text"
        label="Name"
        placehodlder="Enter the name of new Organization"
        color={validation && validation.name ? 'danger' : 'default'}
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
  const [showModalNewOrganization, setShowModalNewOrganization] = useState(0);
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
                  onClick={() => setShowModalNewOrganization((c) => c + 1)}
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
                      <Button variant="link" size="sm">
                        ...
                      </Button>
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
                onClick={() => setShowModalNewOrganization((c) => c + 1)}
              >
                Create a New Organization
              </Button>
            </div>
          )}
        </div>
        <ModalNewOrganization show={showModalNewOrganization} />
      </Layout>
    </>
  );
}

ListOrganizations.auth = { adminOnly: true };
export default ListOrganizations;
