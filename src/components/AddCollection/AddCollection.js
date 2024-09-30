import React, { useState } from 'react';
import ModalComponent from '@/components/dashboard/ModalComponent';
import { Input } from '@nextui-org/react';

export default function AddCollection() {
  const [showModal, setShowModal] = useState(0);
  const [allowSave, setAllowSave] = useState(false);
  const [saving, setSaving] = useState(false);
  const onSave = () => {};
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
