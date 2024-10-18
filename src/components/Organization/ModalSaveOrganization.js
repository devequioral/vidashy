import { useEffect, useState } from 'react';
import ModalComponent from '@/components/dashboard/ModalComponent';
import { Input } from '@nextui-org/react';

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

export default function ModalSaveOrganization(props) {
  const { show, organization, title, onClose } = props;
  const [showModal, setShowModal] = useState(0);
  const [allowSaveOrganization, setAllowSaveOrganization] = useState(false);
  const [savingOrganization, setSavingOrganization] = useState(false);
  const [idOrganization, setIdOrganization] = useState('');
  const [nameNewOrganization, setNameNewOrganization] = useState('');
  const [validation, setValidation] = useState();
  const onSave = async () => {
    setSavingOrganization(true);
    const resp = await saveOrganization(idOrganization, nameNewOrganization);
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
