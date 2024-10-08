import { useEffect, useState } from 'react';
import ModalComponent from '@/components/dashboard/ModalComponent';
import { Input } from '@nextui-org/react';

async function deleteOrganization(id) {
  const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/organizations/delete?id=${id}`;
  return await fetch(url);
}

export default function ModalDeleteOrganization(props) {
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
    setDeleting(true);
    const resp = await deleteOrganization(idOrganization);
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
