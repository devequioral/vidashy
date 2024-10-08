import CollectionCard from '@/components/Collections/CollectionCard';
import Layout from '@/components/Layout';
import Metaheader from '@/components/Metaheader';
import ModalDeleteOrganization from '@/components/Organization/ModalDeleteOrganization';
import ModalSaveOrganization from '@/components/Organization/ModalSaveOrganization';
import MoreActionsOrganization from '@/components/Organization/MoreActionsOrganization';
import { AppContext } from '@/contexts/AppContext';
import styles from '@/styles/Organization.module.css';
import {
  Button,
  Select,
  SelectItem,
  Skeleton,
  Snippet,
} from '@nextui-org/react';
import { useRouter } from 'next/router';
import React, { useContext, useEffect, useState } from 'react';

function Header({ organization, isLoading }) {
  const { state, dispatch } = useContext(AppContext);
  const [showModalSaveOrganization, setShowModalSaveOrganization] = useState(0);
  const [showModalDeleteOrganization, setShowModalDeleteOrganization] =
    useState(0);
  const onSelectRenameOrganization = (organization) => {
    setShowModalSaveOrganization((c) => c + 1);
  };

  const onSelectDeleteOrganization = (organization) => {
    setShowModalDeleteOrganization((c) => c + 1);
  };
  return (
    <>
      <div className={styles.Header}>
        <div className={styles.Title}>
          {isLoading ? (
            <Skeleton className={styles.SkeletonTitle} />
          ) : (
            <>
              <h1 className={'Title'}>{organization.name}</h1>
              <Snippet size="sm" symbol="">
                {organization.id}
              </Snippet>
            </>
          )}
        </div>
        <div className={styles.Actions}>
          {isLoading ? (
            <Skeleton className={styles.SkeletonMenu} />
          ) : (
            <>
              <Button
                color="primary"
                size="sm"
                onClick={() => {
                  dispatch({
                    type: 'CREATE_COLLECTION_ATTEMPT',
                    createCollectionAttempt: state.createCollectionAttempt + 1,
                  });
                }}
              >
                Create
              </Button>
              <MoreActionsOrganization
                organization={organization}
                onSelectRenameOrganization={onSelectRenameOrganization}
                onSelectDeleteOrganization={onSelectDeleteOrganization}
              />
            </>
          )}
        </div>
      </div>
      <ModalSaveOrganization
        show={showModalSaveOrganization}
        organization={organization}
        title={'Rename Organization'}
        onClose={() => {}}
      />
      <ModalDeleteOrganization
        show={showModalDeleteOrganization}
        organization={organization}
        onClose={() => {}}
      />
    </>
  );
}

function Filter({ collections, onChange }) {
  const [filterSelected, setFilterSelected] = useState('createdAt');
  const [filterOrdered, setFilterOrdered] = useState('descending');
  useEffect(() => {
    if (collections.length === 0) return;
    const _collections = [...collections];
    if (filterSelected === 'name') {
      if (filterOrdered === 'descending')
        _collections.sort((a, b) =>
          a.name > b.name ? -1 : a.name < b.name ? 1 : 0
        );
      else
        _collections.sort((a, b) =>
          a.name < b.name ? -1 : a.name > b.name ? 1 : 0
        );
    } else {
      if (filterOrdered === 'descending')
        _collections.sort(
          (a, b) => new Date(b[filterSelected]) - new Date(a[filterSelected])
        );
      else
        _collections.sort(
          (a, b) => new Date(a[filterSelected]) - new Date(b[filterSelected])
        );
    }
    onChange(_collections);
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

async function getOrganization(id) {
  const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/organizations/get_extended?id=${id}`;
  return await fetch(url);
}

export default function OrganizationScreen() {
  const router = useRouter();
  const { state, dispatch } = useContext(AppContext);
  const [organization, setOrganization] = useState({ id: '', name: '' });
  const [isLoading, setIsLoading] = useState(true);

  const fetchOrganization = async (id) => {
    const resp = await getOrganization(id);
    if (resp.ok) {
      const resp_json = await resp.json();
      setOrganization({
        id: resp_json.organization.id,
        name: resp_json.organization.name,
        collections: resp_json.organization.collections,
      });
      dispatch({
        type: 'SET_ORGANIZATION_SELECTED',
        organizationSelected: resp_json.organization.id,
      });
      setIsLoading(false);
    } else router.push('/dashboard/organizations');
  };
  useEffect(() => {
    if (!router.query.id) return;
    if (!state.organizations || state.organizations.length === 0) return;
    fetchOrganization(router.query.id);
  }, [state.organizations, state.organizationSelected, router.query.id]);

  const onCreateCollection = () => {};

  const onChangeFilter = (_collections) => {
    const _organization = { ...organization };
    _organization.collections = _collections;
    setOrganization(_organization);
  };

  return (
    <>
      <Metaheader title={`Organization ${organization.name} | Vidashy`} />
      <Layout theme={state.theme}>
        <div className={styles.Organizations}>
          <Header
            organization={organization}
            onCreate={onCreateCollection}
            isLoading={isLoading}
          />
          {organization.collections && (
            <Filter
              collections={organization.collections}
              onChange={onChangeFilter}
            />
          )}
          <div className={styles.Collections}>
            {organization.collections &&
              organization.collections.map((collection, i) => (
                <CollectionCard
                  organization={organization}
                  collection={collection}
                  key={i}
                />
              ))}
            {!isLoading &&
              (!organization.collections ||
                organization.collections.length === 0) && (
                <div className={styles.NoCollections}>
                  <p>Not Collections Yet</p>
                  <Button
                    size="sm"
                    onClick={() => {
                      dispatch({
                        type: 'CREATE_COLLECTION_ATTEMPT',
                        createCollectionAttempt:
                          state.createCollectionAttempt + 1,
                      });
                    }}
                  >
                    Create Collection
                  </Button>
                </div>
              )}
          </div>
        </div>
      </Layout>
    </>
  );
}
