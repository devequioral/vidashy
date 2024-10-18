import { useEffect, useState } from 'react';
import ModalComponent from '@/components/dashboard/ModalComponent';
import { Input } from '@nextui-org/react';

async function deleteCollection(id, organization_id) {
  const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/collections/delete?id=${id}&organization_id=${organization_id}`;
  return await fetch(url);
}

export default function ModalDeleteCollection(props) {
  const { show, collection, organization, onClose } = props;
  const [showModal, setShowModal] = useState(0);
  const [allowDelete, setAllowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [idOrganization, setIdOrganization] = useState('');
  const [idCollection, setIdCollection] = useState('');
  const [strConfirmation, setStrConfirmation] = useState('');
  const [validation, setValidation] = useState();
  const onDelete = async () => {
    if (strConfirmation !== `Delete ${collection.name}`) {
      setValidation({ confirmation: 'Invalid confirmation' });
      return;
    }
    setDeleting(true);
    const resp = await deleteCollection(idCollection, idOrganization);
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

  useEffect(() => {
    if (!collection) return;
    if (collection.id) setIdCollection(collection.id);
  }, [collection, show]);
  return (
    <ModalComponent
      show={showModal}
      onSave={onDelete}
      title={'Delete Collection'}
      onCloseModal={() => {
        setDeleting(false);
        setValidation(null);
        setStrConfirmation('');
        setIdOrganization('');
        setIdCollection('');
        setAllowDelete(false);
        onClose();
      }}
      allowSave={allowDelete}
      savingRecord={deleting}
    >
      <p className="text-small">
        Please enter the words:{' '}
        <b>{`Delete ${
          collection && collection.name ? collection.name : ''
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
