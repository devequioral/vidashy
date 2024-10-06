import React, { useContext, useEffect, useState } from 'react';
import ModalComponent from '@/components/dashboard/ModalComponent';
import { Input, Autocomplete, AutocompleteItem } from '@nextui-org/react';
import { AppContext } from '@/contexts/AppContext';
import { useRouter } from 'next/router';

async function saveCollection(name, organization_id) {
  const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/collections/new`;
  const record_request = {
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
  const [allowSave, setAllowSave] = useState(false);
  const [saving, setSaving] = useState(false);
  const [organization, setOrganization] = useState(0);
  const [nameCollection, setNameCollection] = useState('');
  const onSave = async () => {
    const resp = await saveCollection(nameCollection, organization);
    if (resp.ok) {
      const resp_json = await resp.json();
      if (resp_json.new_collection_id) {
        router.push(`/dashboard/collections/${resp_json.new_collection_id}`);
      }
    }
  };
  const onSelectOrganization = (id) => {
    setOrganization(id);
  };
  useEffect(() => {
    if (state.createCollectionAttempt === 0) return;
    setOrganization(state.organizationSelected || 0);
    setShowModal((c) => c + 1);
  }, [state.createCollectionAttempt]);

  return (
    <>
      <ModalComponent
        show={showModal}
        onSave={onSave}
        title={'Create New Collection'}
        onCloseModal={() => {
          setAllowSave(false);
          setSaving(false);
          setNameCollection('');
          dispatch({
            type: 'SET_ORGANIZATION_SELECTED',
            organizationSelected: 0,
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
          placehodlder="Enter the name of new Collection"
          onChange={(e) => {
            setNameCollection(e.target.value);
            setAllowSave(true);
          }}
        />
      </ModalComponent>
    </>
  );
}
