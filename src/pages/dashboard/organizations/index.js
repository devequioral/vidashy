import Layout from '@/components/Layout';
import Metaheader from '@/components/Metaheader';
import TableComponent from '@/components/dashboard/TableComponent';
import { ThemeContext } from '@/contexts/ThemeContext';
import React, { useContext, useEffect } from 'react';
import BreadCrumbs from '@/components/dashboard/BreadCrumbs';
import { Chip } from '@nextui-org/react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { formatDate, capitalizeFirstLetter } from '@/utils/utils';
import Image from 'next/image';
import ModalComponent from '@/components/dashboard/ModalComponent';
import organizationModel from '@/models/organizationModel';
import { toast } from 'react-toastify';
import DetailRecord from '@/components/dashboard/DetailRecord';
import MediaUpload from '@/components/dashboard/MediaUpload';

async function getRecords(page = 1, pageSize = 5, status = 'all') {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/organizations/list?page=${page}&pageSize=${pageSize}&status=${status}`
  );
  return await res.json();
}

function ListOrganizations() {
  const [listRecords, setListRecords] = React.useState([]);
  const [totalPages, setTotalPages] = React.useState(1);
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(5);
  const [refreshTable, setRefreshTable] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const router = useRouter();
  const { status } = router.query;
  const [showModalProductDetail, setShowModalRecord] = React.useState(0);
  const [showModalChangeImage, setShowModalChangeImage] = React.useState(0);

  const [recordModal, setRecordModal] = React.useState(organizationModel);
  const [recordChange, setRecordChange] = React.useState(false);
  const [allowUploadImage, setAllowUploadImage] = React.useState(false);
  const [recordImage, setRecordImage] = React.useState(null);
  const [savingRecord, setSavingRecord] = React.useState(false);
  const [savingImage, setSavingImage] = React.useState(false);
  const [validation, setValidation] = React.useState({});

  const onRecordChange = (value) => {
    setRecordChange(value);
  };

  const onFieldChange = (key, value) => {
    const newRecord = { ...recordModal };
    newRecord[key] = value;
    setRecordModal(newRecord);
    setRecordChange(true);
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const fetchRecords = async () => {
        setLoading(true);
        const recordsBD = await getRecords(page, pageSize, status);

        if (
          recordsBD &&
          recordsBD.data &&
          recordsBD.data.records &&
          recordsBD.data.records.length > 0
        ) {
          setListRecords(
            recordsBD.data.records.map((record, index) => {
              return {
                ...record,
                key: index,
                date: record.createdAt,
              };
            })
          );
          setTotalPages(recordsBD.data.totalPages);
          setPage(recordsBD.data.page);
        } else {
          setListRecords([]);
          setTotalPages(1);
          setPage(1);
        }
        setLoading(false);
      };
      fetchRecords(page, pageSize);
    }
  }, [page, pageSize, status, refreshTable]);

  const { theme, toggleTheme } = useContext(ThemeContext);

  const showRecordDetail = (record) => {
    setRecordModal(record);
    setShowModalRecord((currCount) => currCount + 1);
  };

  const onNewProduct = () => {
    setRecordModal(organizationModel);
    setShowModalRecord((currCount) => currCount + 1);
  };

  const showChangeImage = (image) => {
    setShowModalChangeImage((currCount) => currCount + 1);
  };

  const saveRecord = async () => {
    if (savingRecord) return;
    setSavingRecord(true);
    const url = recordModal.id
      ? `${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/organizations/update`
      : `${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/organizations/new`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ record_request: recordModal }),
    });

    if (response.ok) {
      toast.success('Record saved');
      setShowModalRecord(0);
      setRefreshTable((currCount) => currCount + 1);
      setSavingRecord(false);
    } else {
      const { message, validation } = await response.json();
      if (validation) setValidation(validation);
      //toast.error(message);
      setSavingRecord(false);
    }
  };

  const uploadImage = async () => {
    if (savingImage) return;
    setSavingImage(true);
    const body = new FormData();
    body.append('file', recordImage);
    const response = await fetch(
      process.env.NEXT_PUBLIC_BASE_URL + '/api/admin/media/upload',
      {
        method: 'POST',
        body,
      }
    );

    if (response.ok) {
      const { url, fields, mediaKey, urlMedia } = await response.json();
      const formData = new FormData();
      Object.entries(fields).forEach(([key, value]) => {
        formData.append(key, value);
      });
      formData.append('file', recordImage);

      const uploadResponse = await fetch(url, {
        method: 'POST',
        body: formData,
      });

      if (uploadResponse.ok) {
        //toast.success('Image Saved');
        const newRecord = { ...recordModal };
        newRecord.image.src = urlMedia;
        setRecordModal(newRecord);
        setRecordChange(true);
      } else {
        toast.error('Error saving image');
      }
      setShowModalChangeImage(0);
      setSavingImage(false);
    } else {
      setSavingImage(false);
    }
  };

  const renderCell = React.useCallback((record, columnKey) => {
    const cellValue = record[columnKey];
    switch (columnKey) {
      case 'expand':
        return (
          <div
            className="expand-cell"
            onClick={() => {
              showRecordDetail(record);
            }}
          >
            <Image
              src="/assets/images/icon-expand.svg"
              width={12}
              height={12}
              alt=""
            />
          </div>
        );
      case 'status':
        const statusColorMap = {
          active: 'success',
          inactive: 'danger',
        };
        return (
          <>
            {cellValue ? (
              <Chip
                className="capitalize"
                color={statusColorMap[record.status]}
                size="sm"
                variant="flat"
              >
                {capitalizeFirstLetter(cellValue)}
              </Chip>
            ) : (
              <div></div>
            )}
          </>
        );

      case 'date':
        return <div>{formatDate(cellValue)}</div>;

      case 'id':
        return (
          <div
            style={{
              textDecoration: 'none',
              color: '#0070f0',
              cursor: 'pointer',
            }}
            onClick={() => {
              showRecordDetail(record);
            }}
          >
            {cellValue}
          </div>
        );

      default:
        return cellValue;
    }
  }, []);
  return (
    <>
      <Metaheader title="Organizations List | Vidashy" />
      <Layout theme={theme} toogleTheme={toggleTheme}>
        <BreadCrumbs
          theme={theme}
          data={{
            links: [
              { href: '/dashboard', title: 'Home' },
              { href: false, title: 'Organizations' },
            ],
          }}
        />
        <TableComponent
          data={{
            title: 'Organizations List',
            button: {
              label: 'New Organization',
              callback: () => {
                onNewProduct();
              },
            },
            columns: [
              { key: 'expand', label: '' },
              { key: 'id', label: 'Organization ID' },
              { key: 'name', label: 'Organization' },
              { key: 'date', label: 'Date' },
              { key: 'status', label: 'Status' },
            ],
            rows: listRecords,
            pagination: {
              total: totalPages,
              initialPage: page,
              isDisabled: loading,
              onChange: (page) => {
                setPage(page);
              },
            },
            renderCell,
          }}
        />
        <ModalComponent
          show={showModalProductDetail}
          onSave={saveRecord}
          title="Organization Details"
          onCloseModal={() => {
            onRecordChange(false);
          }}
          allowSave={recordChange}
          savingRecord={savingRecord}
        >
          <DetailRecord
            onRecordChange={(value) => {
              onRecordChange(value);
            }}
            record={recordModal}
            onFieldChange={(key, value) => {
              onFieldChange(key, value);
            }}
            onChangeImage={(image) => {
              showChangeImage(image);
            }}
            validation={validation}
            schema={{
              title: 'Organization Detail',
              fields: [
                {
                  key: 'id',
                  label: 'Organization ID',
                  type: 'hidden',
                },
                {
                  key: 'name',
                  label: 'Organization Name',
                  type: 'text',
                  isRequired: true,
                },
                {
                  key: 'status',
                  label: 'Status',
                  type: 'select',
                  isRequired: true,
                  items: [
                    { value: 'active', label: 'Active' },
                    { value: 'inactive', label: 'Inactive' },
                  ],
                },
              ],
            }}
          />
        </ModalComponent>
        <ModalComponent
          show={showModalChangeImage}
          onSave={uploadImage}
          title="Cambiar Imágen"
          onCloseModal={() => {
            setAllowUploadImage(false);
          }}
          allowSave={allowUploadImage}
          savingRecord={savingImage}
        >
          <MediaUpload
            onImageChange={(image) => {
              setRecordImage(image);
              setAllowUploadImage(true);
            }}
          />
        </ModalComponent>
      </Layout>
    </>
  );
}

ListOrganizations.auth = { adminOnly: true };
export default ListOrganizations;
