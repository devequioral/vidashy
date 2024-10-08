import React, { useContext, useEffect, useState } from 'react';
import ModalComponent from '@/components/dashboard/ModalComponent';
import { Input, Autocomplete, AutocompleteItem } from '@nextui-org/react';
import { AppContext } from '@/contexts/AppContext';
import { useRouter } from 'next/router';

async function saveCollection(id, name, organization_id) {
  const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/collections/${
    id ? 'update' : 'new'
  }`;
  const record_request = {
    id,
    name,
    organization_id,
  };
  return await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ record_request }),
  });
}

export default function AddCollection() {
  const router = useRouter();
  const { state, dispatch } = useContext(AppContext);
  const [showModal, setShowModal] = useState(0);
  const [title, setTitle] = useState('Create New Collection');
  const [allowSave, setAllowSave] = useState(false);
  const [saving, setSaving] = useState(false);
  const [organization, setOrganization] = useState(0);
  const [nameCollection, setNameCollection] = useState('');
  const onSave = async () => {
    setSaving(true);
    const resp = await saveCollection(
      state.collectionSelected.id,
      nameCollection,
      organization
    );
    if (resp.ok) {
      const resp_json = await resp.json();
      if (resp_json.new_collection_id) {
        router.push(`/dashboard/collections/${resp_json.new_collection_id}`);
      } else {
        document.location.reload();
      }
    }
    setSaving(false);
  };
  const onSelectOrganization = (id) => {
    setOrganization(id);
  };
  useEffect(() => {
    if (state.createCollectionAttempt === 0) return;
    setOrganization(state.organizationSelected || 0);
    setShowModal((c) => c + 1);
  }, [state.createCollectionAttempt]);

  useEffect(() => {
    if (state.collectionSelected.id === 0) {
      setTitle('Create New Collection');
    } else {
      setNameCollection(state.collectionSelected.name);
      setTitle('Rename Collection');
    }
  }, [state.collectionSelected.id]);

  return (
    <>
      <ModalComponent
        show={showModal}
        onSave={onSave}
        title={title}
        onCloseModal={() => {
          setAllowSave(false);
          setSaving(false);
          setNameCollection('');
          dispatch({
            type: 'SET_ORGANIZATION_SELECTED',
            organizationSelected: 0,
          });
          dispatch({
            type: 'SET_COLLECTION_SELECTED',
            collectionSelected: { id: 0, name: '' },
          });
        }}
        allowSave={allowSave}
        savingRecord={saving}
      >
        {!state.organizationSelected && (
          <Autocomplete
            label="Organization"
            placeholder="Select a Organization"
            defaultItems={state.organizations}
            onSelectionChange={onSelectOrganization}
          >
            {(item) => (
              <AutocompleteItem key={item.id}>{item.name}</AutocompleteItem>
            )}
          </Autocomplete>
        )}
        <Input
          type="text"
          label="Name"
          placehodlder="Enter the name of Collection"
          defaultValue={nameCollection}
          onChange={(e) => {
            setNameCollection(e.target.value);
            setAllowSave(true);
          }}
        />
      </ModalComponent>
    </>
  );
}
