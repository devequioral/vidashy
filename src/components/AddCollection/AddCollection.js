import React, { useContext, useEffect, useState } from 'react';
import ModalComponent from '@/components/dashboard/ModalComponent';
import { Input } from '@nextui-org/react';
import { AppContext } from '@/contexts/AppContext';

export default function AddCollection() {
  const { state, dispatch } = useContext(AppContext);
  const [showModal, setShowModal] = useState(0);
  const [allowSave, setAllowSave] = useState(false);
  const [saving, setSaving] = useState(false);
  const onSave = () => {};
  useEffect(() => {
    console.log('state.createCollectionAttempt', state.createCollectionAttempt);
    if (state.createCollectionAttempt === 0) return;
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
        }}
        allowSave={allowSave}
        savingRecord={saving}
      >
        <Input
          type="text"
          label="Name"
          placehodlder="Enter the name of new Table"
          onChange={(e) => {
            //setNameNewTable(e.target.value);
            setAllowSave(true);
          }}
        />
      </ModalComponent>
    </>
  );
}
